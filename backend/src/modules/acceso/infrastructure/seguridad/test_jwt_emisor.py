import base64
import json
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
import pytest

from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.sesion import SEGUNDOS_TOKEN_ACCESO
from modules.acceso.infrastructure.seguridad.jwt_emisor import JwtEmisor

# 64 caracteres: así HS384 y HS512 también tienen una clave de tamaño legítimo y la firma sería válida
SECRETO = "s" * 64
AHORA = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)


def emisor() -> JwtEmisor:
    return JwtEmisor(SECRETO)


def firmar(carga: dict[str, object], secreto: str = SECRETO, algoritmo: str = "HS256") -> str:
    return jwt.encode(carga, secreto, algorithm=algoritmo)


def carga_valida(**cambios: object) -> dict[str, object]:
    base: dict[str, object] = {
        "sub": str(uuid4()),
        "iat": int(AHORA.timestamp()),
        "exp": int(AHORA.timestamp()) + SEGUNDOS_TOKEN_ACCESO,
    }
    return {**base, **cambios}


def codificar(parte: dict[str, object]) -> str:
    return base64.urlsafe_b64encode(json.dumps(parte).encode()).rstrip(b"=").decode()


# --- Acceso ---


def test_cumple_el_puerto() -> None:
    e: EmisorTokens = emisor()
    cuenta = uuid4()
    assert e.validar_acceso(e.emitir_acceso(cuenta, AHORA).valor, AHORA) == cuenta


def test_el_token_de_acceso_dura_15_minutos_y_solo_lleva_sub_iat_y_exp() -> None:
    cuenta = uuid4()

    token = emisor().emitir_acceso(cuenta, AHORA)

    assert token.expira_en_segundos == SEGUNDOS_TOKEN_ACCESO == 900
    carga = jwt.decode(token.valor, SECRETO, algorithms=["HS256"], options={"verify_exp": False, "verify_iat": False})
    # Un JWT se puede leer: nada de correo ni de otros datos personales
    assert carga == {
        "sub": str(cuenta),
        "iat": int(AHORA.timestamp()),
        "exp": int(AHORA.timestamp()) + 900,
    }
    assert jwt.get_unverified_header(token.valor)["alg"] == "HS256"


def test_valida_hasta_un_segundo_antes_de_caducar_y_no_en_el_instante_exacto() -> None:
    cuenta = uuid4()
    token = emisor().emitir_acceso(cuenta, AHORA).valor

    assert emisor().validar_acceso(token, AHORA + timedelta(seconds=SEGUNDOS_TOKEN_ACCESO - 1)) == cuenta
    assert emisor().validar_acceso(token, AHORA + timedelta(seconds=SEGUNDOS_TOKEN_ACCESO)) is None
    assert emisor().validar_acceso(token, AHORA + timedelta(days=1)) is None


def test_usa_el_reloj_recibido_y_no_el_del_sistema() -> None:
    # Emitido en 2026 y validado en el «pasado» y en el «futuro» respecto de ese reloj, sea cual sea la hora real
    cuenta = uuid4()
    token = emisor().emitir_acceso(cuenta, AHORA).valor

    assert emisor().validar_acceso(token, AHORA - timedelta(hours=1)) == cuenta
    assert emisor().validar_acceso(token, datetime(2100, 1, 1, tzinfo=UTC)) is None


def test_rechaza_un_token_firmado_con_otro_secreto() -> None:
    ajeno = firmar(carga_valida(), secreto="otro-secreto-" + "x" * 32)

    assert emisor().validar_acceso(ajeno, AHORA) is None


def test_rechaza_un_token_con_la_carga_alterada() -> None:
    cabecera, _, firma = emisor().emitir_acceso(uuid4(), AHORA).valor.split(".")
    alterada = codificar(carga_valida())  # otra cuenta, misma firma

    assert emisor().validar_acceso(f"{cabecera}.{alterada}.{firma}", AHORA) is None


