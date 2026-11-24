"""Los tests de los casos de uso usan el entorno de infrastructure/memoria; aquí solo se ofrece como fixture."""

import pytest

from modules.acceso.infrastructure.memoria.entorno_de_pruebas import CLAVE, POLITICA, Entorno

__all__ = ["CLAVE", "POLITICA", "Entorno", "entorno"]


@pytest.fixture
def entorno() -> Entorno:
    return Entorno()
