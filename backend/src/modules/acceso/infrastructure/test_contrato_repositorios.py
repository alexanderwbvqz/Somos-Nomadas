"""Pruebas de contrato de los puertos: las mismas pruebas contra el adaptador en memoria y contra Supabase.

Fijan el comportamiento que debe cumplir cualquier adaptador (y que los casos de uso dan por hecho). La parte de
Supabase SOLO corre si se configura una base DESECHABLE, con estas variables de entorno:

    SUPABASE_PRUEBAS_URL                        URL del proyecto de pruebas
    SUPABASE_PRUEBAS_CLAVE                      su clave de servidor
    SUPABASE_PRUEBAS_CONFIRMO_BASE_DESECHABLE   debe valer «si»: confirma que no es la base real

con las migraciones de migraciones/ ya aplicadas (scripts/aplicar_migraciones.py). Los datos de prueba llevan
correos @pruebas.invalid (un dominio reservado que no existe) y, al terminar cada prueba, se borran SOLO esas cuentas
(con sus sesiones, por la cascada) y los contadores de intentos que la propia prueba creó. Aun así, no se apuntan a
una base con datos reales.
Mientras no haya base de pruebas, la parte de Supabase aparece como «skipped», NO como verificada.
"""

import os
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.limitador_intentos import AccionLimitada, LimitadorIntentos
from modules.acceso.domain.sesion import Sesion
from modules.acceso.domain.sesion_repository import SesionRepository
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository
from modules.acceso.infrastructure.supabase.supabase_cuenta_repository import SupabaseCuentaRepository
from modules.acceso.infrastructure.supabase.supabase_limitador_intentos import SupabaseLimitadorIntentos
from modules.acceso.infrastructure.supabase.supabase_sesion_repository import SupabaseSesionRepository
from shared.supabase.cliente import crear_cliente
from shared.supabase.errores import traducir_errores

AHORA = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)
# Dominio reservado (RFC 2606): nunca existe. Es lo que permite borrar solo las cuentas de las pruebas
DOMINIO_DE_PRUEBA = "@pruebas.invalid"


@dataclass
class Repos:
    cuentas: CuentaRepository
    sesiones: SesionRepository
    limitador: LimitadorIntentos


class LimitadorQueRecuerda(SupabaseLimitadorIntentos):
    """Anota las huellas que crea, para borrar luego solo los contadores de la propia prueba."""

    huellas: list[str]

    def consumir(
        self, accion: AccionLimitada, clave: str, maximo: int, ventana_segundos: int, ahora: datetime
    ) -> int | None:
        if not hasattr(self, "huellas"):
            self.huellas = []
        self.huellas.append(self._huella(accion, clave))
        return super().consumir(accion, clave, maximo, ventana_segundos, ahora)


@pytest.fixture(params=["memoria", "supabase"])
def repos(request: pytest.FixtureRequest) -> Iterator[Repos]:
    if request.param == "memoria":
        yield Repos(MemoriaCuentaRepository(), MemoriaSesionRepository(), MemoriaLimitadorIntentos())
        return

    url = os.environ.get("SUPABASE_PRUEBAS_URL")
    clave = os.environ.get("SUPABASE_PRUEBAS_CLAVE")
    if not url or not clave or os.environ.get("SUPABASE_PRUEBAS_CONFIRMO_BASE_DESECHABLE") != "si":
        pytest.skip("Sin base de pruebas de Supabase: ver el encabezado de test_contrato_repositorios.py")
    cliente = crear_cliente(url, clave)
    limitador = LimitadorQueRecuerda(cliente, "h" * 32)
    yield Repos(SupabaseCuentaRepository(cliente), SupabaseSesionRepository(cliente), limitador)

    # Limpieza: solo lo de las pruebas. Las sesiones se borran solas con su cuenta (on delete cascade)
    with traducir_errores():
        cliente.table("cuentas").delete().like("correo", f"%{DOMINIO_DE_PRUEBA}").execute()
        huellas = getattr(limitador, "huellas", [])
        if huellas:
            cliente.table("intentos_acceso").delete().in_("huella", huellas).execute()


def unico() -> str:
    return uuid4().hex


def cuenta(correo: str | None = None) -> Cuenta:
    return Cuenta(uuid4(), correo or f"{unico()}{DOMINIO_DE_PRUEBA}", "hash", False, AHORA, "2026-11", AHORA)


def sesion_de(cuenta_id: UUID, token_hash: str | None = None) -> Sesion:
    return Sesion(uuid4(), cuenta_id, token_hash or unico(), AHORA + timedelta(days=30), AHORA)


def con_cuenta(repos: Repos) -> Cuenta:
    """Las sesiones dependen de una cuenta (clave foránea en la base)."""
    c = cuenta()
    assert repos.cuentas.crear(c)
    return c


# --- Cuentas ---


def test_una_cuenta_creada_se_lee_igual_por_correo_y_por_id(repos: Repos) -> None:
    c = cuenta()

    assert repos.cuentas.crear(c)

    assert repos.cuentas.obtener_por_correo(c.correo) == c
    assert repos.cuentas.obtener_por_id(c.id) == c


