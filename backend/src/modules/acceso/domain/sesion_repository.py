from typing import Protocol
from uuid import UUID

from modules.acceso.domain.sesion import Sesion


class SesionRepository(Protocol):
    def guardar(self, sesion: Sesion) -> None: ...

    def obtener_por_token_hash(self, token_hash: str) -> Sesion | None: ...

    def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
        """Revoca la anterior y guarda la nueva en un solo paso atómico.

        Devuelve False, sin cambiar nada, si la anterior ya estaba revocada: es un token usado dos veces.
        """
        ...

    def revocar(self, sesion_id: UUID) -> None: ...

    def revocar_todas_de_cuenta(self, cuenta_id: UUID) -> None: ...
