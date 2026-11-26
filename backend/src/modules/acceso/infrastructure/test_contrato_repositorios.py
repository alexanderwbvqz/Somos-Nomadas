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
from dataclasses import dataclass, replace
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from modules.acceso.domain.confirmacion import EnlaceNuevo, EnlaceUsado
from modules.acceso.domain.confirmacion_repository import ConfirmacionRepository
from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.limitador_intentos import AccionLimitada, LimitadorIntentos
from modules.acceso.domain.sesion import Sesion
from modules.acceso.domain.sesion_repository import SesionRepository
from modules.acceso.infrastructure.memoria.memoria_confirmacion_repository import MemoriaConfirmacionRepository
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository
from modules.acceso.infrastructure.supabase.supabase_confirmacion_repository import (
    SupabaseConfirmacionRepository,
)
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
    confirmaciones: ConfirmacionRepository


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
        cuentas = MemoriaCuentaRepository()
        yield Repos(
            cuentas, MemoriaSesionRepository(), MemoriaLimitadorIntentos(), MemoriaConfirmacionRepository(cuentas)
        )
        return

    url = os.environ.get("SUPABASE_PRUEBAS_URL")
    clave = os.environ.get("SUPABASE_PRUEBAS_CLAVE")
    if not url or not clave or os.environ.get("SUPABASE_PRUEBAS_CONFIRMO_BASE_DESECHABLE") != "si":
        pytest.skip("Sin base de pruebas de Supabase: ver el encabezado de test_contrato_repositorios.py")
    cliente = crear_cliente(url, clave)
    limitador = LimitadorQueRecuerda(cliente, "h" * 32)
    yield Repos(
        SupabaseCuentaRepository(cliente),
        SupabaseSesionRepository(cliente),
        limitador,
        SupabaseConfirmacionRepository(cliente),
    )

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


def sesion_de(cuenta_id: UUID, token_hash: str | None = None, creada_en: datetime = AHORA) -> Sesion:
    return Sesion(uuid4(), cuenta_id, token_hash or unico(), AHORA + timedelta(days=30), creada_en)


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


def test_actualizar_la_clave_hash_cambia_solo_la_clave_y_solo_si_sigue_siendo_la_anterior(repos: Repos) -> None:
    c = con_cuenta(repos)

    assert repos.cuentas.actualizar_clave_hash(c.id, c.clave_hash, "hash-nuevo")

    assert repos.cuentas.obtener_por_correo(c.correo) == replace(c, clave_hash="hash-nuevo")
    # El anterior ya no coincide (alguien cambió la clave en medio): no pisa nada
    assert not repos.cuentas.actualizar_clave_hash(c.id, c.clave_hash, "hash-otro")
    assert repos.cuentas.obtener_por_id(c.id) == replace(c, clave_hash="hash-nuevo")


def test_actualizar_la_clave_hash_de_otra_cuenta_o_de_una_que_no_existe_no_cambia_nada(repos: Repos) -> None:
    c = con_cuenta(repos)
    otra = con_cuenta(repos)

    assert not repos.cuentas.actualizar_clave_hash(uuid4(), c.clave_hash, "hash-nuevo")
    # Las dos cuentas tienen el mismo hash ("hash"): solo cambia la que se indica, el id manda
    assert repos.cuentas.actualizar_clave_hash(otra.id, otra.clave_hash, "hash-de-otra")

    assert repos.cuentas.obtener_por_id(c.id) == c
    assert repos.cuentas.obtener_por_id(otra.id) == replace(otra, clave_hash="hash-de-otra")


# --- Confirmación del correo ---


def enlace(dias: int = 1, creada_en: datetime = AHORA, navegador_hash: str | None = None) -> EnlaceNuevo:
    return EnlaceNuevo(uuid4(), unico(), creada_en + timedelta(days=dias), creada_en, navegador_hash)


def correo_de(usado: EnlaceUsado | None) -> str | None:
    return None if usado is None else usado.correo


def test_crear_cuenta_con_confirmacion_guarda_la_cuenta_sin_confirmar_y_su_enlace_vale(repos: Repos) -> None:
    c = cuenta()
    e = enlace()

    assert repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)

    guardada = repos.cuentas.obtener_por_correo(c.correo)
    assert guardada == replace(c, correo_confirmado=False)
    assert correo_de(repos.confirmaciones.confirmar(e.token_hash, AHORA)) == c.correo
    assert repos.cuentas.obtener_por_id(c.id) == replace(c, correo_confirmado=True)


