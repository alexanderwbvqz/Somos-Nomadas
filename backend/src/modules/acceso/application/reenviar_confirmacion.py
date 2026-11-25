from collections.abc import Callable
from datetime import datetime, timedelta
from uuid import uuid4

from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.confirmacion import HORAS_ENLACE_CONFIRMACION, CorreoPendiente, EnlaceNuevo, Idioma
from modules.acceso.domain.confirmacion_repository import ConfirmacionRepository
from modules.acceso.domain.cuenta import normalizar_correo, validar_correo
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import DatosInvalidos
from modules.acceso.domain.intentos import REENVIO_POR_CORREO, REENVIO_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos


class ReenviarConfirmacion:
    """Pide un enlace nuevo para confirmar el correo; el anterior deja de valer.

    Responde igual exista o no la cuenta, y esté o no confirmada: solo cambia si hay algo que enviar, y eso no sale
    de la API. Se hace el mismo trabajo en todos los casos (generar el token, una sola llamada a la base).
    """

    def __init__(
        self,
        *,
        confirmaciones: ConfirmacionRepository,
        emisor: EmisorTokens,
        limitador: LimitadorIntentos,
        ahora: Callable[[], datetime],
    ) -> None:
        self._confirmaciones = confirmaciones
        self._emisor = emisor
        self._limitador = limitador
        self._ahora = ahora

    def ejecutar(self, correo: str, origen: str, idioma: Idioma) -> CorreoPendiente | None:
        ahora = self._ahora()
        exigir_limite(self._limitador, "reenvio", origen, REENVIO_POR_ORIGEN, ahora)

        errores = validar_correo(correo)
        if errores:
            raise DatosInvalidos(errores)

        # Después del límite por origen: quien ya está bloqueado en su origen no gasta el cupo del correo de otra
        # persona. Cuenta tanto si el correo tiene cuenta como si no: si no, el límite delataría quién está registrado
        limpio = normalizar_correo(correo)
        exigir_limite(self._limitador, "reenvio", limpio, REENVIO_POR_CORREO, ahora)

        token = self._emisor.nuevo_token_confirmacion()
        enlace = EnlaceNuevo(
            id=uuid4(),
            token_hash=self._emisor.hash_de_token_confirmacion(token),
            expira_en=ahora + timedelta(hours=HORAS_ENLACE_CONFIRMACION),
            creada_en=ahora,
        )
        if not self._confirmaciones.renovar(limpio, enlace):
            return None
        return CorreoPendiente(destino=limpio, token=token, idioma=idioma)
