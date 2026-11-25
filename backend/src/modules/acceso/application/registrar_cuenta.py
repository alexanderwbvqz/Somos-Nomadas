from collections.abc import Callable
from datetime import datetime, timedelta
from uuid import uuid4

from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.confirmacion import (
    HORAS_ENLACE_CONFIRMACION,
    IDIOMA_POR_DEFECTO,
    CorreoPendiente,
    EnlaceNuevo,
    Idioma,
)
from modules.acceso.domain.confirmacion_repository import ConfirmacionRepository
from modules.acceso.domain.cuenta import Cuenta, DatosRegistro, es_robot_registro, normalizar_correo, validar_registro
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import DatosInvalidos
from modules.acceso.domain.hasheador_claves import HasheadorClaves
from modules.acceso.domain.intentos import REGISTRO_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos


class RegistrarCuenta:
    """Valida otra vez, en el servidor, lo que mandó el navegador; si todo está bien crea la cuenta sin confirmar y su
    enlace de confirmación, y devuelve el correo que hay que enviar.

    Si el correo ya tenía cuenta no falla ni lo dice: quien lo escribió no debe poder averiguar quién está registrado.
    Por eso se hace el mismo trabajo en los dos casos (hashear la clave, generar el token, una sola llamada a la base)
    y no se devuelve nada que enviar. El envío lo hace quien llama, después de responder.
    """

    def __init__(
        self,
        *,
        confirmaciones: ConfirmacionRepository,
        hasheador: HasheadorClaves,
        emisor: EmisorTokens,
        limitador: LimitadorIntentos,
        ahora: Callable[[], datetime],
        politica_version: str,
    ) -> None:
        self._confirmaciones = confirmaciones
        self._hasheador = hasheador
        self._emisor = emisor
        self._limitador = limitador
        self._ahora = ahora
        self._politica_version = politica_version

    def ejecutar(
        self, datos: DatosRegistro, origen: str, idioma: Idioma = IDIOMA_POR_DEFECTO
    ) -> CorreoPendiente | None:
        # Un robot rellena el campo trampa: se responde como si todo hubiera ido bien, sin crear nada
        if es_robot_registro(datos):
            return None

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
        token = self._emisor.nuevo_token_confirmacion()
        enlace = EnlaceNuevo(
            id=uuid4(),
            token_hash=self._emisor.hash_de_token_confirmacion(token),
            expira_en=ahora + timedelta(hours=HORAS_ENLACE_CONFIRMACION),
            creada_en=ahora,
        )
        # False si el correo ya existía: no se crea nada y no hay nada que enviar
        if not self._confirmaciones.crear_cuenta_con_confirmacion(cuenta, enlace):
            return None
        return CorreoPendiente(destino=cuenta.correo, token=token, idioma=idioma)
