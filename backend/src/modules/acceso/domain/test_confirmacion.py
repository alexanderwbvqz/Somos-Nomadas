from uuid import uuid4

import pytest

from modules.acceso.domain.confirmacion import CorreoPendiente, tiene_forma_de_token
from modules.acceso.domain.cuenta import validar_correo


def test_el_correo_pendiente_no_muestra_ni_el_token_ni_el_correo_al_imprimirlo() -> None:
    pendiente = CorreoPendiente(destino="ana@correo.com", token="token-secreto-0123456789", idioma="es")

    texto = repr(pendiente) + str(pendiente)

    assert "token-secreto-0123456789" not in texto
    assert "ana@correo.com" not in texto
    assert "es" in texto


@pytest.mark.parametrize(
    "token",
    [
        "a" * 20,
        "A" * 200,
        "aZ09_-" * 4,
        # Lo que da secrets.token_urlsafe(32): 43 caracteres de base64 de URL
        "kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8",
    ],
)
def test_tienen_forma_de_token_los_textos_de_base64_de_url_de_20_a_200(token: str) -> None:
    assert tiene_forma_de_token(token)


@pytest.mark.parametrize(
    "token",
    [
        "",
        "a" * 19,
        "a" * 201,
        "con espacio aaaaaaaaaaaaaa",
        "con/barra/aaaaaaaaaaaaaaa",
        "punto.aaaaaaaaaaaaaaaaaa",
        "acentuadoáaaaaaaaaaaaaaa",
        "a" * 30 + "\n",
        "a" * 30 + "\x00",
        str(uuid4()) + "==",
    ],
)
def test_lo_demas_no_tiene_forma_de_token(token: str) -> None:
    assert not tiene_forma_de_token(token)


def test_validar_correo_usa_las_mismas_reglas_que_el_registro() -> None:
    assert validar_correo("ana@correo.com") == {}
    assert validar_correo("  ANA@Correo.com ") == {}
    assert validar_correo("") == {"correo": "obligatorio"}
    assert validar_correo("   ") == {"correo": "obligatorio"}
    assert validar_correo("ana@correo") == {"correo": "correo_invalido"}
