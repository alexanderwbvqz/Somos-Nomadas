import contextlib
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from modules.acceso.application.abrir_sesion import abrir_sesion
from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.cuenta import Cuenta, DatosInicioSesion, normalizar_correo, validar_inicio_sesion
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import CorreoSinConfirmar, CredencialesInvalidas, DatosInvalidos
from modules.acceso.domain.hasheador_claves import HasheadorClaves
from modules.acceso.domain.intentos import SESION_POR_CORREO_TOTAL, SESION_POR_CORREO_Y_ORIGEN, SESION_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos
from modules.acceso.domain.sesion import ParDeTokens
from modules.acceso.domain.sesion_repository import SesionRepository


@dataclass(frozen=True)
class SesionIniciada:
    tokens: ParDeTokens
    correo: str


class IniciarSesion:
    """Comprueba el correo y la clave y abre una sesión.

    Si falla el correo o falla la clave el error es el mismo y tarda lo mismo. El correo sin confirmar solo se
    avisa cuando la clave es correcta: antes sería revelar que la cuenta existe.

    Al entrar con éxito es también el único momento en que se tiene la clave en claro: si el hash guardado se hizo con
    parámetros más flojos que los actuales, se vuelve a hashear y se guarda, sin que la persona note nada.
    """

    def __init__(
        self,
        *,
        cuentas: CuentaRepository,
        sesiones: SesionRepository,
        hasheador: HasheadorClaves,
        emisor: EmisorTokens,
        limitador: LimitadorIntentos,
        ahora: Callable[[], datetime],
        exigir_correo_confirmado: bool,
    ) -> None:
        self._cuentas = cuentas
        self._sesiones = sesiones
        self._hasheador = hasheador
        self._emisor = emisor
        self._limitador = limitador
        self._ahora = ahora
        self._exigir_correo_confirmado = exigir_correo_confirmado

    def ejecutar(self, datos: DatosInicioSesion, origen: str) -> SesionIniciada:
        ahora = self._ahora()
        exigir_limite(self._limitador, "sesion", origen, SESION_POR_ORIGEN, ahora)

        errores = validar_inicio_sesion(datos)
        if errores:
            raise DatosInvalidos(errores)

        correo = normalizar_correo(datos.correo)
        # Primero la pareja (correo, origen) y después el techo por correo: quien ya está bloqueado en su pareja no
        # gasta el techo, y así nadie puede usar el correo de otra persona para dejarla fuera. El espacio separa las
        # dos partes sin ambigüedad: un correo válido no puede llevar espacios.
        exigir_limite(self._limitador, "sesion", f"{correo} {origen}", SESION_POR_CORREO_Y_ORIGEN, ahora)
        exigir_limite(self._limitador, "sesion", correo, SESION_POR_CORREO_TOTAL, ahora)

        cuenta = self._cuentas.obtener_por_correo(correo)
        # Sin cuenta se verifica contra nada: gasta el mismo tiempo y no se nota si el correo existe
        clave_correcta = self._hasheador.verificar(datos.clave, cuenta.clave_hash if cuenta else None)
        if cuenta is None or not clave_correcta:
            raise CredencialesInvalidas("Correo o contraseña incorrectos")

        if self._exigir_correo_confirmado and not cuenta.correo_confirmado:
            raise CorreoSinConfirmar("El correo aún no se confirmó")

        self._recalcular_hash_si_hace_falta(cuenta, datos.clave)

        tokens = abrir_sesion(cuenta.id, sesiones=self._sesiones, emisor=self._emisor, ahora=ahora)
        return SesionIniciada(tokens=tokens, correo=cuenta.correo)

    def _recalcular_hash_si_hace_falta(self, cuenta: Cuenta, clave: str) -> None:
        if not self._hasheador.necesita_recalcular(cuenta.clave_hash):
            return
        # Mejora opcional: si falla (la base no responde) o el hash ya cambió (la guardada devuelve False porque otra
        # petición se adelantó, o la clave se cambió en medio), la persona entra igual y se reintenta la próxima vez
        with contextlib.suppress(Exception):
            self._cuentas.actualizar_clave_hash(cuenta.id, cuenta.clave_hash, self._hasheador.hashear(clave))
