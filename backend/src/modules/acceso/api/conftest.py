"""Los tests de la API arman la app con los casos de uso sobre repositorios en memoria."""

from collections.abc import Callable

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from modules.acceso.api.manejadores import registrar_manejadores_acceso
from modules.acceso.api.rutas import crear_router
from modules.acceso.infrastructure.memoria.entorno_de_pruebas import CLAVE, Entorno
from shared.http.manejadores import instalar_manejadores_base
from shared.http.origen import crear_resolutor_de_origen

__all__ = ["CLAVE", "Entorno", "Fabrica", "cliente", "entorno", "fabrica"]

Fabrica = Callable[..., TestClient]


@pytest.fixture
def entorno() -> Entorno:
    return Entorno()


@pytest.fixture
def fabrica(entorno: Entorno) -> Fabrica:
    """Construye el cliente de pruebas; cada argumento puede sustituir un caso de uso (por ejemplo, uno que falle)."""

    def construir(*, origen: str = "203.0.113.7", secreto_interno: str = "", **casos: object) -> TestClient:
        app = FastAPI()
        instalar_manejadores_base(app)
        registrar_manejadores_acceso(app)
        app.include_router(
            crear_router(
                **{  # type: ignore[arg-type]
                    "registrar_cuenta": entorno.registrar_cuenta(),
                    "iniciar_sesion": entorno.iniciar_sesion(),
                    "renovar_sesion": entorno.renovar_sesion(),
                    "cerrar_sesion": entorno.cerrar_sesion(),
                    "obtener_cuenta_actual": entorno.obtener_cuenta_actual(),
                    "origen_de": crear_resolutor_de_origen(secreto_interno),
                    **casos,
                }
            )
        )
        return TestClient(app, raise_server_exceptions=False, client=(origen, 50000))

    return construir


@pytest.fixture
def cliente(fabrica: Fabrica) -> TestClient:
    return fabrica()
