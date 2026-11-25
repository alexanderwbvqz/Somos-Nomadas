"""La sesión es el token de renovación: de 30 días, opaco, guardado solo con hash y rotado en cada uso."""

from dataclasses import dataclass
from datetime import datetime
from typing import Final, Literal
from uuid import UUID

SEGUNDOS_TOKEN_ACCESO: Final = 15 * 60
DIAS_TOKEN_RENOVACION: Final = 30

# Por qué se revocó una sesión. Solo presentar un token ROTADO puede ser un robo: uno cerrado por la persona no.
#   rotada:  se cambió por un token nuevo al renovar (lo normal)
#   cerrada: la persona cerró sesión
#   robo:    se cerró junto con todas las de su cuenta al detectar que un token rotado se reutilizó
MotivoRevocacion = Literal["rotada", "cerrada", "robo"]

# Dos peticiones casi a la vez con el mismo token (dos de Next, un reintento de red) hacen que la segunda llegue con el
# token ya rotado. Dentro de este margen se rechaza (401) sin tomarlo por robo; pasado el margen sí.
TOLERANCIA_REUSO_SEGUNDOS: Final = 10


@dataclass(frozen=True)
class Sesion:
    id: UUID
    cuenta_id: UUID
    # Hash del token de renovación; el token en sí nunca se guarda
    token_hash: str
    expira_en: datetime
    creada_en: datetime
    revocada_en: datetime | None = None
    motivo_revocacion: MotivoRevocacion | None = None

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
