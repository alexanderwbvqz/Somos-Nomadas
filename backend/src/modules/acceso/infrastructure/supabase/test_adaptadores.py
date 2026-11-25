"""Prueba cómo los adaptadores hablan con el cliente: qué función o tabla piden, con qué parámetros y cómo
traducen lo que vuelve. NO prueba el SQL (eso lo hace test_contrato_repositorios.py contra una base real)."""

from datetime import UTC, datetime, timedelta
from typing import cast
from uuid import UUID, uuid4

import httpx
import pytest
from postgrest.exceptions import APIError
from supabase import Client

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.supabase.cliente_falso import ClienteFalso
from modules.acceso.infrastructure.supabase.supabase_cuenta_repository import SupabaseCuentaRepository
from modules.acceso.infrastructure.supabase.supabase_limitador_intentos import SupabaseLimitadorIntentos
from modules.acceso.infrastructure.supabase.supabase_sesion_repository import SupabaseSesionRepository
from shared.supabase.errores import ErrorDeBaseDeDatos

AHORA = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)
SECRETO = "h" * 32


def como_cliente(falso: ClienteFalso) -> Client:
    return cast(Client, falso)


def cuenta() -> Cuenta:
    return Cuenta(uuid4(), "ana@correo.com", "hash", False, AHORA, "v1", AHORA)


def sesion(cuenta_id: UUID | None = None, token_hash: str = "h1") -> Sesion:
    return Sesion(uuid4(), cuenta_id or uuid4(), token_hash, AHORA + timedelta(days=30), AHORA)


def fila_cuenta(c: Cuenta) -> dict[str, object]:
    return {
        "id": str(c.id),
        "correo": c.correo,
        "clave_hash": c.clave_hash,
        "correo_confirmado": c.correo_confirmado,
        "politica_aceptada_en": c.politica_aceptada_en.isoformat(),
        "politica_version": c.politica_version,
        "creada_en": c.creada_en.isoformat(),
    }


def fila_sesion(s: Sesion) -> dict[str, object]:
    return {
        "id": str(s.id),
        "cuenta_id": str(s.cuenta_id),
        "token_hash": s.token_hash,
        "expira_en": s.expira_en.isoformat(),
        "creada_en": s.creada_en.isoformat(),
        "revocada_en": None,
        "motivo_revocacion": None,
    }


def error_de_postgres() -> APIError:
    return APIError({"code": "23505", "message": "duplicado", "details": "Key (correo)=(ana@correo.com)", "hint": None})


# --- Cuentas ---


def test_crear_llama_a_la_funcion_crear_cuenta_con_los_parametros_de_la_cuenta() -> None:
    falso = ClienteFalso({"crear_cuenta": True})
    c = cuenta()

    assert SupabaseCuentaRepository(como_cliente(falso)).crear(c) is True

    (llamada,) = falso.llamadas
    assert (llamada.tipo, llamada.nombre) == ("rpc", "crear_cuenta")
    assert llamada.parametros["p_id"] == str(c.id)
    assert llamada.parametros["p_correo"] == "ana@correo.com"
    assert llamada.parametros["p_clave_hash"] == "hash"


def test_crear_devuelve_false_si_la_base_dice_que_el_correo_ya_existia() -> None:
    falso = ClienteFalso({"crear_cuenta": False})

    assert SupabaseCuentaRepository(como_cliente(falso)).crear(cuenta()) is False


@pytest.mark.parametrize("respuesta", [None, 1, "true", [], {}])
def test_crear_con_una_respuesta_que_no_es_booleana_es_un_error(respuesta: object) -> None:
    falso = ClienteFalso({"crear_cuenta": respuesta})

    with pytest.raises(ErrorDeBaseDeDatos):
        SupabaseCuentaRepository(como_cliente(falso)).crear(cuenta())


