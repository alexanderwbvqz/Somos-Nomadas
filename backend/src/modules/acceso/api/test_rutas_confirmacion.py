"""Rutas de la confirmación del correo: el registro envía el enlace (después de responder), /confirmacion lo usa y
/confirmacion/reenvio pide otro. Con los repositorios en memoria y el doble de correos."""

import logging
from typing import Any

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from modules.acceso.api.conftest import CLAVE, Entorno, Fabrica
from modules.acceso.domain.confirmacion import HORAS_ENLACE_CONFIRMACION
from modules.acceso.domain.intentos import CONFIRMACION_POR_ORIGEN, REENVIO_POR_CORREO

REGISTRO: dict[str, Any] = {"correo": "ana@correo.com", "clave": CLAVE, "acepta_politica": True, "sitio_secundario": ""}


def registrar(cliente: TestClient, **cambios: Any) -> Response:
    respuesta: Response = cliente.post("/acceso/registro", json={**REGISTRO, **cambios})
    return respuesta


def ultimo_token(entorno: Entorno) -> str:
    return entorno.correos.enviados[-1].token


def comparable(r: Response) -> tuple[int, bytes, str | None]:
    return r.status_code, r.content, r.headers.get("content-type")


# --- El registro envía el enlace ---


def test_una_cuenta_nueva_responde_202_y_envia_un_correo_con_su_enlace(cliente: TestClient, entorno: Entorno) -> None:
    r = registrar(cliente, correo="  Ana@Correo.com ")

    assert r.status_code == 202
    assert r.content == b""
    (enviado,) = entorno.correos.enviados
    assert enviado.destino == "ana@correo.com"
    assert enviado.idioma == "es"


@pytest.mark.parametrize("idioma", ["es", "en", "pt"])
def test_el_correo_va_en_el_idioma_que_manda_la_web(cliente: TestClient, entorno: Entorno, idioma: str) -> None:
    registrar(cliente, idioma=idioma)

    assert entorno.correos.enviados[-1].idioma == idioma


@pytest.mark.parametrize("idioma", ["fr", "", "ES", 1, None])
def test_un_idioma_que_no_es_de_la_web_es_un_dato_invalido(
    cliente: TestClient, entorno: Entorno, idioma: object
) -> None:
    r = registrar(cliente, idioma=idioma)

    assert r.status_code == 422
    assert r.json()["campos"] == {"idioma": "invalido"}
    assert entorno.correos.enviados == []


def test_un_correo_ya_registrado_responde_exactamente_igual_y_no_envia_nada(fabrica: Fabrica, entorno: Entorno) -> None:
    nueva = registrar(fabrica(origen="198.51.100.1"), correo="nueva@correo.com")
    entorno.crear_cuenta("ana@correo.com", confirmada=False)
    enviados = len(entorno.correos.enviados)

    repetida = registrar(fabrica(origen="198.51.100.2"), correo="ana@correo.com")

    assert comparable(repetida) == comparable(nueva)
    assert len(entorno.correos.enviados) == enviados


def test_el_campo_trampa_relleno_no_envia_nada(cliente: TestClient, entorno: Entorno) -> None:
    assert registrar(cliente, sitio_secundario="http://spam.com").status_code == 202
    assert entorno.correos.enviados == []


def test_si_el_envio_falla_el_registro_responde_igual_y_el_log_no_lleva_ni_correo_ni_token(
    cliente: TestClient, entorno: Entorno, caplog: pytest.LogCaptureFixture
) -> None:
    entorno.correos.fallar = True
    caplog.set_level(logging.DEBUG)

    r = registrar(cliente)

    assert r.status_code == 202
    assert "resend_503" in caplog.text
    assert "ana@correo.com" not in caplog.text
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None
    # El token no se ve, ni entero ni a medias: lo que se guardó es su hash
    for registro in caplog.records:
        assert "confirmacion-" not in registro.getMessage()


# --- /confirmacion ---


