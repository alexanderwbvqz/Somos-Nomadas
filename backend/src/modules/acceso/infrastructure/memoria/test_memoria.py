from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

AHORA = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)


def cuenta(correo: str = "ana@correo.com") -> Cuenta:
    return Cuenta(uuid4(), correo, "hash", False, AHORA, "v1", AHORA)


def sesion(cuenta_id: UUID | None = None, token_hash: str = "h1") -> Sesion:
    return Sesion(uuid4(), cuenta_id or uuid4(), token_hash, AHORA + timedelta(days=30), AHORA)


def revocada_en(sesiones: MemoriaSesionRepository, token_hash: str) -> datetime | None:
    encontrada = sesiones.obtener_por_token_hash(token_hash)
    assert encontrada is not None
    return encontrada.revocada_en


# Estas pruebas fijan el comportamiento que también debe cumplir el adaptador de Supabase


def test_crear_una_cuenta_con_correo_repetido_devuelve_false_y_no_cambia_nada() -> None:
    cuentas = MemoriaCuentaRepository()
    primera = cuenta()
    assert cuentas.crear(primera)
    assert not cuentas.crear(cuenta())
    assert cuentas.obtener_por_correo("ana@correo.com") == primera
    assert cuentas.cantidad() == 1


def test_obtener_cuentas_por_correo_y_por_id() -> None:
    cuentas = MemoriaCuentaRepository()
    c = cuenta()
    cuentas.crear(c)
    assert cuentas.obtener_por_id(c.id) == c
    assert cuentas.obtener_por_correo("otra@correo.com") is None
    assert cuentas.obtener_por_id(uuid4()) is None


def test_rotar_revoca_la_anterior_y_guarda_la_nueva() -> None:
    sesiones = MemoriaSesionRepository()
    anterior = sesion()
    sesiones.guardar(anterior)
    nueva = sesion(anterior.cuenta_id, "h2")
    assert sesiones.rotar(anterior, nueva)
    assert revocada_en(sesiones, "h1") is not None
    assert sesiones.obtener_por_token_hash("h2") == nueva


def test_rotar_dos_veces_la_misma_sesion_falla_la_segunda_y_no_guarda_nada() -> None:
    sesiones = MemoriaSesionRepository()
    anterior = sesion()
    sesiones.guardar(anterior)
    assert sesiones.rotar(anterior, sesion(anterior.cuenta_id, "h2"))
    # La segunda llega con la misma copia vieja (sin revocar): lo guardado manda
    assert not sesiones.rotar(anterior, sesion(anterior.cuenta_id, "h3"))
    assert sesiones.obtener_por_token_hash("h3") is None


def test_revocar_todas_de_una_cuenta_no_toca_las_de_otra() -> None:
    sesiones = MemoriaSesionRepository()
    mia, ajena = sesion(token_hash="m"), sesion(token_hash="a")
    sesiones.guardar(mia)
    sesiones.guardar(ajena)
    sesiones.revocar_todas_de_cuenta(mia.cuenta_id)
    assert revocada_en(sesiones, "m") is not None
    assert revocada_en(sesiones, "a") is None


def test_el_limitador_permite_hasta_el_maximo_y_luego_dice_cuanto_falta() -> None:
    limitador = MemoriaLimitadorIntentos()
    for _ in range(3):
        assert limitador.consumir("sesion", "ana", 3, 60, AHORA) is None
    assert limitador.consumir("sesion", "ana", 3, 60, AHORA + timedelta(seconds=10)) == 50


def test_el_limitador_vuelve_a_permitir_cuando_pasa_la_ventana() -> None:
    limitador = MemoriaLimitadorIntentos()
    for _ in range(3):
        limitador.consumir("sesion", "ana", 3, 60, AHORA)
    assert limitador.consumir("sesion", "ana", 3, 60, AHORA + timedelta(seconds=59)) is not None
    assert limitador.consumir("sesion", "ana", 3, 60, AHORA + timedelta(seconds=60)) is None


def test_el_limitador_separa_por_clave_y_por_accion() -> None:
    limitador = MemoriaLimitadorIntentos()
    for _ in range(3):
        limitador.consumir("sesion", "ana", 3, 60, AHORA)
    assert limitador.consumir("sesion", "luis", 3, 60, AHORA) is None
    assert limitador.consumir("registro", "ana", 3, 60, AHORA) is None
    assert limitador.consumir("sesion", "ana", 3, 60, AHORA) is not None