def test_actualizar_la_clave_hash_llama_a_una_funcion_sql_para_que_el_hash_no_vaya_en_la_url() -> None:
    falso = ClienteFalso({"actualizar_clave_hash": True})
    cuenta_id = uuid4()

    assert SupabaseCuentaRepository(como_cliente(falso)).actualizar_clave_hash(cuenta_id, "viejo", "nuevo") is True

    (llamada,) = falso.llamadas
    assert (llamada.tipo, llamada.nombre) == ("rpc", "actualizar_clave_hash")
    assert llamada.parametros == {
        "p_cuenta_id": str(cuenta_id),
        "p_clave_hash_anterior": "viejo",
        "p_clave_hash_nuevo": "nuevo",
    }


def test_actualizar_la_clave_hash_devuelve_false_si_la_base_dice_que_ya_no_era_el_anterior() -> None:
    falso = ClienteFalso({"actualizar_clave_hash": False})

    assert SupabaseCuentaRepository(como_cliente(falso)).actualizar_clave_hash(uuid4(), "a", "b") is False


@pytest.mark.parametrize("respuesta", [None, 1, "true", [], {}])
def test_actualizar_la_clave_hash_con_una_respuesta_que_no_es_booleana_es_un_error(respuesta: object) -> None:
    falso = ClienteFalso({"actualizar_clave_hash": respuesta})

    with pytest.raises(ErrorDeBaseDeDatos):
        SupabaseCuentaRepository(como_cliente(falso)).actualizar_clave_hash(uuid4(), "a", "b")


def test_obtener_por_correo_llama_a_una_funcion_sql_para_que_el_correo_no_vaya_en_la_url() -> None:
    c = cuenta()
    falso = ClienteFalso({"obtener_cuenta_por_correo": [fila_cuenta(c)]})

    assert SupabaseCuentaRepository(como_cliente(falso)).obtener_por_correo("ana@correo.com") == c

    (llamada,) = falso.llamadas
    # Una consulta con .eq("correo", ...) pondría el correo en la URL (y en los logs de quien la vea)
    assert (llamada.tipo, llamada.nombre) == ("rpc", "obtener_cuenta_por_correo")
    assert llamada.parametros == {"p_correo": "ana@correo.com"}
    assert llamada.filtros == []


def test_obtener_por_id_consulta_la_tabla_con_columnas_explicitas_y_un_limite() -> None:
    c = cuenta()
    falso = ClienteFalso({"cuentas": [fila_cuenta(c)]})

    assert SupabaseCuentaRepository(como_cliente(falso)).obtener_por_id(c.id) == c

    (llamada,) = falso.llamadas
    assert (llamada.tipo, llamada.nombre) == ("select", "cuentas")
    assert llamada.filtros == [("id", str(c.id))]
    assert llamada.limite == 1
    assert "*" not in llamada.columnas  # una columna nueva en la tabla no debe llegar sin pasar por el mapper
    assert {"id", "correo", "clave_hash", "correo_confirmado"} <= set(llamada.columnas)


def test_obtener_por_correo_sin_resultados_devuelve_none() -> None:
    falso = ClienteFalso({"obtener_cuenta_por_correo": []})

    assert SupabaseCuentaRepository(como_cliente(falso)).obtener_por_correo("nadie@correo.com") is None


@pytest.mark.parametrize("error", [error_de_postgres(), httpx.ConnectError("sin red")])
def test_los_errores_de_la_base_se_traducen_sin_el_mensaje(error: Exception) -> None:
    repositorio = SupabaseCuentaRepository(como_cliente(ClienteFalso(error=error)))

    for accion in (
        lambda: repositorio.crear(cuenta()),
        lambda: repositorio.obtener_por_correo("ana@correo.com"),
        lambda: repositorio.obtener_por_id(uuid4()),
    ):
        with pytest.raises(ErrorDeBaseDeDatos) as capturado:
            accion()
        assert "ana@correo.com" not in str(capturado.value) + repr(capturado.value)


# --- Sesiones ---


