"""Política de límite de intentos: cuántos y en qué ventana. Los valores son una primera propuesta."""

from dataclasses import dataclass
from typing import Final


@dataclass(frozen=True)
class PoliticaIntentos:
    maximo: int
    ventana_segundos: int


# Por correo y por IP, en cada acción
REGISTRO_POR_ORIGEN: Final = PoliticaIntentos(maximo=5, ventana_segundos=60 * 60)
SESION_POR_CORREO: Final = PoliticaIntentos(maximo=5, ventana_segundos=15 * 60)
SESION_POR_ORIGEN: Final = PoliticaIntentos(maximo=20, ventana_segundos=15 * 60)