def test_el_token_del_correo_confirma_y_responde_solo_el_correo(cliente: TestClient, entorno: Entorno) -> None:
    registrar(cliente)

    r = cliente.post("/acceso/confirmacion", json={"token": ultimo_token(entorno)})

    assert r.status_code == 200
    assert r.json() == {"correo": "ana@correo.com"}


def test_antes_de_confirmar_no_se_puede_entrar_y_despues_si(cliente: TestClient, entorno: Entorno) -> None:
    registrar(cliente)
    credenciales = {"correo": "ana@correo.com", "clave": CLAVE}

    antes = cliente.post("/acceso/sesion", json=credenciales)
    cliente.post("/acceso/confirmacion", json={"token": ultimo_token(entorno)})
    despues = cliente.post("/acceso/sesion", json=credenciales)

    assert antes.status_code == 403
    assert antes.json() == {"codigo": "correo_sin_confirmar"}
    assert despues.status_code == 200


def test_confirmar_no_abre_sesion_ni_devuelve_tokens(cliente: TestClient, entorno: Entorno) -> None:
    registrar(cliente)

    r = cliente.post("/acceso/confirmacion", json={"token": ultimo_token(entorno)})

    assert set(r.json()) == {"correo"}
    assert "set-cookie" not in r.headers


def test_un_enlace_desconocido_usado_o_caducado_da_la_misma_respuesta(fabrica: Fabrica, entorno: Entorno) -> None:
    cliente = fabrica()
    registrar(cliente, correo="usada@correo.com")
    usado = ultimo_token(entorno)
    cliente.post("/acceso/confirmacion", json={"token": usado})
    registrar(fabrica(origen="198.51.100.3"), correo="caduca@correo.com")
    caducado = ultimo_token(entorno)
    entorno.reloj.avanzar(hours=HORAS_ENLACE_CONFIRMACION)

    respuestas = [
        cliente.post("/acceso/confirmacion", json={"token": token})
        for token in ("token-que-no-existe-0123456789", usado, caducado, "corto")
    ]

    assert {comparable(r) for r in respuestas} == {comparable(respuestas[0])}
    assert respuestas[0].status_code == 400
    assert respuestas[0].json() == {"codigo": "enlace_invalido"}


@pytest.mark.parametrize("cuerpo", [{}, {"token": 5}, {"token": None}, {"token": "a" * 501}])
def test_un_cuerpo_sin_token_de_texto_o_enorme_es_un_dato_invalido(cliente: TestClient, cuerpo: dict[str, Any]) -> None:
    r = cliente.post("/acceso/confirmacion", json=cuerpo)

    assert r.status_code == 422
    assert r.json()["codigo"] == "datos_invalidos"


def test_confirmar_tiene_limite_de_intentos_por_origen(cliente: TestClient) -> None:
    for _ in range(CONFIRMACION_POR_ORIGEN.maximo):
        cliente.post("/acceso/confirmacion", json={"token": "token-que-no-existe-0123456789"})

    r = cliente.post("/acceso/confirmacion", json={"token": "token-que-no-existe-0123456789"})

    assert r.status_code == 429
    assert r.json() == {"codigo": "limite_excedido"}
    assert r.headers["retry-after"] == str(CONFIRMACION_POR_ORIGEN.ventana_segundos)


def test_el_limite_de_confirmar_es_por_origen_un_origen_bloqueado_no_bloquea_a_otro(
    fabrica: Fabrica, entorno: Entorno
) -> None:
    registrar(fabrica(origen="198.51.100.1"))
    token = ultimo_token(entorno)
    atacante = fabrica(origen="203.0.113.66")
    for _ in range(CONFIRMACION_POR_ORIGEN.maximo):
        atacante.post("/acceso/confirmacion", json={"token": "token-que-no-existe-0123456789"})
    assert atacante.post("/acceso/confirmacion", json={"token": token}).status_code == 429

    r = fabrica(origen="198.51.100.1").post("/acceso/confirmacion", json={"token": token})

    assert r.status_code == 200


# --- /confirmacion/reenvio ---


