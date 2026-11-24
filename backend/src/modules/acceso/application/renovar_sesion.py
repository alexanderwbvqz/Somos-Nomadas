from collections.abc import Callable
from datetime import datetime, timedelta
from uuid import uuid4

from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import NoAutenticado
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, ParDeTokens, Sesion
from modules.acceso.domain.sesion_repository import SesionRepository


class RenovarSesion:
    """Cambia un token de renovación por un par nuevo. El token usado queda revocado (rotación).

    Presentar un token que ya estaba revocado significa que se usó dos veces: se toma por robo y se cierran todas
    las sesiones de la cuenta. Un token caducado solo se rechaza.
    """

    def __init__(self, *, sesiones: SesionRepository, emisor: EmisorTokens, ahora: Callable[[], datetime]) -> None:
        self._sesiones = sesiones
        self._emisor = emisor
        self._ahora = ahora

    def ejecutar(self, token_renovacion: str) -> ParDeTokens:
        ahora = self._ahora()
        actual = self._sesiones.obtener_por_token_hash(self._emisor.hash_de_token_renovacion(token_renovacion))
        if actual is None:
            raise NoAutenticado("Sesión no válida")
        if actual.revocada_en is not None:
            self._sesiones.revocar_todas_de_cuenta(actual.cuenta_id)
            raise NoAutenticado("Sesión no válida")
        if ahora >= actual.expira_en:
            raise NoAutenticado("Sesión no válida")

        nuevo_token = self._emisor.nuevo_token_renovacion()
        nueva = Sesion(
            id=uuid4(),
            cuenta_id=actual.cuenta_id,
            token_hash=self._emisor.hash_de_token_renovacion(nuevo_token),
            expira_en=ahora + timedelta(days=DIAS_TOKEN_RENOVACION),
            creada_en=ahora,
        )
        if not self._sesiones.rotar(actual, nueva):
            # Otra petición usó este mismo token entre la lectura y la rotación: es un reúso
            self._sesiones.revocar_todas_de_cuenta(actual.cuenta_id)
            raise NoAutenticado("Sesión no válida")

        acceso = self._emisor.emitir_acceso(actual.cuenta_id, ahora)
        return ParDeTokens(acceso.valor, acceso.expira_en_segundos, nuevo_token)
