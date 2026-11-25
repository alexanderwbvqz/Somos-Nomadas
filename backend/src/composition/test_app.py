"""La app armada de punta a punta, con la criptografía real y los datos en memoria (o Supabase con un cliente falso)."""

from typing import Any, cast

import pytest
from fastapi.testclient import TestClient
from supabase import Client

import composition.app as modulo_app
from composition.app import crear_app
from modules.acceso.infrastructure.supabase.cliente_falso import ClienteFalso
from shared.config.config import Configuracion

JWT = "jwt-secreto-" + "j" * 30
HUELLAS = "huellas-secreto-" + "h" * 30
LLAVE = "llave-de-servidor-" + "k" * 30
CLAVE = "Clave-segura1"
VARIABLES = [
    "ENTORNO",
    "ALMACEN_DE_DATOS",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "JWT_SECRETO",
    "HUELLAS_SECRETO",
    "ORIGENES_PERMITIDOS",
    "EXIGIR_CORREO_CONFIRMADO",
    "POLITICA_VERSION",
]


@pytest.fixture(autouse=True)
def entorno_limpio(monkeypatch: pytest.MonkeyPatch) -> None:
    for nombre in VARIABLES:
        monkeypatch.delenv(nombre, raising=False)


def config(**cambios: Any) -> Configuracion:
    base: dict[str, Any] = {
        "entorno": "desarrollo",
        "almacen_de_datos": "memoria",
        "jwt_secreto": JWT,
        "exigir_correo_confirmado": False,
        "origenes_permitidos": "https://nomadas.example",
    }
    return Configuracion(_env_file=None, **{**base, **cambios})  # type: ignore[call-arg]


def cliente_http(app_config: Configuracion, origen: str = "203.0.113.7") -> TestClient:
    return TestClient(crear_app(app_config), raise_server_exceptions=False, client=(origen, 50000))


def registro() -> dict[str, object]:
    return {"correo": "ana@correo.com", "clave": CLAVE, "acepta_politica": True, "sitio_secundario": ""}


# --- El flujo completo, con argon2 y JWT de verdad ---


def test_registro_sesion_yo_renovar_y_cierre_de_punta_a_punta() -> None:
    cliente = cliente_http(config())

    assert cliente.post("/acceso/registro", json=registro()).status_code == 202
    entrada = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})
    assert entrada.status_code == 200
    sesion = entrada.json()
    assert sesion["token_acceso"].count(".") == 2  # un JWT de verdad, no un doble de prueba

    yo = cliente.get("/acceso/yo", headers={"Authorization": f"Bearer {sesion['token_acceso']}"})
    assert yo.status_code == 200
    assert yo.json()["correo"] == "ana@correo.com"
    assert yo.json()["correo_confirmado"] is False

    nuevos = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})
    assert nuevos.status_code == 200
    assert nuevos.json()["token_renovacion"] != sesion["token_renovacion"]

    cierre = cliente.post("/acceso/cierre", json={"token_renovacion": nuevos.json()["token_renovacion"]})
    assert cierre.status_code == 204
    assert (
        cliente.post("/acceso/renovar", json={"token_renovacion": nuevos.json()["token_renovacion"]}).status_code == 401
    )


def test_la_clave_incorrecta_se_rechaza_con_la_criptografia_real() -> None:
    cliente = cliente_http(config())
    cliente.post("/acceso/registro", json=registro())

    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": "Otra-clave9"})

    assert r.status_code == 401
    assert r.json() == {"codigo": "credenciales_invalidas"}


