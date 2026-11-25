from datetime import datetime
from typing import Protocol
from uuid import UUID

from modules.acceso.domain.sesion import MotivoRevocacion, Sesion


class SesionRepository(Protocol):
    """Todas las fechas las pone la aplicación (el `ahora` que se pasa), nunca el reloj de la base de datos.

    Así `creada_en`, `expira_en` y `revocada_en` salen del mismo reloj y se pueden comparar entre sí (la tolerancia de
    `RenovarSesion` compara `ahora` con `revocada_en`). Con relojes distintos, unos segundos de diferencia bastan para
    acortar o alargar la tolerancia.
    """

    def guardar(self, sesion: Sesion) -> None: ...

    def obtener_por_token_hash(self, token_hash: str) -> Sesion | None: ...

    def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
        """Revoca la anterior (motivo `rotada`) y guarda la nueva en un solo paso atómico.

        La anterior se revoca en el instante en que nace la nueva: `nueva.creada_en`.
        Devuelve False, sin cambiar nada, si la anterior ya estaba revocada: otra petición la rotó antes.
        """
        ...

    def revocar(self, sesion_id: UUID, ahora: datetime) -> None:
        """Cierra la sesión (motivo `cerrada`). Si ya estaba revocada no cambia nada: conserva su fecha y su motivo."""
        ...

    def revocar_todas_de_cuenta(self, cuenta_id: UUID, motivo: MotivoRevocacion, ahora: datetime) -> None:
        """Revoca las sesiones que sigan abiertas. Las ya revocadas conservan su fecha y su motivo."""
        ...
