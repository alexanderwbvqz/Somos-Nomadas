from typing import Protocol
from uuid import UUID

from modules.acceso.domain.sesion import MotivoRevocacion, Sesion


class SesionRepository(Protocol):
    def guardar(self, sesion: Sesion) -> None: ...

    def obtener_por_token_hash(self, token_hash: str) -> Sesion | None: ...

    def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
        """Revoca la anterior (motivo `rotada`) y guarda la nueva en un solo paso atómico.

        Devuelve False, sin cambiar nada, si la anterior ya estaba revocada: otra petición la rotó antes.
        """
        ...

    def revocar(self, sesion_id: UUID) -> None:
        """Cierra la sesión (motivo `cerrada`). Si ya estaba revocada no cambia nada: se conserva el motivo original."""
        ...

    def revocar_todas_de_cuenta(self, cuenta_id: UUID, motivo: MotivoRevocacion) -> None:
        """Revoca las sesiones que sigan abiertas. Las ya revocadas conservan su fecha y su motivo."""
        ...