def test_crear_con_un_correo_repetido_devuelve_false_y_no_crea_ni_cuenta_ni_enlace(repos: Repos) -> None:
    primera = cuenta()
    assert repos.confirmaciones.crear_cuenta_con_confirmacion(primera, enlace())
    repetida = cuenta(primera.correo)
    e = enlace()

    assert not repos.confirmaciones.crear_cuenta_con_confirmacion(repetida, e)

    assert repos.cuentas.obtener_por_id(repetida.id) is None
    assert repos.cuentas.obtener_por_correo(primera.correo) == replace(primera, correo_confirmado=False)
    assert repos.confirmaciones.confirmar(e.token_hash, AHORA) is None


def test_un_enlace_se_usa_una_sola_vez(repos: Repos) -> None:
    c, e = cuenta(), enlace()
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)

    assert correo_de(repos.confirmaciones.confirmar(e.token_hash, AHORA)) == c.correo
    assert repos.confirmaciones.confirmar(e.token_hash, AHORA) is None


def test_un_enlace_caducado_o_desconocido_no_confirma(repos: Repos) -> None:
    c, e = cuenta(), enlace(dias=1)
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)

    assert repos.confirmaciones.confirmar(e.token_hash, e.expira_en) is None
    assert repos.confirmaciones.confirmar(unico(), AHORA) is None
    assert repos.cuentas.obtener_por_id(c.id) == replace(c, correo_confirmado=False)
    # Un segundo antes de caducar todavía vale
    assert correo_de(repos.confirmaciones.confirmar(e.token_hash, e.expira_en - timedelta(seconds=1))) == c.correo


def test_renovar_anula_el_enlace_anterior_y_el_nuevo_vale(repos: Repos) -> None:
    c, viejo = cuenta(), enlace()
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, viejo)
    nuevo = enlace(creada_en=AHORA + timedelta(minutes=5))

    assert repos.confirmaciones.renovar(c.correo, nuevo)

    assert repos.confirmaciones.confirmar(viejo.token_hash, AHORA + timedelta(minutes=6)) is None
    assert correo_de(repos.confirmaciones.confirmar(nuevo.token_hash, AHORA + timedelta(minutes=6))) == c.correo


def test_renovar_no_hace_nada_si_la_cuenta_no_existe_o_ya_esta_confirmada(repos: Repos) -> None:
    c, e = cuenta(), enlace()
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)
    repos.confirmaciones.confirmar(e.token_hash, AHORA)
    tras_confirmar, inexistente = enlace(), enlace()

    assert not repos.confirmaciones.renovar(c.correo, tras_confirmar)
    assert not repos.confirmaciones.renovar(f"{unico()}{DOMINIO_DE_PRUEBA}", inexistente)

    assert repos.confirmaciones.confirmar(tras_confirmar.token_hash, AHORA) is None
    assert repos.confirmaciones.confirmar(inexistente.token_hash, AHORA) is None


def test_confirmar_devuelve_la_cuenta_y_la_huella_del_navegador_guardada_al_crear(repos: Repos) -> None:
    c, e = cuenta(), enlace(navegador_hash=f"huella-{unico()}")
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)

    assert repos.confirmaciones.confirmar(e.token_hash, AHORA) == EnlaceUsado(c.id, c.correo, e.navegador_hash)


def test_renovar_guarda_la_huella_del_navegador_que_pide_el_enlace_nuevo(repos: Repos) -> None:
    c, viejo = cuenta(), enlace(navegador_hash=f"huella-vieja-{unico()}")
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, viejo)
    nuevo = enlace(creada_en=AHORA + timedelta(minutes=5), navegador_hash=f"huella-nueva-{unico()}")
    repos.confirmaciones.renovar(c.correo, nuevo)

    usado = repos.confirmaciones.confirmar(nuevo.token_hash, AHORA + timedelta(minutes=6))

    assert usado == EnlaceUsado(c.id, c.correo, nuevo.navegador_hash)


def test_un_enlace_sin_huella_devuelve_la_huella_vacia(repos: Repos) -> None:
    c, e = cuenta(), enlace(navegador_hash=None)
    repos.confirmaciones.crear_cuenta_con_confirmacion(c, e)

    assert repos.confirmaciones.confirmar(e.token_hash, AHORA) == EnlaceUsado(c.id, c.correo, None)


def test_confirmar_una_cuenta_no_toca_las_demas(repos: Repos) -> None:
    una, otra = cuenta(), cuenta()
    e_una = enlace()
    repos.confirmaciones.crear_cuenta_con_confirmacion(una, e_una)
    repos.confirmaciones.crear_cuenta_con_confirmacion(otra, enlace())

    repos.confirmaciones.confirmar(e_una.token_hash, AHORA)

    assert repos.cuentas.obtener_por_id(otra.id) == replace(otra, correo_confirmado=False)


