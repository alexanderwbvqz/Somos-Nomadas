"""Los tests de los casos de uso usan el entorno de infrastructure/memoria; aquí solo se ofrece como fixture."""

import pytest

from modules.acceso.infrastructure.memoria.entorno_de_pruebas import CLAVE, POLITICA, CuentasQue, Entorno

__all__ = ["CLAVE", "POLITICA", "CuentasQue", "Entorno", "entorno"]


@pytest.fixture
def entorno() -> Entorno:
    return Entorno()