def test_reenviar_manda_un_enlace_nuevo_y_el_anterior_deja_de_valer(cliente: TestClient, entorno: Entorno) -> None:
    registrar(cliente)
    anterior = ultimo_token(entorno)

    r = cliente.post("/acceso/confirmacion/reenvio", json={"correo": "ANA@correo.com", "idioma": "en"})

    assert r.status_code == 202
    assert r.content == b""
    nuevo = entorno.correos.enviados[-1]
    assert (nuevo.destino, nuevo.idioma) == ("ana@correo.com", "en")
    assert cliente.post("/acceso/confirmacion", json={"token": anterior}).status_code == 400
    assert cliente.post("/acceso/confirmacion", json={"token": nuevo.token}).status_code == 200


def test_reenviar_responde_igual_exista_o_no_la_cuenta_y_este_o_no_confirmada(
    fabrica: Fabrica, entorno: Entorno
) -> None:
    registrar(fabrica(origen="198.51.100.9"), correo="sin-confirmar@correo.com")
    registrar(fabrica(origen="198.51.100.9"), correo="confirmada@correo.com")
    fabrica().post("/acceso/confirmacion", json={"token": ultimo_token(entorno)})
    enviados = len(entorno.correos.enviados)

    respuestas = {
        correo: fabrica(origen=f"192.0.2.{i}").post(
            "/acceso/confirmacion/reenvio", json={"correo": correo, "idioma": "es"}
        )
        for i, correo in enumerate(["sin-confirmar@correo.com", "confirmada@correo.com", "nadie@correo.com"])
    }

    assert len({comparable(r) for r in respuestas.values()}) == 1
    # Solo la cuenta sin confirmar recibe algo
    assert [p.destino for p in entorno.correos.enviados[enviados:]] == ["sin-confirmar@correo.com"]


def test_reenviar_sin_idioma_lo_manda_en_espanol(cliente: TestClient, entorno: Entorno) -> None:
    registrar(cliente)

    cliente.post("/acceso/confirmacion/reenvio", json={"correo": "ana@correo.com"})

    assert entorno.correos.enviados[-1].idioma == "es"


@pytest.mark.parametrize(
    ("cuerpo", "campos"),
    [
        ({"correo": "ana@correo"}, {"correo": "correo_invalido"}),
        ({"correo": ""}, {"correo": "obligatorio"}),
        ({}, {"correo": "obligatorio"}),
        ({"correo": "ana@correo.com", "idioma": "fr"}, {"idioma": "invalido"}),
        ({"correo": "a" * 501}, {"correo": "invalido"}),
    ],
)
def test_reenviar_con_datos_mal_escritos_es_un_dato_invalido(
    cliente: TestClient, cuerpo: dict[str, Any], campos: dict[str, str]
) -> None:
    r = cliente.post("/acceso/confirmacion/reenvio", json=cuerpo)

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": campos}


def test_reenviar_tiene_limite_por_correo(fabrica: Fabrica, entorno: Entorno) -> None:
    registrar(fabrica(origen="198.51.100.1"))
    for i in range(REENVIO_POR_CORREO.maximo):
        fabrica(origen=f"192.0.2.{i}").post("/acceso/confirmacion/reenvio", json={"correo": "ana@correo.com"})

    r = fabrica(origen="192.0.2.99").post("/acceso/confirmacion/reenvio", json={"correo": "ana@correo.com"})

    assert r.status_code == 429
    assert r.headers["retry-after"] == str(REENVIO_POR_CORREO.ventana_segundos)


def test_si_falla_el_envio_del_reenvio_responde_igual_y_el_log_no_lleva_el_correo(
    cliente: TestClient, entorno: Entorno, caplog: pytest.LogCaptureFixture
) -> None:
    registrar(cliente)
    entorno.correos.fallar = True
    caplog.set_level(logging.DEBUG)

    r = cliente.post("/acceso/confirmacion/reenvio", json={"correo": "ana@correo.com"})

    assert r.status_code == 202
    assert "resend_503" in caplog.text
    assert "ana@correo.com" not in caplog.text