def test_crear_con_un_correo_repetido_devuelve_false_y_no_cambia_nada(repos: Repos) -> None:
    primera = cuenta()
    assert repos.cuentas.crear(primera)

    repetida = cuenta(primera.correo)
    assert not repos.cuentas.crear(repetida)

    assert repos.cuentas.obtener_por_correo(primera.correo) == primera
    assert repos.cuentas.obtener_por_id(repetida.id) is None


def test_una_cuenta_que_no_existe_devuelve_none(repos: Repos) -> None:
    assert repos.cuentas.obtener_por_correo(f"{unico()}{DOMINIO_DE_PRUEBA}") is None
    assert repos.cuentas.obtener_por_id(uuid4()) is None


# --- Sesiones ---


def test_una_sesion_guardada_se_lee_igual_por_el_hash_de_su_token(repos: Repos) -> None:
    s = sesion_de(con_cuenta(repos).id)

    repos.sesiones.guardar(s)

    assert repos.sesiones.obtener_por_token_hash(s.token_hash) == s
    assert repos.sesiones.obtener_por_token_hash(unico()) is None


def test_rotar_revoca_la_anterior_y_guarda_la_nueva(repos: Repos) -> None:
    anterior = sesion_de(con_cuenta(repos).id)
    repos.sesiones.guardar(anterior)
    nueva = sesion_de(anterior.cuenta_id)

    assert repos.sesiones.rotar(anterior, nueva)

    revocada = repos.sesiones.obtener_por_token_hash(anterior.token_hash)
    assert revocada is not None and revocada.revocada_en is not None
    assert repos.sesiones.obtener_por_token_hash(nueva.token_hash) == nueva


def test_rotar_dos_veces_la_misma_sesion_falla_la_segunda_y_no_guarda_nada(repos: Repos) -> None:
    anterior = sesion_de(con_cuenta(repos).id)
    repos.sesiones.guardar(anterior)
    assert repos.sesiones.rotar(anterior, sesion_de(anterior.cuenta_id))

    # La segunda llega con la misma copia vieja (sin revocar): lo guardado manda
    intento = sesion_de(anterior.cuenta_id)
    assert not repos.sesiones.rotar(anterior, intento)

    assert repos.sesiones.obtener_por_token_hash(intento.token_hash) is None


def test_rotar_una_sesion_que_no_existe_devuelve_false(repos: Repos) -> None:
    fantasma = sesion_de(con_cuenta(repos).id)  # nunca se guardó

    assert not repos.sesiones.rotar(fantasma, sesion_de(fantasma.cuenta_id))


def test_revocar_marca_la_sesion_y_es_idempotente(repos: Repos) -> None:
    s = sesion_de(con_cuenta(repos).id)
    repos.sesiones.guardar(s)

    repos.sesiones.revocar(s.id)
    repos.sesiones.revocar(s.id)  # no falla ni cambia nada

    revocada = repos.sesiones.obtener_por_token_hash(s.token_hash)
    assert revocada is not None and revocada.revocada_en is not None


def test_revocar_todas_de_una_cuenta_no_toca_las_de_otra(repos: Repos) -> None:
    mia, ajena = con_cuenta(repos), con_cuenta(repos)
    suya, de_otra = sesion_de(mia.id), sesion_de(ajena.id)
    repos.sesiones.guardar(suya)
    repos.sesiones.guardar(de_otra)

    repos.sesiones.revocar_todas_de_cuenta(mia.id)

    revocada, intacta = (
        repos.sesiones.obtener_por_token_hash(suya.token_hash),
        repos.sesiones.obtener_por_token_hash(de_otra.token_hash),
    )
    assert revocada is not None and revocada.revocada_en is not None
    assert intacta is not None and intacta.revocada_en is None


# --- Límite de intentos ---


def test_el_limitador_permite_hasta_el_maximo_y_luego_dice_cuanto_falta(repos: Repos) -> None:
    clave = unico()
    for _ in range(3):
        assert repos.limitador.consumir("sesion", clave, 3, 60, AHORA) is None

    assert repos.limitador.consumir("sesion", clave, 3, 60, AHORA + timedelta(seconds=10)) == 50


def test_el_limitador_vuelve_a_permitir_cuando_pasa_la_ventana(repos: Repos) -> None:
    clave = unico()
    for _ in range(3):
        repos.limitador.consumir("sesion", clave, 3, 60, AHORA)

    assert repos.limitador.consumir("sesion", clave, 3, 60, AHORA + timedelta(seconds=59)) is not None
    assert repos.limitador.consumir("sesion", clave, 3, 60, AHORA + timedelta(seconds=60)) is None


def test_el_limitador_separa_por_clave_y_por_accion(repos: Repos) -> None:
    clave, otra = unico(), unico()
    for _ in range(3):
        repos.limitador.consumir("sesion", clave, 3, 60, AHORA)

    assert repos.limitador.consumir("sesion", otra, 3, 60, AHORA) is None
    assert repos.limitador.consumir("registro", clave, 3, 60, AHORA) is None
    assert repos.limitador.consumir("sesion", clave, 3, 60, AHORA) is not None
