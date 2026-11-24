from collections.abc import Callable
from datetime import datetime
from uuid import uuid4

from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.cuenta import Cuenta, DatosRegistro, es_robot_registro, normalizar_correo, validar_registro
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.errores import DatosInvalidos
from modules.acceso.domain.hasheador_claves import HasheadorClaves
from modules.acceso.domain.intentos import REGISTRO_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos


class RegistrarCuenta:
    """Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien crea la cuenta sin confirmar.

    Si el correo ya tenía cuenta no falla ni lo dice: quien lo escribió no debe poder averiguar quién está
    registrado. La clave se hashea siempre, exista o no la cuenta, para que tarde lo mismo.
    """

    def __init__(
        self,
        *,
        cuentas: CuentaRepository,
        hasheador: HasheadorClaves,
        limitador: LimitadorIntentos,
        ahora: Callable[[], datetime],
        politica_version: str,
    ) -> None:
        self._cuentas = cuentas
        self._hasheador = hasheador
        self._limitador = limitador
        self._ahora = ahora
        self._politica_version = politica_version

    def ejecutar(self, datos: DatosRegistro, origen: str) -> None:
        # Un robot rellena el campo trampa: se responde como si todo hubiera ido bien, sin crear nada
        if es_robot_registro(datos):
            return

        ahora = self._ahora()
        exigir_limite(self._limitador, "registro", origen, REGISTRO_POR_ORIGEN, ahora)

        errores = validar_registro(datos)
        if errores:
            raise DatosInvalidos(errores)

        cuenta = Cuenta(
            id=uuid4(),
            correo=normalizar_correo(datos.correo),
            clave_hash=self._hasheador.hashear(datos.clave),
            correo_confirmado=False,
            politica_aceptada_en=ahora,
            politica_version=self._politica_version,
            creada_en=ahora,
        )
        self._cuentas.crear(cuenta)  # False si el correo ya existía: se ignora a propósito