def test_un_token_firmado_por_otra_app_no_sirve() -> None:
    una, otra = cliente_http(config()), cliente_http(config(jwt_secreto="otro-secreto-" + "z" * 30))
    una.post("/acceso/registro", json=registro())
    token = una.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE}).json()["token_acceso"]

    assert otra.get("/acceso/yo", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_exigiendo_la_confirmacion_nadie_inicia_sesion_porque_aun_no_existe_el_envio_de_correos() -> None:
    # Es la consecuencia documentada en contrato/autenticacion.md, sección 9
    cliente = cliente_http(config(exigir_correo_confirmado=True))
    cliente.post("/acceso/registro", json=registro())

    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert r.status_code == 403
    assert r.json() == {"codigo": "correo_sin_confirmar"}


def test_dos_apps_no_comparten_los_datos() -> None:
    una, otra = cliente_http(config()), cliente_http(config())
    una.post("/acceso/registro", json=registro())

    r = otra.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert r.status_code == 401


# --- CORS ---


def test_cors_responde_al_origen_configurado_tambien_en_los_errores() -> None:
    cliente = cliente_http(config())

    r = cliente.get("/acceso/yo", headers={"Origin": "https://nomadas.example"})

    assert r.status_code == 401
    assert r.headers["access-control-allow-origin"] == "https://nomadas.example"


def test_cors_no_responde_a_otros_origenes() -> None:
    r = cliente_http(config()).get("/acceso/yo", headers={"Origin": "https://malo.example"})

    assert "access-control-allow-origin" not in r.headers


# --- Documentación de la API ---


def test_en_desarrollo_la_documentacion_esta_disponible() -> None:
    cliente = cliente_http(config())

    assert cliente.get("/openapi.json").status_code == 200
    assert cliente.get("/docs").status_code == 200


def test_en_produccion_la_documentacion_esta_desactivada(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(modulo_app, "crear_cliente", lambda *_a, **_k: cast(Client, ClienteFalso()))
    produccion = config(
        entorno="produccion",
        almacen_de_datos="supabase",
        supabase_url="https://abcdefgh.supabase.co",
        supabase_service_role_key=LLAVE,
        huellas_secreto=HUELLAS,
        exigir_correo_confirmado=True,
    )
    cliente = cliente_http(produccion)

    for ruta in ("/openapi.json", "/docs", "/redoc"):
        r = cliente.get(ruta)
        assert r.status_code == 404, ruta
        assert r.json() == {"codigo": "no_encontrado"}


def test_la_documentacion_describe_la_api_y_no_contiene_secretos() -> None:
    contenido = cliente_http(config()).get("/openapi.json").text

    assert "Somos Nómadas" in contenido
    assert JWT not in contenido and HUELLAS not in contenido


# --- Cliente de Supabase ---


def test_en_memoria_nunca_se_crea_el_cliente_de_supabase(monkeypatch: pytest.MonkeyPatch) -> None:
    def prohibido(*_a: object, **_k: object) -> Client:
        raise AssertionError("En memoria no debe crearse el cliente de Supabase")

    monkeypatch.setattr(modulo_app, "crear_cliente", prohibido)

    assert cliente_http(config()).post("/acceso/registro", json=registro()).status_code == 202


def test_con_supabase_se_crea_el_cliente_una_sola_vez_con_la_url_y_la_llave(monkeypatch: pytest.MonkeyPatch) -> None:
    llamadas: list[tuple[str, str]] = []
    falso = ClienteFalso({"obtener_cuenta_por_correo": [], "consumir_intento": None})

    def crear(url: str, llave: str, **_k: object) -> Client:
        llamadas.append((url, llave))
        return cast(Client, falso)

    monkeypatch.setattr(modulo_app, "crear_cliente", crear)
    app_config = config(
        almacen_de_datos="supabase",
        supabase_url="https://abcdefgh.supabase.co",
        supabase_service_role_key=LLAVE,
        huellas_secreto=HUELLAS,
    )

    cliente = cliente_http(app_config)
    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert llamadas == [("https://abcdefgh.supabase.co", LLAVE)]
    # Llegó hasta Supabase a través de los adaptadores: límite de intentos (origen y correo) y búsqueda de la cuenta
    assert r.status_code == 401
    assert [(c.tipo, c.nombre) for c in falso.llamadas] == [
        ("rpc", "consumir_intento"),
        ("rpc", "consumir_intento"),
        ("rpc", "consumir_intento"),
        ("rpc", "obtener_cuenta_por_correo"),
    ]


# --- Configuración desde el entorno ---


def test_sin_configuracion_explicita_la_lee_del_entorno(monkeypatch: pytest.MonkeyPatch, tmp_path: Any) -> None:
    monkeypatch.chdir(tmp_path)  # sin .env en la carpeta actual
    monkeypatch.setenv("ENTORNO", "desarrollo")
    monkeypatch.setenv("ALMACEN_DE_DATOS", "memoria")
    monkeypatch.setenv("JWT_SECRETO", JWT)
    monkeypatch.setenv("EXIGIR_CORREO_CONFIRMADO", "false")

    cliente = TestClient(crear_app(), raise_server_exceptions=False)

    assert cliente.post("/acceso/registro", json=registro()).status_code == 202


def test_una_configuracion_insegura_impide_arrancar(monkeypatch: pytest.MonkeyPatch, tmp_path: Any) -> None:
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("ENTORNO", "produccion")
    monkeypatch.setenv("ALMACEN_DE_DATOS", "memoria")
    monkeypatch.setenv("JWT_SECRETO", JWT)

    with pytest.raises(ValueError):
        crear_app()
