from typing import Protocol
from uuid import UUID

from modules.acceso.domain.cuenta import Cuenta


class CuentaRepository(Protocol):
    def crear(self, cuenta: Cuenta) -> bool:
        """Guarda la cuenta. Devuelve False, sin cambiar nada, si el correo ya tenía cuenta (decisión atómica)."""
        ...

    def obtener_por_correo(self, correo: str) -> Cuenta | None:
        """El correo ya viene normalizado."""
        ...

    def obtener_por_id(self, cuenta_id: UUID) -> Cuenta | None: ...

    def actualizar_clave_hash(self, cuenta_id: UUID, hash_anterior: str, hash_nuevo: str) -> bool:
        """Cambia el hash de la clave SOLO si sigue siendo `hash_anterior` (decisión atómica). Devuelve False, sin
        cambiar nada, si la cuenta no existe o su hash ya era otro: así recalcular un hash viejo nunca pisa una
        clave que alguien acaba de cambiar."""
        ...
