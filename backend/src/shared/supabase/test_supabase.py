import httpx
import pytest
from postgrest.exceptions import APIError
from supabase import Client

from shared.supabase.cliente import crear_cliente
from shared.supabase.errores import ErrorDeBaseDeDatos, traducir_errores

CLAVE_DE_SERVIDOR = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.SECRETO-DE-SERVIDOR"


# --- Cliente ---


def test_crea_el_cliente_con_la_url_y_la_clave() -> None:
    cliente = crear_cliente("https://abcdefgh.supabase.co", CLAVE_DE_SERVIDOR)

    assert isinstance(cliente, Client)


def test_acepta_http_solo_en_localhost_para_pruebas_locales() -> None:
    assert isinstance(crear_cliente("http://localhost:54321", CLAVE_DE_SERVIDOR), Client)
    assert isinstance(crear_cliente("http://127.0.0.1:54321", CLAVE_DE_SERVIDOR), Client)


@pytest.mark.parametrize(
    "url",
    ["", "   ", "no-es-una-url", "http://abcdefgh.supabase.co", "ftp://abcdefgh.supabase.co", "https://"],
)
def test_rechaza_una_url_vacia_mal_formada_o_http_fuera_de_localhost(url: str) -> None:
    # Con http la clave de servidor viajaría sin cifrar
    with pytest.raises(ValueError):
        crear_cliente(url, CLAVE_DE_SERVIDOR)


@pytest.mark.parametrize("clave", ["", "   "])
def test_rechaza_una_clave_vacia(clave: str) -> None:
    with pytest.raises(ValueError):
        crear_cliente("https://abcdefgh.supabase.co", clave)


def test_los_errores_de_configuracion_nunca_incluyen_la_clave() -> None:
    for url in ["", "http://abcdefgh.supabase.co"]:
        with pytest.raises(ValueError) as error:
            crear_cliente(url, CLAVE_DE_SERVIDOR)
        assert CLAVE_DE_SERVIDOR not in str(error.value)
        assert "SECRETO-DE-SERVIDOR" not in repr(error.value)


# --- Traducción de errores ---


def api_error(codigo: str = "23505") -> APIError:
    return APIError(
        {
            "code": codigo,
            "message": "duplicate key value violates unique constraint",
            "details": "Key (correo)=(ana@correo.com) already exists.",
            "hint": None,
        }
    )


def test_sin_error_no_hace_nada() -> None:
    with traducir_errores():
        pass


def test_un_error_de_postgrest_conserva_solo_el_codigo_y_nunca_el_mensaje() -> None:
    with pytest.raises(ErrorDeBaseDeDatos) as error, traducir_errores():
        raise api_error("23505")

    assert error.value.codigo == "23505"
    # El texto original lleva el valor duplicado: un correo. No puede viajar en el error ni en su causa
    assert "ana@correo.com" not in str(error.value) + repr(error.value)
    assert error.value.__cause__ is None
    assert error.value.__suppress_context__


@pytest.mark.parametrize(
    "fallo",
    [
        httpx.ConnectError("sin red a ana@correo.com"),
        httpx.ReadTimeout("tardó demasiado"),
        httpx.RemoteProtocolError("x"),
    ],
)
def test_un_fallo_de_red_se_traduce_a_codigo_red(fallo: Exception) -> None:
    with pytest.raises(ErrorDeBaseDeDatos) as error, traducir_errores():
        raise fallo

    assert error.value.codigo == "red"
    assert "ana@correo.com" not in str(error.value) + repr(error.value)


def test_un_error_que_no_es_de_la_base_se_propaga_sin_tocar() -> None:
    with pytest.raises(ValueError, match="mio"), traducir_errores():
        raise ValueError("mio")
