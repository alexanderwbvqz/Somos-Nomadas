import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field

from shared.http.cors import instalar_cors
from shared.http.errores import respuesta_de_error
from shared.http.manejadores import instalar_manejadores_base


class Entrada(BaseModel):
    model_config = ConfigDict(strict=True)

    correo: str = Field(max_length=20)
    edad: int


def app_de_prueba() -> FastAPI:
    app = FastAPI()
    instalar_manejadores_base(app)

    @app.post("/eco")
    def eco(entrada: Entrada) -> dict[str, str]:
        return {"correo": entrada.correo}

    @app.get("/roto")
    def roto() -> None:
        raise RuntimeError("secreto: ana@correo.com y clave-9")

    return app


def cliente() -> TestClient:
    return TestClient(app_de_prueba(), raise_server_exceptions=False)


# --- Formato de error ---


def test_el_formato_de_error_lleva_el_codigo_y_lo_extra() -> None:
    respuesta = respuesta_de_error(429, "limite_excedido", cabeceras={"Retry-After": "60"}, otro="dato")

    assert respuesta.status_code == 429
    assert respuesta.headers["retry-after"] == "60"
    assert respuesta.body == b'{"codigo":"limite_excedido","otro":"dato"}'


# --- Validación de forma (lo que pydantic rechaza antes de llegar al dominio) ---


def test_un_campo_que_falta_es_obligatorio() -> None:
    r = cliente().post("/eco", json={"correo": "a@b.co"})

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {"edad": "obligatorio"}}


def test_un_tipo_equivocado_o_un_valor_demasiado_largo_es_invalido() -> None:
    r = cliente().post("/eco", json={"correo": "a" * 21, "edad": "diez"})

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {"correo": "invalido", "edad": "invalido"}}


def test_un_cuerpo_que_no_es_json_es_invalido() -> None:
    r = cliente().post("/eco", content=b"esto no es json", headers={"content-type": "application/json"})

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {}}  # no hay un campo al que culpar


def test_el_error_de_validacion_nunca_devuelve_lo_que_se_envio() -> None:
    # El formato por defecto de FastAPI repite el valor enviado: aquí sería una clave
    r = cliente().post("/eco", json={"correo": "clave-super-secreta-9" + "x" * 20, "edad": 1})

    assert "clave-super-secreta" not in r.text


# --- Errores inesperados y rutas que no existen ---


def test_un_error_inesperado_responde_fallo_sin_detalles() -> None:
    r = cliente().get("/roto")

    assert r.status_code == 500
    assert r.json() == {"codigo": "fallo"}
    assert "ana@correo.com" not in r.text and "clave-9" not in r.text


def test_un_error_inesperado_se_registra_sin_el_mensaje(caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.ERROR, logger="nomadas"):
        cliente().get("/roto")

    registrado = " ".join(r.getMessage() for r in caplog.records)
    assert "RuntimeError" in registrado and "/roto" in registrado
    assert "ana@correo.com" not in registrado and "clave-9" not in registrado
    assert all(r.exc_info is None for r in caplog.records)  # el traceback puede traer datos de la petición


def test_una_ruta_que_no_existe_es_404_con_nuestro_formato() -> None:
    r = cliente().get("/no-existe")

    assert r.status_code == 404
    assert r.json() == {"codigo": "no_encontrado"}


def test_un_metodo_no_permitido_es_405_con_nuestro_formato() -> None:
    r = cliente().get("/eco")

    assert r.status_code == 405
    assert r.json() == {"codigo": "metodo_no_permitido"}


# --- CORS ---


def con_cors() -> TestClient:
    app = app_de_prueba()
    instalar_cors(app, ["https://nomadas.example"])
    return TestClient(app, raise_server_exceptions=False)


def test_cors_permite_el_origen_propio() -> None:
    r = con_cors().options(
        "/eco",
        headers={
            "Origin": "https://nomadas.example",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )

    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "https://nomadas.example"
    assert "authorization" in r.headers["access-control-allow-headers"].lower()


def test_cors_no_permite_un_origen_ajeno() -> None:
    r = con_cors().options("/eco", headers={"Origin": "https://malo.example", "Access-Control-Request-Method": "POST"})

    assert "access-control-allow-origin" not in r.headers


def test_cors_no_usa_comodin_ni_credenciales() -> None:
    r = con_cors().get("/no-existe", headers={"Origin": "https://nomadas.example"})

    assert r.headers["access-control-allow-origin"] == "https://nomadas.example"
    assert "access-control-allow-credentials" not in r.headers


def test_cors_ignora_los_origenes_vacios_de_la_configuracion() -> None:
    app = app_de_prueba()
    instalar_cors(app, ["", "  ", "https://nomadas.example"])

    r = TestClient(app).get("/no-existe", headers={"Origin": "https://nomadas.example"})

    assert r.headers["access-control-allow-origin"] == "https://nomadas.example"


def test_cors_rechaza_un_metodo_que_la_api_no_usa() -> None:
    r = con_cors().options(
        "/eco", headers={"Origin": "https://nomadas.example", "Access-Control-Request-Method": "DELETE"}
    )

    assert r.status_code == 400


def test_cors_no_confunde_un_origen_vacio_con_uno_permitido() -> None:
    app = app_de_prueba()
    instalar_cors(app, ["", "https://nomadas.example"])

    r = TestClient(app).get("/no-existe", headers={"Origin": ""})

    assert "access-control-allow-origin" not in r.headers