def test_guardar_inserta_la_fila_en_la_tabla_sesiones() -> None:
    falso = ClienteFalso()
    s = sesion()

    SupabaseSesionRepository(como_cliente(falso)).guardar(s)

    (llamada,) = falso.llamadas
    assert (llamada.tipo, llamada.nombre) == ("insert", "sesiones")
    assert llamada.parametros == {
        "id": str(s.id),
        "cuenta_id": str(s.cuenta_id),
        "token_hash": "h1",
        "expira_en": s.expira_en.isoformat(),
        "creada_en": s.creada_en.isoformat(),
    }
    assert "revocada_en" not in llamada.parametros  # una sesión nueva nace sin revocar: lo decide la base


def test_obtener_por_token_hash_consulta_por_el_hash() -> None:
    s = sesion()
    falso = ClienteFalso({"sesiones": [fila_sesion(s)]})

    assert SupabaseSesionRepository(como_cliente(falso)).obtener_por_token_hash("h1") == s

    assert falso.llamadas[0].filtros == [("token_hash", "h1")]
    assert falso.llamadas[0].limite == 1


def test_obtener_por_token_hash_sin_resultados_devuelve_none() -> None:
    falso = ClienteFalso({"sesiones": []})

    assert SupabaseSesionRepository(como_cliente(falso)).obtener_por_token_hash("h1") is None


def test_rotar_llama_a_la_funcion_atomica_y_devuelve_lo_que_responde() -> None:
    anterior = sesion()
    nueva = sesion(anterior.cuenta_id, "h2")
    for respuesta in (True, False):
        falso = ClienteFalso({"rotar_sesion": respuesta})

        assert SupabaseSesionRepository(como_cliente(falso)).rotar(anterior, nueva) is respuesta

        (llamada,) = falso.llamadas
        assert (llamada.tipo, llamada.nombre) == ("rpc", "rotar_sesion")
        assert llamada.parametros["p_anterior_id"] == str(anterior.id)
        assert llamada.parametros["p_token_hash"] == "h2"


@pytest.mark.parametrize("respuesta", [None, 1, "true"])
def test_rotar_con_una_respuesta_que_no_es_booleana_es_un_error(respuesta: object) -> None:
    falso = ClienteFalso({"rotar_sesion": respuesta})

    with pytest.raises(ErrorDeBaseDeDatos):
        SupabaseSesionRepository(como_cliente(falso)).rotar(sesion(), sesion())


def test_revocar_y_revocar_todas_llaman_a_sus_funciones() -> None:
    falso = ClienteFalso()
    repositorio = SupabaseSesionRepository(como_cliente(falso))
    sesion_id, cuenta_id = uuid4(), uuid4()

    repositorio.revocar(sesion_id, AHORA)
    repositorio.revocar_todas_de_cuenta(cuenta_id, "robo", AHORA)

    assert [(c.tipo, c.nombre, c.parametros) for c in falso.llamadas] == [
        ("rpc", "revocar_sesion", {"p_sesion_id": str(sesion_id), "p_ahora": AHORA.isoformat()}),
        (
            "rpc",
            "revocar_sesiones_de_cuenta",
            {"p_cuenta_id": str(cuenta_id), "p_motivo": "robo", "p_ahora": AHORA.isoformat()},
        ),
    ]


@pytest.mark.parametrize("motivo", ["rotada", "cerrada", "robo"])
def test_revocar_todas_envia_el_motivo_que_se_le_da(motivo: str) -> None:
    falso = ClienteFalso()
    cuenta_id = uuid4()

    SupabaseSesionRepository(como_cliente(falso)).revocar_todas_de_cuenta(cuenta_id, motivo, AHORA)  # type: ignore[arg-type]

    assert falso.llamadas[0].parametros == {
        "p_cuenta_id": str(cuenta_id),
        "p_motivo": motivo,
        "p_ahora": AHORA.isoformat(),
    }


def test_los_errores_de_la_base_en_sesiones_se_traducen() -> None:
    repositorio = SupabaseSesionRepository(como_cliente(ClienteFalso(error=error_de_postgres())))

    for accion in (
        lambda: repositorio.guardar(sesion()),
        lambda: repositorio.obtener_por_token_hash("h1"),
        lambda: repositorio.rotar(sesion(), sesion()),
        lambda: repositorio.revocar(uuid4(), AHORA),
        lambda: repositorio.revocar_todas_de_cuenta(uuid4(), "robo", AHORA),
    ):
        with pytest.raises(ErrorDeBaseDeDatos):
            accion()


