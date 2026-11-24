from datetime import datetime
from typing import Protocol
from uuid import UUID

from modules.acceso.domain.sesion import TokenAcceso


class EmisorTokens(Protocol):
    def emitir_acceso(self, cuenta_id: UUID, ahora: datetime) -> TokenAcceso: ...

    def validar_acceso(self, token: str, ahora: datetime) -> UUID | None:
        """El id de la cuenta si el token tiene firma válida y no caducó; None en cualquier otro caso."""
        ...

    def nuevo_token_renovacion(self) -> str:
        """Un token opaco, largo y aleatorio."""
        ...

    def hash_de_token_renovacion(self, token: str) -> str: ...
