import hmac as modulo_hmac
from typing import Any

import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from shared.http.origen import CABECERA_ORIGEN, CABECERA_SECRETO, crear_resolutor_de_origen

SECRETO = "s3creto-interno-" + "i" * 30
CONEXION = "10.0.0.1"  # la IP desde la que llega la petición: en producción, la del servidor de Next


def cliente(secreto: str, conexion: str | None = CONEXION) -> TestClient:
    resolutor = crear_resolutor_de_origen(secreto)
    app = FastAPI()

    @app.get("/origen")
    def origen(peticion: Request) -> dict[str, str]:
        return {"origen": resolutor(peticion)}

    return TestClient(app, client=(conexion, 50000) if conexion else None)  # type: ignore[arg-type]


def origen_de(http: TestClient, **cabeceras: str) -> str:
    traducidas = {nombre.replace("_", "-"): valor for nombre, valor in cabeceras.items()}
    return http.get("/origen", headers=traducidas).json()["origen"]  # type: ignore[no-any-return]


def reenviada(ip: str, secreto: str = SECRETO) -> dict[str, str]:
    return {CABECERA_ORIGEN: ip, CABECERA_SECRETO: secreto}


# --- Cuándo se confía en la IP reenviada ---


def test_con_el_secreto_correcto_se_usa_la_ip_reenviada() -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers=reenviada("203.0.113.7")).json()["origen"] == "203.0.113.7"


def test_sin_la_cabecera_del_secreto_se_ignora_la_ip_reenviada() -> None:
    http = cliente(SECRETO)

    # Un navegador cualquiera no puede elegir con qué IP lo cuentan
    assert http.get("/origen", headers={CABECERA_ORIGEN: "203.0.113.7"}).json()["origen"] == CONEXION


@pytest.mark.parametrize("secreto", ["", "otro", SECRETO + "x", SECRETO[:-1], SECRETO.upper()])
def test_con_un_secreto_incorrecto_se_ignora_la_ip_reenviada(secreto: str) -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers=reenviada("203.0.113.7", secreto)).json()["origen"] == CONEXION


def test_si_no_hay_secreto_configurado_nunca_se_confia_en_la_cabecera() -> None:
    # En desarrollo, sin SECRETO_INTERNO: la cabecera de secreto vacía no puede «coincidir» con nada
    http = cliente("")

    assert http.get("/origen", headers=reenviada("203.0.113.7", "")).json()["origen"] == CONEXION
    assert http.get("/origen", headers=reenviada("203.0.113.7", "cualquiera")).json()["origen"] == CONEXION


def test_con_el_secreto_correcto_pero_sin_ip_se_usa_la_de_la_conexion() -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers={CABECERA_SECRETO: SECRETO}).json()["origen"] == CONEXION


@pytest.mark.parametrize(
    "ip",
    [
        "",
        "   ",
        "no-es-una-ip",
        "999.1.1.1",
        "1.2.3",
        "1.2.3.4, 5.6.7.8",
        "1.2.3.4:8080",
        "1.2.3.4/24",
        "' or 1=1 --",
        "x" * 600,
    ],
)
def test_una_ip_reenviada_mal_formada_se_ignora_aunque_el_secreto_sea_correcto(ip: str) -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers=reenviada(ip)).json()["origen"] == CONEXION


def test_el_nombre_de_las_cabeceras_no_distingue_mayusculas() -> None:
    http = cliente(SECRETO)

    cabeceras = {"X-Origen-Cliente": "203.0.113.7", "X-SECRETO-INTERNO": SECRETO}

    assert http.get("/origen", headers=cabeceras).json()["origen"] == "203.0.113.7"


def test_el_secreto_se_compara_en_tiempo_constante(monkeypatch: pytest.MonkeyPatch) -> None:
    llamadas: list[int] = []
    original: Any = modulo_hmac.compare_digest

    def espia(a: Any, b: Any) -> bool:
        llamadas.append(1)
        return bool(original(a, b))

    monkeypatch.setattr(modulo_hmac, "compare_digest", espia)
    http = cliente(SECRETO)

    http.get("/origen", headers=reenviada("203.0.113.7"))
    http.get("/origen", headers=reenviada("203.0.113.7", "malo"))

    assert len(llamadas) == 2


# --- Normalización: que no se pueda esquivar el límite cambiando de dirección ---


def test_se_recortan_los_espacios_de_la_ip_reenviada() -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers=reenviada(" 203.0.113.7 ")).json()["origen"] == "203.0.113.7"


def test_una_ipv4_escrita_como_ipv6_equivale_a_la_ipv4() -> None:
    http = cliente(SECRETO)

    assert http.get("/origen", headers=reenviada("::ffff:203.0.113.7")).json()["origen"] == "203.0.113.7"


def test_las_ipv6_se_agrupan_por_su_prefijo_de_64_bits() -> None:
    # Una persona con IPv6 tiene un /64 entero (2^64 direcciones): si se contara cada una, el límite no valdría nada
    http = cliente(SECRETO)

    una = http.get("/origen", headers=reenviada("2001:db8:1:2:aaaa:bbbb:cccc:dddd")).json()["origen"]
    otra = http.get("/origen", headers=reenviada("2001:db8:1:2::1")).json()["origen"]
    escrita_larga = http.get("/origen", headers=reenviada("2001:0db8:0001:0002:0000:0000:0000:0001")).json()["origen"]
    vecina = http.get("/origen", headers=reenviada("2001:db8:1:3::1")).json()["origen"]

    assert una == otra == escrita_larga == "2001:db8:1:2::/64"
    assert vecina == "2001:db8:1:3::/64"


def test_la_ip_de_la_conexion_ipv6_tambien_se_agrupa_por_64_bits() -> None:
    http = cliente("", conexion="2001:db8:1:2:aaaa:bbbb:cccc:dddd")

    assert http.get("/origen").json()["origen"] == "2001:db8:1:2::/64"


def test_una_conexion_que_no_es_una_ip_se_devuelve_tal_cual() -> None:
    # TestClient usa «testclient»; un socket UNIX no tiene IP
    assert cliente("", conexion="testclient").get("/origen").json()["origen"] == "testclient"


def test_sin_datos_de_la_conexion_el_origen_es_desconocido() -> None:
    assert cliente("", conexion=None).get("/origen").json()["origen"] == "desconocido"
