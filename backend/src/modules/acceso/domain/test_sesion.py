from datetime import UTC, datetime, timedelta
from uuid import uuid4

from modules.acceso.domain.sesion import TOLERANCIA_REUSO_SEGUNDOS, Sesion

AHORA = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)


def sesion(**cambios: object) -> Sesion:
    base = {
        "id": uuid4(),
        "cuenta_id": uuid4(),
        "token_hash": "hash",
        "expira_en": AHORA + timedelta(days=30),
        "creada_en": AHORA,
    }
    return Sesion(**{**base, **cambios})  # type: ignore[arg-type]


def test_una_sesion_sin_revocar_y_sin_caducar_esta_vigente() -> None:
    assert sesion().esta_vigente(AHORA)


def test_una_sesion_revocada_no_esta_vigente() -> None:
    assert not sesion(revocada_en=AHORA).esta_vigente(AHORA)


def test_una_sesion_caducada_no_esta_vigente_ni_en_el_instante_exacto() -> None:
    caduca = AHORA + timedelta(days=30)
    assert sesion().esta_vigente(caduca - timedelta(seconds=1))
    assert not sesion().esta_vigente(caduca)
    assert not sesion().esta_vigente(caduca + timedelta(seconds=1))


def test_una_sesion_nueva_no_tiene_motivo_de_revocacion() -> None:
    assert sesion().motivo_revocacion is None


def test_la_tolerancia_para_reusar_un_token_rotado_es_de_10_segundos() -> None:
    assert TOLERANCIA_REUSO_SEGUNDOS == 10
