from collections.abc import Callable
from datetime import datetime

from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.sesion_repository import SesionRepository


class CerrarSesion:
    """Revoca la sesión de ese token de renovación. Si no existe o ya estaba cerrada no hace nada ni avisa."""

    def __init__(self, *, sesiones: SesionRepository, emisor: EmisorTokens, ahora: Callable[[], datetime]) -> None:
        self._sesiones = sesiones
        self._emisor = emisor
        self._ahora = ahora

    def ejecutar(self, token_renovacion: str) -> None:
        sesion = self._sesiones.obtener_por_token_hash(self._emisor.hash_de_token_renovacion(token_renovacion))
        if sesion is not None:
            self._sesiones.revocar(sesion.id, self._ahora())