def test_rechaza_otros_algoritmos() -> None:
    # Firmados con el MISMO secreto: la firma es válida, y solo el algoritmo los delata
    carga = carga_valida()

    assert emisor().validar_acceso(firmar(carga, SECRETO, "HS512"), AHORA) is None
    assert emisor().validar_acceso(firmar(carga, SECRETO, "HS384"), AHORA) is None
    assert emisor().validar_acceso(firmar(carga, SECRETO, "HS256"), AHORA) is not None  # y el bueno sí pasa


def test_rechaza_un_token_sin_firma_alg_none() -> None:
    sin_firma = f"{codificar({'alg': 'none', 'typ': 'JWT'})}.{codificar(carga_valida())}."

    assert emisor().validar_acceso(sin_firma, AHORA) is None


@pytest.mark.parametrize("faltante", ["sub", "iat", "exp"])
def test_rechaza_un_token_al_que_le_falta_una_clave_obligatoria(faltante: str) -> None:
    carga = carga_valida()
    del carga[faltante]

    assert emisor().validar_acceso(firmar(carga), AHORA) is None


@pytest.mark.parametrize(
    "cambio",
    [
        {"sub": "no-es-un-uuid"},
        {"sub": 12345},
        {"sub": None},
        {"exp": "mañana"},
        {"exp": None},
        {"exp": True},
        {"iat": "ayer"},
        {"iat": True},
    ],
)
def test_rechaza_valores_mal_formados(cambio: dict[str, object]) -> None:
    assert emisor().validar_acceso(firmar(carga_valida(**cambio)), AHORA) is None


@pytest.mark.parametrize("token", ["", "basura", "a.b.c", "a.b", "....", "x" * 5000])
def test_rechaza_basura_sin_lanzar(token: str) -> None:
    assert emisor().validar_acceso(token, AHORA) is None


def test_exige_un_secreto_de_al_menos_32_caracteres() -> None:
    with pytest.raises(ValueError, match="32"):
        JwtEmisor("corto")
    with pytest.raises(ValueError, match="32"):
        JwtEmisor("")
    JwtEmisor("s" * 32)  # no lanza


# --- Token de renovación ---


def test_los_tokens_de_renovacion_son_largos_y_no_se_repiten() -> None:
    e = emisor()
    tokens = {e.nuevo_token_renovacion() for _ in range(200)}

    assert len(tokens) == 200
    assert all(len(t) >= 43 for t in tokens)  # 32 bytes aleatorios en base64 = 256 bits


def test_el_hash_del_token_es_estable_hexadecimal_y_distinto_del_token() -> None:
    e = emisor()
    token = e.nuevo_token_renovacion()
    hash_guardado = e.hash_de_token_renovacion(token)

    assert hash_guardado == e.hash_de_token_renovacion(token)
    assert hash_guardado != token
    assert len(hash_guardado) == 64
    int(hash_guardado, 16)  # es hexadecimal
    assert e.hash_de_token_renovacion(token + "x") != hash_guardado


# --- Token del enlace de confirmación ---


def test_los_tokens_de_confirmacion_son_largos_no_se_repiten_y_tienen_la_forma_que_se_valida() -> None:
    from modules.acceso.domain.confirmacion import tiene_forma_de_token

    e = emisor()
    tokens = {e.nuevo_token_confirmacion() for _ in range(200)}

    assert len(tokens) == 200
    assert all(len(t) >= 43 for t in tokens)  # 256 bits
    # Si el emisor diera tokens que la validación rechaza, ningún enlace funcionaría
    assert all(tiene_forma_de_token(t) for t in tokens)


def test_el_hash_del_token_de_confirmacion_es_sha256_estable_y_distinto_del_token() -> None:
    e = emisor()
    token = e.nuevo_token_confirmacion()
    hash_guardado = e.hash_de_token_confirmacion(token)

    assert hash_guardado == e.hash_de_token_confirmacion(token)
    assert hash_guardado != token
    assert len(hash_guardado) == 64
    int(hash_guardado, 16)
    assert e.hash_de_token_confirmacion(token + "x") != hash_guardado
