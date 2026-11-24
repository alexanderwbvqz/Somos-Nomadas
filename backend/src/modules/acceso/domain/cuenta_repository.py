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
