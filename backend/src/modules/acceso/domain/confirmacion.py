"""El enlace para confirmar el correo: de un solo uso, caduca en 24 horas y del token solo se guarda su hash.

Spec: contrato/confirmacion-correo.md.
"""

import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Final, Literal
from uuid import UUID

HORAS_ENLACE_CONFIRMACION: Final = 24

# Idiomas en los que se escribe el correo (los mismos de la web)
Idioma = Literal["es", "en", "pt"]
IDIOMA_POR_DEFECTO: Final[Idioma] = "es"

# Forma de un token del enlace (aleatorio, en base64 de URL). Lo que no tenga esta forma no se busca en la base:
# es un enlace inválido sin más
_FORMA_DEL_TOKEN: Final = re.compile(r"[A-Za-z0-9_-]{20,200}")


@dataclass(frozen=True)
class EnlaceNuevo:
    """Un enlace que se va a guardar: su id, el hash del token y sus fechas."""

    id: UUID
    token_hash: str
    expira_en: datetime
    creada_en: datetime


@dataclass(frozen=True)
class CorreoPendiente:
    """Hay que enviar a `destino` el enlace con `token`, en `idioma`.

    Lleva el token en claro porque va en el enlace: solo vive hasta enviarse, no se guarda en ningún sitio y no sale
    en `repr` (así no acaba en un registro por un descuido).
    """

    destino: str = field(repr=False)
    token: str = field(repr=False)
    idioma: Idioma


def tiene_forma_de_token(token: str) -> bool:
    return _FORMA_DEL_TOKEN.fullmatch(token) is not None
