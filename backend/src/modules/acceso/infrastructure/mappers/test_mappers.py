from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.mappers.cuenta_mapper import cuenta_de_filas, parametros_de_cuenta
from modules.acceso.infrastructure.mappers.sesion_mapper import parametros_de_rotacion, sesion_de_filas
from shared.supabase.errores import ErrorDeBaseDeDatos

ID = "0b0e1a92-5c7e-4c3a-9d77-1f2f6c1d2a10"
HASH = "$argon2id$v=19$m=65536,t=3,p=4$SECRETO$SECRETO"


def fila_cuenta(**cambios: object) -> dict[str, object]:
    base: dict[str, object] = {
        "id": ID,
        "correo": "ana@correo.com",
        "clave_hash": HASH,
        "correo_confirmado": True,
        "politica_aceptada_en": "2026-11-24T12:00:00+00:00",
        "politica_version": "2026-11",
        "creada_en": "2026-11-24T12:00:00.123456+00:00",
    }
    return {**base, **cambios}


def fila_sesion(**cambios: object) -> dict[str, object]:
    base: dict[str, object] = {
        "id": ID,
        "cuenta_id": "7a1f2c3d-0000-4000-8000-000000000001",
        "token_hash": "abc123",
        "expira_en": "2026-12-24T12:00:00+00:00",
        "creada_en": "2026-11-24T12:00:00+00:00",
        "revocada_en": None,
    }
    return {**base, **cambios}


# --- Cuenta ---


def test_una_fila_de_cuenta_se_convierte_en_la_entidad() -> None:
    cuenta = cuenta_de_filas([fila_cuenta()])

    assert cuenta == Cuenta(
        id=UUID(ID),
        correo="ana@correo.com",
        clave_hash=HASH,
        correo_confirmado=True,
        politica_aceptada_en=datetime(2026, 11, 24, 12, 0, tzinfo=UTC),
        politica_version="2026-11",
        creada_en=datetime(2026, 11, 24, 12, 0, 0, 123456, tzinfo=UTC),
    )


def test_sin_filas_no_hay_cuenta() -> None:
    assert cuenta_de_filas([]) is None


def test_entiende_las_fechas_con_zona_horaria_distinta_de_utc_y_con_fracciones_cortas() -> None:
    cuenta = cuenta_de_filas([fila_cuenta(creada_en="2026-11-24T09:00:00.5-03:00")])

    assert cuenta is not None
    assert cuenta.creada_en == datetime(2026, 11, 24, 12, 0, 0, 500000, tzinfo=UTC)


@pytest.mark.parametrize("data", [None, {}, "texto", 5, [None], ["no es una fila"], [{"id": ID}]])
def test_una_respuesta_con_otra_forma_es_un_error_de_base_de_datos(data: object) -> None:
    with pytest.raises(ErrorDeBaseDeDatos):
        cuenta_de_filas(data)


def test_una_fila_mal_formada_no_filtra_sus_valores_en_el_error() -> None:
    # La validación de pydantic repite los valores recibidos en su mensaje: aquí habría un hash y un correo
    with pytest.raises(ErrorDeBaseDeDatos) as error:
        cuenta_de_filas([fila_cuenta(id="no-es-un-uuid", correo_confirmado="quizá")])

    texto = str(error.value) + repr(error.value)
    assert "SECRETO" not in texto and "ana@correo.com" not in texto and "no-es-un-uuid" not in texto
    assert error.value.__cause__ is None and error.value.__suppress_context__


def test_ignora_las_columnas_que_no_conoce() -> None:
    assert cuenta_de_filas([fila_cuenta(columna_nueva="x")]) is not None


def test_los_parametros_de_crear_cuenta_usan_los_nombres_de_la_funcion_sql() -> None:
    cuenta = Cuenta(
        id=UUID(ID),
        correo="ana@correo.com",
        clave_hash=HASH,
        correo_confirmado=False,
        politica_aceptada_en=datetime(2026, 11, 24, 12, 0, tzinfo=UTC),
        politica_version="2026-11",
        creada_en=datetime(2026, 11, 24, 12, 0, tzinfo=UTC),
    )

    assert parametros_de_cuenta(cuenta) == {
        "p_id": ID,
        "p_correo": "ana@correo.com",
        "p_clave_hash": HASH,
        "p_correo_confirmado": False,
        "p_politica_aceptada_en": "2026-11-24T12:00:00+00:00",
        "p_politica_version": "2026-11",
        "p_creada_en": "2026-11-24T12:00:00+00:00",
    }


# --- Sesión ---


def test_una_fila_de_sesion_se_convierte_en_la_entidad() -> None:
    sesion = sesion_de_filas([fila_sesion()])

    assert sesion == Sesion(
        id=UUID(ID),
        cuenta_id=UUID("7a1f2c3d-0000-4000-8000-000000000001"),
        token_hash="abc123",
        expira_en=datetime(2026, 12, 24, 12, 0, tzinfo=UTC),
        creada_en=datetime(2026, 11, 24, 12, 0, tzinfo=UTC),
        revocada_en=None,
    )


def test_una_sesion_revocada_conserva_cuando() -> None:
    sesion = sesion_de_filas([fila_sesion(revocada_en="2026-11-25T08:00:00+00:00")])

    assert sesion is not None
    assert sesion.revocada_en == datetime(2026, 11, 25, 8, 0, tzinfo=UTC)


def test_sin_filas_no_hay_sesion() -> None:
    assert sesion_de_filas([]) is None


@pytest.mark.parametrize("data", [None, {}, "texto", [None], [{"id": ID}]])
def test_una_respuesta_de_sesion_con_otra_forma_es_un_error(data: object) -> None:
    with pytest.raises(ErrorDeBaseDeDatos):
        sesion_de_filas(data)


def test_los_parametros_de_rotacion_usan_los_nombres_de_la_funcion_sql() -> None:
    anterior = Sesion(uuid4(), uuid4(), "h1", datetime(2026, 12, 1, tzinfo=UTC), datetime(2026, 11, 1, tzinfo=UTC))
    nueva = Sesion(
        uuid4(), anterior.cuenta_id, "h2", datetime(2026, 12, 2, tzinfo=UTC), datetime(2026, 11, 2, tzinfo=UTC)
    )

    assert parametros_de_rotacion(anterior, nueva) == {
        "p_anterior_id": str(anterior.id),
        "p_nueva_id": str(nueva.id),
        "p_cuenta_id": str(nueva.cuenta_id),
        "p_token_hash": "h2",
        "p_expira_en": "2026-12-02T00:00:00+00:00",
        "p_creada_en": "2026-11-02T00:00:00+00:00",
    }
