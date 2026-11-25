"""Comprueba el cableado: qué adaptador queda conectado a cada puerto según la configuración."""

from datetime import UTC, datetime
from typing import Any, cast
from uuid import uuid4

import pytest
from supabase import Client

from composition.acceso.dependencias import armar_acceso
from modules.acceso.infrastructure.memoria.hasheador_falso import HasheadorFalso
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository
from modules.acceso.infrastructure.seguridad.argon2_hasheador import Argon2Hasheador
from modules.acceso.infrastructure.seguridad.jwt_emisor import JwtEmisor
from modules.acceso.infrastructure.supabase.cliente_falso import ClienteFalso
from modules.acceso.infrastructure.supabase.supabase_cuenta_repository import SupabaseCuentaRepository
from modules.acceso.infrastructure.supabase.supabase_limitador_intentos import SupabaseLimitadorIntentos
from modules.acceso.infrastructure.supabase.supabase_sesion_repository import SupabaseSesionRepository
from shared.config.config import Configuracion

JWT = "jwt-secreto-" + "j" * 30
HUELLAS = "huellas-secreto-" + "h" * 30


@pytest.fixture(autouse=True)
def entorno_limpio(monkeypatch: pytest.MonkeyPatch) -> None:
    for nombre in (
        "ENTORNO",
        "ALMACEN_DE_DATOS",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "EXIGIR_CORREO_CONFIRMADO",
    ):
        monkeypatch.delenv(nombre, raising=False)


def config(**cambios: Any) -> Configuracion:
    base: dict[str, Any] = {"entorno": "desarrollo", "almacen_de_datos": "memoria", "jwt_secreto": JWT}
    return Configuracion(_env_file=None, **{**base, **cambios})  # type: ignore[call-arg]


def config_supabase(**cambios: Any) -> Configuracion:
    base: dict[str, Any] = {
        "almacen_de_datos": "supabase",
        "supabase_url": "https://abcdefgh.supabase.co",
        "supabase_service_role_key": "llave-de-servidor-" + "k" * 30,
        "huellas_secreto": HUELLAS,
    }
    return config(**{**base, **cambios})


def reloj() -> datetime:
    return datetime(2026, 11, 24, 12, 0, tzinfo=UTC)


# --- Almacén en memoria ---


def test_en_memoria_usa_los_repositorios_en_memoria_y_la_criptografia_real() -> None:
    casos = armar_acceso(config(), None, reloj)

    assert isinstance(casos.registrar_cuenta._cuentas, MemoriaCuentaRepository)
    assert isinstance(casos.iniciar_sesion._sesiones, MemoriaSesionRepository)
    assert isinstance(casos.iniciar_sesion._limitador, MemoriaLimitadorIntentos)
    # Aunque los datos estén en memoria, las claves y los tokens son los de verdad: nunca los dobles de prueba
    assert isinstance(casos.registrar_cuenta._hasheador, Argon2Hasheador)
    assert not isinstance(casos.registrar_cuenta._hasheador, HasheadorFalso)
    assert isinstance(casos.iniciar_sesion._emisor, JwtEmisor)


def test_los_casos_de_uso_comparten_los_mismos_repositorios() -> None:
    casos = armar_acceso(config(), None, reloj)

    # Si no fueran los mismos, una cuenta registrada no existiría al iniciar sesión
    assert casos.registrar_cuenta._cuentas is casos.iniciar_sesion._cuentas is casos.obtener_cuenta_actual._cuentas
    assert casos.iniciar_sesion._sesiones is casos.renovar_sesion._sesiones is casos.cerrar_sesion._sesiones
    assert casos.registrar_cuenta._limitador is casos.iniciar_sesion._limitador
    assert casos.iniciar_sesion._emisor is casos.renovar_sesion._emisor is casos.cerrar_sesion._emisor


def test_el_emisor_de_tokens_usa_el_secreto_de_la_configuracion() -> None:
    cuenta = uuid4()
    propio = JwtEmisor(JWT).emitir_acceso(cuenta, reloj()).valor
    ajeno = JwtEmisor("otro-secreto-" + "z" * 30).emitir_acceso(cuenta, reloj()).valor
    emisor = armar_acceso(config(), None, reloj).iniciar_sesion._emisor

    assert emisor.validar_acceso(propio, reloj()) == cuenta
    assert emisor.validar_acceso(ajeno, reloj()) is None


def test_cada_armado_crea_su_propio_estado() -> None:
    uno, otro = armar_acceso(config(), None, reloj), armar_acceso(config(), None, reloj)

    assert uno.registrar_cuenta._cuentas is not otro.registrar_cuenta._cuentas


def test_pasa_la_configuracion_a_los_casos_de_uso() -> None:
    casos = armar_acceso(config(exigir_correo_confirmado=False, politica_version="2027-01"), None, reloj)

    assert casos.iniciar_sesion._exigir_correo_confirmado is False
    assert casos.registrar_cuenta._politica_version == "2027-01"
    assert armar_acceso(config(), None, reloj).iniciar_sesion._exigir_correo_confirmado is True


def test_los_casos_de_uso_usan_el_reloj_recibido() -> None:
    casos = armar_acceso(config(), None, reloj)

    assert casos.registrar_cuenta._ahora is reloj
    assert casos.iniciar_sesion._ahora is reloj
    assert casos.renovar_sesion._ahora is reloj
    assert casos.obtener_cuenta_actual._ahora is reloj
    assert casos.cerrar_sesion._ahora is reloj


# --- Almacén en Supabase ---


def test_con_supabase_usa_los_adaptadores_de_supabase_con_el_mismo_cliente() -> None:
    cliente = cast(Client, ClienteFalso())

    casos = armar_acceso(config_supabase(), cliente, reloj)

    assert isinstance(casos.registrar_cuenta._cuentas, SupabaseCuentaRepository)
    assert isinstance(casos.iniciar_sesion._sesiones, SupabaseSesionRepository)
    assert isinstance(casos.iniciar_sesion._limitador, SupabaseLimitadorIntentos)
    assert casos.registrar_cuenta._cuentas._cliente is cliente
    assert casos.iniciar_sesion._sesiones._cliente is cliente
    assert casos.iniciar_sesion._limitador._cliente is cliente
    assert isinstance(casos.registrar_cuenta._hasheador, Argon2Hasheador)


def test_con_supabase_el_limitador_recibe_el_secreto_de_huellas() -> None:
    casos = armar_acceso(config_supabase(), cast(Client, ClienteFalso()), reloj)

    limitador = casos.iniciar_sesion._limitador
    assert isinstance(limitador, SupabaseLimitadorIntentos)
    assert limitador._secreto == HUELLAS.encode()


def test_con_supabase_sin_cliente_es_un_error() -> None:
    with pytest.raises(ValueError, match="cliente"):
        armar_acceso(config_supabase(), None, reloj)
