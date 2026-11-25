from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

INICIO = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)
CUANDO = INICIO + timedelta(minutes=5)


def sesion(cuenta_id: UUID | None = None, token_hash: str = "h1", creada_en: datetime = INICIO) -> Sesion:
    return Sesion(uuid4(), cuenta_id or uuid4(), token_hash, INICIO + timedelta(days=30), creada_en)


def test_la_fecha_de_revocacion_es_la_que_manda_la_aplicacion_y_no_la_del_sistema() -> None:
    sesiones = MemoriaSesionRepository()
    una, otra, tercera = sesion(token_hash="a"), sesion(token_hash="b"), sesion(token_hash="c")
    for s in (una, otra, tercera):
        sesiones.guardar(s)

    sesiones.revocar(una.id, CUANDO)
    # Al rotar, la anterior se revoca en el instante en que nace la nueva: el de la aplicación
    assert sesiones.rotar(otra, sesion(otra.cuenta_id, "d", creada_en=CUANDO))
    sesiones.revocar_todas_de_cuenta(tercera.cuenta_id, "robo", CUANDO)

    for token, motivo in (("a", "cerrada"), ("b", "rotada"), ("c", "robo")):
        guardada = sesiones.obtener_por_token_hash(token)
        assert guardada is not None
        assert guardada.revocada_en == CUANDO, token
        assert guardada.motivo_revocacion == motivo, token


def test_revocar_otra_vez_no_cambia_ni_la_fecha_ni_el_motivo() -> None:
    sesiones = MemoriaSesionRepository()
    s = sesion()
    sesiones.guardar(s)
    sesiones.revocar(s.id, CUANDO)

    sesiones.revocar(s.id, CUANDO + timedelta(hours=1))
    sesiones.revocar_todas_de_cuenta(s.cuenta_id, "robo", CUANDO + timedelta(hours=2))

    guardada = sesiones.obtener_por_token_hash("h1")
    assert guardada is not None and guardada.revocada_en == CUANDO and guardada.motivo_revocacion == "cerrada"
