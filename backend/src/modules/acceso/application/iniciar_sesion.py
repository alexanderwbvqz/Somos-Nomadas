from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import uuid4

from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.cuenta import DatosInicioSesion, normalizar_correo, validar_inicio_sesion
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import CorreoSinConfirmar, CredencialesInvalidas, DatosInvalidos
from modules.acceso.domain.hasheador_claves import HasheadorClaves
from modules.acceso.domain.intentos import SESION_POR_CORREO, SESION_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, ParDeTokens, Sesion
from modules.acceso.domain.sesion_repository import SesionRepository


@dataclass(frozen=True)
class SesionIniciada:
    tokens: ParDeTokens
    correo: str


class IniciarSesion:
    """Comprueba el correo y la clave y abre una sesión.

    Si falla el correo o falla la clave el error es el mismo y tarda lo mismo. El correo sin confirmar solo se
    avisa cuando la clave es correcta: antes sería revelar que la cuenta existe.
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
        exigir_limite(self._limitador, "sesion", correo, SESION_POR_CORREO, ahora)

        cuenta = self._cuentas.obtener_por_correo(correo)
        # Sin cuenta se verifica contra nada: gasta el mismo tiempo y no se nota si el correo existe
        clave_correcta = self._hasheador.verificar(datos.clave, cuenta.clave_hash if cuenta else None)
        if cuenta is None or not clave_correcta:
            raise CredencialesInvalidas("Correo o contraseña incorrectos")

        if self._exigir_correo_confirmado and not cuenta.correo_confirmado:
            raise CorreoSinConfirmar("El correo aún no se confirmó")

        acceso = self._emisor.emitir_acceso(cuenta.id, ahora)
        token_renovacion = self._emisor.nuevo_token_renovacion()
        self._sesiones.guardar(
            Sesion(
                id=uuid4(),
                cuenta_id=cuenta.id,
                token_hash=self._emisor.hash_de_token_renovacion(token_renovacion),
                expira_en=ahora + timedelta(days=DIAS_TOKEN_RENOVACION),
                creada_en=ahora,
            )
        )
        tokens = ParDeTokens(acceso.valor, acceso.expira_en_segundos, token_renovacion)
        return SesionIniciada(tokens=tokens, correo=cuenta.correo)
