import json

import httpx
import pytest

from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.domain.correos_de_acceso import CorreosDeAcceso
from modules.acceso.domain.errores import CorreoNoEnviado
from modules.acceso.infrastructure.correo.plantillas import enlace_de_confirmacion, mensaje_de_confirmacion
from modules.acceso.infrastructure.correo.resend_correos import ResendCorreos

CLAVE = "re_clave_de_prueba_0123456789"
REMITENTE = "Somos Nómadas <hola@somosnomadas.app>"
URL_WEB = "https://somosnomadas.app"
TOKEN = "token-secreto-0123456789-abcdefghij"
PENDIENTE = CorreoPendiente("ana@correo.com", TOKEN, "pt")


def resend_que(
    responder: httpx.MockTransport | None = None, *, estado: int = 200
) -> tuple[ResendCorreos, list[httpx.Request]]:
    peticiones: list[httpx.Request] = []

    def manejar(peticion: httpx.Request) -> httpx.Response:
        peticiones.append(peticion)
        return httpx.Response(estado, json={"id": "abc"} if estado < 300 else {"message": "error", "name": "x"})

    cliente = httpx.Client(transport=responder or httpx.MockTransport(manejar))
    return ResendCorreos(cliente, clave=CLAVE, remitente=REMITENTE, url_web=URL_WEB), peticiones


def test_cumple_el_puerto_y_manda_el_correo_a_la_api_de_resend() -> None:
    resend, peticiones = resend_que()
    correos: CorreosDeAcceso = resend

    correos.enviar_confirmacion(PENDIENTE)

    (peticion,) = peticiones
    assert peticion.method == "POST"
    assert str(peticion.url) == "https://api.resend.com/emails"
    assert peticion.headers["authorization"] == f"Bearer {CLAVE}"
    assert peticion.headers["content-type"] == "application/json"
    mensaje = mensaje_de_confirmacion(URL_WEB, PENDIENTE)
    assert json.loads(peticion.content) == {
        "from": REMITENTE,
        "to": ["ana@correo.com"],
        "subject": mensaje.asunto,
        "html": mensaje.html,
        "text": mensaje.texto,
    }


def test_el_correo_lleva_el_enlace_en_el_idioma_de_la_persona() -> None:
    resend, peticiones = resend_que()

    resend.enviar_confirmacion(PENDIENTE)

    cuerpo = json.loads(peticiones[0].content)
    assert enlace_de_confirmacion(URL_WEB, "pt", TOKEN) in cuerpo["text"]
    assert cuerpo["subject"].startswith("Confirme")


def test_lleva_una_clave_de_idempotencia_estable_que_no_es_el_token() -> None:
    # Si el mismo correo se mandara dos veces (un reintento), Resend lo entrega una sola vez
    resend, peticiones = resend_que()

    resend.enviar_confirmacion(PENDIENTE)
    resend.enviar_confirmacion(PENDIENTE)
    resend.enviar_confirmacion(CorreoPendiente("ana@correo.com", TOKEN + "x", "pt"))

    claves = [p.headers["idempotency-key"] for p in peticiones]
    assert claves[0] == claves[1] != claves[2]
    assert all(TOKEN not in clave for clave in claves)


@pytest.mark.parametrize("estado", [400, 401, 403, 422, 429, 500, 503])
def test_una_respuesta_de_error_es_correo_no_enviado_con_el_estado_y_sin_datos(estado: int) -> None:
    resend, _ = resend_que(estado=estado)

    with pytest.raises(CorreoNoEnviado) as error:
        resend.enviar_confirmacion(PENDIENTE)

    assert error.value.motivo == f"resend_{estado}"
    texto = f"{error.value} {error.value!r} {error.value.__cause__!r} {error.value.__context__!r}"
    assert "ana@correo.com" not in texto
    assert TOKEN not in texto
    assert CLAVE not in texto


@pytest.mark.parametrize(
    "fallo", [httpx.ConnectError("sin red"), httpx.ReadTimeout("tarda"), httpx.RemoteProtocolError("cortado")]
)
def test_sin_conexion_o_sin_respuesta_es_correo_no_enviado(fallo: httpx.HTTPError) -> None:
    def fallar(peticion: httpx.Request) -> httpx.Response:
        raise fallo

    resend, _ = resend_que(httpx.MockTransport(fallar))

    with pytest.raises(CorreoNoEnviado) as error:
        resend.enviar_confirmacion(PENDIENTE)

    assert error.value.motivo == "sin_conexion"
    # La excepción de httpx lleva la URL y a veces la petición: no se encadena
    assert error.value.__cause__ is None and error.value.__suppress_context__


def test_espera_como_mucho_10_segundos() -> None:
    tiempos: list[object] = []

    def anotar(peticion: httpx.Request) -> httpx.Response:
        tiempos.append(peticion.extensions.get("timeout"))
        return httpx.Response(200, json={"id": "abc"})

    resend, _ = resend_que(httpx.MockTransport(anotar))
    resend.enviar_confirmacion(PENDIENTE)

    assert tiempos == [{"connect": 10.0, "read": 10.0, "write": 10.0, "pool": 10.0}]


def test_la_clave_no_aparece_al_imprimir_el_adaptador() -> None:
    resend, _ = resend_que()

    assert CLAVE not in repr(resend) + str(resend) + repr(vars(resend))