# --- Límite de intentos ---


def test_consumir_llama_a_la_funcion_con_la_huella_y_devuelve_none_si_esta_permitido() -> None:
    falso = ClienteFalso({"consumir_intento": None})

    resultado = SupabaseLimitadorIntentos(como_cliente(falso), SECRETO).consumir(
        "sesion", "ana@correo.com", 5, 900, AHORA
    )

    assert resultado is None
    (llamada,) = falso.llamadas
    assert (llamada.tipo, llamada.nombre) == ("rpc", "consumir_intento")
    assert llamada.parametros["p_accion"] == "sesion"
    assert llamada.parametros["p_maximo"] == 5
    assert llamada.parametros["p_ventana_segundos"] == 900
    assert llamada.parametros["p_ahora"] == AHORA.isoformat()


def test_consumir_devuelve_los_segundos_de_espera() -> None:
    falso = ClienteFalso({"consumir_intento": 42})

    assert SupabaseLimitadorIntentos(como_cliente(falso), SECRETO).consumir("sesion", "x", 5, 900, AHORA) == 42


def test_la_huella_nunca_es_el_correo_ni_la_ip_en_claro() -> None:
    falso = ClienteFalso({"consumir_intento": None})
    limitador = SupabaseLimitadorIntentos(como_cliente(falso), SECRETO)

    limitador.consumir("sesion", "ana@correo.com", 5, 900, AHORA)
    limitador.consumir("registro", "203.0.113.7", 5, 900, AHORA)

    for llamada in falso.llamadas:
        huella = llamada.parametros["p_huella"]
        assert "ana@correo.com" not in huella and "203.0.113.7" not in huella
        assert len(huella) == 64
        int(huella, 16)  # hexadecimal


def test_la_huella_es_estable_y_depende_de_la_clave_la_accion_y_el_secreto() -> None:
    def huella(secreto: str, accion: str, clave: str) -> object:
        falso = ClienteFalso({"consumir_intento": None})
        SupabaseLimitadorIntentos(como_cliente(falso), secreto).consumir(accion, clave, 5, 900, AHORA)  # type: ignore[arg-type]
        return falso.llamadas[0].parametros["p_huella"]

    base = huella(SECRETO, "sesion", "ana@correo.com")
    assert base == huella(SECRETO, "sesion", "ana@correo.com")
    assert base != huella(SECRETO, "sesion", "luis@correo.com")
    assert base != huella(SECRETO, "registro", "ana@correo.com")
    assert base != huella("otro-secreto-" + "z" * 32, "sesion", "ana@correo.com")


def test_el_limitador_exige_un_secreto_de_al_menos_32_caracteres() -> None:
    cliente = como_cliente(ClienteFalso())
    for corto in ["", "corto", "x" * 31]:
        with pytest.raises(ValueError, match="32"):
            SupabaseLimitadorIntentos(cliente, corto)
    SupabaseLimitadorIntentos(cliente, "x" * 32)  # no lanza


@pytest.mark.parametrize("respuesta", ["42", True, 4.5, [], {}])
def test_consumir_con_una_respuesta_que_no_es_entero_ni_nulo_es_un_error(respuesta: object) -> None:
    falso = ClienteFalso({"consumir_intento": respuesta})

    with pytest.raises(ErrorDeBaseDeDatos):
        SupabaseLimitadorIntentos(como_cliente(falso), SECRETO).consumir("sesion", "x", 5, 900, AHORA)


def test_consumir_traduce_los_errores_de_la_base() -> None:
    limitador = SupabaseLimitadorIntentos(como_cliente(ClienteFalso(error=error_de_postgres())), SECRETO)

    with pytest.raises(ErrorDeBaseDeDatos):
        limitador.consumir("sesion", "x", 5, 900, AHORA)