# --- Sesiones ---


def test_una_sesion_guardada_se_lee_igual_por_el_hash_de_su_token(repos: Repos) -> None:
    s = sesion_de(con_cuenta(repos).id)

    repos.sesiones.guardar(s)

    assert repos.sesiones.obtener_por_token_hash(s.token_hash) == s
    assert repos.sesiones.obtener_por_token_hash(unico()) is None


def test_rotar_revoca_la_anterior_y_guarda_la_nueva(repos: Repos) -> None:
    anterior = sesion_de(con_cuenta(repos).id)
    repos.sesiones.guardar(anterior)
    nueva = sesion_de(anterior.cuenta_id, creada_en=AHORA + timedelta(minutes=7))

    assert repos.sesiones.rotar(anterior, nueva)

    revocada = repos.sesiones.obtener_por_token_hash(anterior.token_hash)
    assert revocada is not None and revocada.motivo_revocacion == "rotada"
    # La revocación se hace en el instante en que nace la nueva (la hora de la aplicación), no con el reloj de la base
    assert revocada.revocada_en == nueva.creada_en
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

    repos.sesiones.revocar(s.id, AHORA)
    repos.sesiones.revocar(s.id, AHORA + timedelta(hours=1))  # no falla ni cambia nada

    revocada = repos.sesiones.obtener_por_token_hash(s.token_hash)
    assert revocada is not None and revocada.motivo_revocacion == "cerrada"
    assert revocada.revocada_en == AHORA  # la fecha de la primera revocación, la que puso la aplicación


def test_revocar_todas_de_una_cuenta_no_toca_las_de_otra(repos: Repos) -> None:
    mia, ajena = con_cuenta(repos), con_cuenta(repos)
    suya, de_otra = sesion_de(mia.id), sesion_de(ajena.id)
    repos.sesiones.guardar(suya)
    repos.sesiones.guardar(de_otra)

    repos.sesiones.revocar_todas_de_cuenta(mia.id, "robo", AHORA)

    revocada, intacta = (
        repos.sesiones.obtener_por_token_hash(suya.token_hash),
        repos.sesiones.obtener_por_token_hash(de_otra.token_hash),
    )
    assert revocada is not None and revocada.revocada_en == AHORA and revocada.motivo_revocacion == "robo"
    assert intacta is not None and intacta.revocada_en is None and intacta.motivo_revocacion is None


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


def test_un_motivo_ya_registrado_no_se_pisa_al_revocar_otra_vez(repos: Repos) -> None:
    anterior = sesion_de(con_cuenta(repos).id)
    repos.sesiones.guardar(anterior)
    assert repos.sesiones.rotar(anterior, sesion_de(anterior.cuenta_id))
    antes = repos.sesiones.obtener_por_token_hash(anterior.token_hash)
    assert antes is not None

    repos.sesiones.revocar(anterior.id, AHORA + timedelta(hours=1))
    repos.sesiones.revocar_todas_de_cuenta(anterior.cuenta_id, "robo", AHORA + timedelta(hours=2))

    despues = repos.sesiones.obtener_por_token_hash(anterior.token_hash)
    assert despues is not None
    # Sigue siendo «rotada», con la fecha original: de lo contrario no se podría distinguir un robo de una carrera
    assert despues.motivo_revocacion == "rotada" and despues.revocada_en == antes.revocada_en


def test_la_fecha_de_revocacion_es_siempre_la_de_la_aplicacion_aunque_sea_muy_antigua(repos: Repos) -> None:
    # Si la base usara su propio reloj (now()), guardaría la fecha de hoy y no esta: así se detecta
    antigua = AHORA - timedelta(days=400)
    cuenta = con_cuenta(repos)
    cerrada, rotada, del_robo = (sesion_de(cuenta.id) for _ in range(3))
    for s in (cerrada, rotada, del_robo):
        repos.sesiones.guardar(s)

    repos.sesiones.revocar(cerrada.id, antigua)
    assert repos.sesiones.rotar(rotada, sesion_de(cuenta.id, creada_en=antigua))
    repos.sesiones.revocar_todas_de_cuenta(cuenta.id, "robo", antigua)

    for s in (cerrada, rotada, del_robo):
        guardada = repos.sesiones.obtener_por_token_hash(s.token_hash)
        assert guardada is not None and guardada.revocada_en == antigua, s.token_hash
