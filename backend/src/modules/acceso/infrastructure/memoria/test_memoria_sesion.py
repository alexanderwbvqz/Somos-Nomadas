from datetime import UTC, datetime, timedelta
from uuid import uuid4

from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

INICIO = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)


def sesion(cuenta_id=None, token_hash: str = "h1") -> Sesion:  # type: ignore[no-untyped-def]
    return Sesion(uuid4(), cuenta_id or uuid4(), token_hash, INICIO + timedelta(days=30), INICIO)


def test_la_fecha_de_revocacion_sale_del_reloj_recibido_y_no_del_del_sistema() -> None:
    reloj = {"ahora": INICIO}
    sesiones = MemoriaSesionRepository(ahora=lambda: reloj["ahora"])
    una, otra, tercera = sesion(token_hash="a"), sesion(token_hash="b"), sesion(token_hash="c")
    for s in (una, otra, tercera):
        sesiones.guardar(s)

    reloj["ahora"] = INICIO + timedelta(minutes=5)
    sesiones.revocar(una.id)
    assert sesiones.rotar(otra, sesion(otra.cuenta_id, "d"))
    sesiones.revocar_todas_de_cuenta(tercera.cuenta_id, "robo")

    for token, motivo in (("a", "cerrada"), ("b", "rotada"), ("c", "robo")):
        guardada = sesiones.obtener_por_token_hash(token)
        assert guardada is not None
        assert guardada.revocada_en == INICIO + timedelta(minutes=5), token
        assert guardada.motivo_revocacion == motivo, token
