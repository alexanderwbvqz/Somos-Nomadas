"""La sesión es el token de renovación: de 30 días, opaco, guardado solo con hash y rotado en cada uso."""

from dataclasses import dataclass
from datetime import datetime
from typing import Final
from uuid import UUID

SEGUNDOS_TOKEN_ACCESO: Final = 15 * 60
DIAS_TOKEN_RENOVACION: Final = 30


@dataclass(frozen=True)
class Sesion:
    id: UUID
    cuenta_id: UUID
    # Hash del token de renovación; el token en sí nunca se guarda
    token_hash: str
    expira_en: datetime
    creada_en: datetime
    revocada_en: datetime | None = None

    def esta_vigente(self, ahora: datetime) -> bool:
        return self.revocada_en is None and ahora < self.expira_en


@dataclass(frozen=True)
class TokenAcceso:
    valor: str
    expira_en_segundos: int


@dataclass(frozen=True)
class ParDeTokens:
    token_acceso: str
    expira_en_segundos: int
    token_renovacion: str
