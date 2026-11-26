"""El enlace para confirmar el correo: de un solo uso, caduca en 15 minutos y del token solo se guarda su hash.

Si se abre en el mismo navegador donde se pidió (el que guarda la «marca del navegador»), además abre la sesión.
Spec: contrato/confirmacion-correo.md.
"""

import hmac
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Final, Literal
from uuid import UUID

MINUTOS_ENLACE_CONFIRMACION: Final = 15

# Idiomas en los que se escribe el correo (los mismos de la web)
Idioma = Literal["es", "en", "pt"]
IDIOMA_POR_DEFECTO: Final[Idioma] = "es"

# Forma de un token del enlace y de la marca del navegador (aleatorios, en base64 de URL). Un token sin esta forma no
# se busca en la base: es un enlace inválido sin más. Una marca sin esta forma se trata como si no hubiera marca
_FORMA_DEL_TOKEN: Final = re.compile(r"[A-Za-z0-9_-]{20,200}")


@dataclass(frozen=True)
class EnlaceNuevo:
    """Un enlace que se va a guardar: su id, el hash del token y sus fechas."""

    id: UUID
    token_hash: str
    expira_en: datetime
    creada_en: datetime
    # Huella de la marca del navegador que pidió el enlace; None si no llegó una marca válida
    navegador_hash: str | None


@dataclass(frozen=True)
class EnlaceUsado:
    """Lo que devuelve un enlace que acaba de confirmar el correo: de qué cuenta es y en qué navegador se pidió."""

    cuenta_id: UUID
    correo: str = field(repr=False)
    navegador_hash: str | None = field(repr=False)


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


def tiene_forma_de_marca(marca: str) -> bool:
    return _FORMA_DEL_TOKEN.fullmatch(marca) is not None


def es_el_mismo_navegador(guardado: str | None, recibido: str | None) -> bool:
    """El enlace se abre en el navegador que lo pidió: las dos huellas existen y son iguales. Sin huella guardada (un
    enlace de antes, o pedido sin marca) o sin marca al abrirlo, nunca."""
    if not guardado or not recibido:
        return False
    return hmac.compare_digest(guardado, recibido)
