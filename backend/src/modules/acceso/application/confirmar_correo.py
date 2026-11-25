from collections.abc import Callable
from datetime import datetime

from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.domain.confirmacion import tiene_forma_de_token
from modules.acceso.domain.confirmacion_repository import ConfirmacionRepository
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import EnlaceInvalido
from modules.acceso.domain.intentos import CONFIRMACION_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos


class ConfirmarCorreo:
    """Usa el enlace del correo: si vale, confirma el correo de la cuenta y devuelve ese correo.

    No abre ninguna sesión: después, la persona entra con su correo y su clave. Un enlace que no vale (desconocido,
    usado, caducado o anulado) da siempre el mismo error, sin decir por qué.
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

    def ejecutar(self, token: str, origen: str) -> str:
        ahora = self._ahora()
        exigir_limite(self._limitador, "confirmacion", origen, CONFIRMACION_POR_ORIGEN, ahora)

        # Lo que no tiene forma de token no se busca: no puede ser un enlace nuestro
        if not tiene_forma_de_token(token):
            raise EnlaceInvalido("Enlace inválido")
        correo = self._confirmaciones.confirmar(self._emisor.hash_de_token_confirmacion(token), ahora)
        if correo is None:
            raise EnlaceInvalido("Enlace inválido")
        return correo
