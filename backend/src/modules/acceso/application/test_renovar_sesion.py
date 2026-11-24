from dataclasses import replace
from datetime import timedelta
from uuid import UUID

import pytest

from modules.acceso.application.conftest import CLAVE, Entorno
from modules.acceso.domain.cuenta import DatosInicioSesion
from modules.acceso.domain.errores import NoAutenticado
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, SEGUNDOS_TOKEN_ACCESO, Sesion
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

ORIGEN = "203.0.113.7"


def entrar(entorno: Entorno) -> tuple[str, str]:
    """Crea la cuenta, inicia sesión y devuelve (token de renovación, id de la cuenta)."""
    cuenta = entorno.crear_cuenta()
    resultado = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), ORIGEN)
    return resultado.tokens.token_renovacion, str(cuenta.id)


def test_renovar_da_tokens_nuevos_y_revoca_el_anterior(entorno: Entorno) -> None:
    token, _ = entrar(entorno)

    nuevos = entorno.renovar_sesion().ejecutar(token)

    assert nuevos.token_renovacion != token
    assert nuevos.expira_en_segundos == SEGUNDOS_TOKEN_ACCESO
    anterior = entorno.sesiones.obtener_por_token_hash(entorno.emisor.hash_de_token_renovacion(token))
    siguiente = entorno.sesiones.obtener_por_token_hash(
        entorno.emisor.hash_de_token_renovacion(nuevos.token_renovacion)
    )
    assert anterior is not None and anterior.revocada_en is not None
    assert siguiente is not None and siguiente.revocada_en is None
    assert siguiente.expira_en == entorno.reloj() + timedelta(days=DIAS_TOKEN_RENOVACION)


def test_el_token_de_acceso_nuevo_sirve_para_la_misma_cuenta(entorno: Entorno) -> None:
    token, cuenta_id = entrar(entorno)

    nuevos = entorno.renovar_sesion().ejecutar(token)

    assert str(entorno.emisor.validar_acceso(nuevos.token_acceso, entorno.reloj())) == cuenta_id


def test_un_token_desconocido_no_autentica(entorno: Entorno) -> None:
    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar("renovacion-inventado")


def test_usar_dos_veces_el_mismo_token_se_toma_por_robo_y_se_cierran_todas_las_sesiones(entorno: Entorno) -> None:
    token, cuenta_id = entrar(entorno)
    legitimo = entorno.renovar_sesion().ejecutar(token)  # quien lo robó, o la persona, ya lo usó

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)  # el segundo uso

    # Cae también la sesión nueva: ya no se sabe quién es quién
    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(legitimo.token_renovacion)
    sesiones = entorno.sesiones.de_cuenta(UUID(cuenta_id))
    assert sesiones and all(s.revocada_en is not None for s in sesiones)


def test_un_token_caducado_no_autentica_y_no_cierra_otras_sesiones(entorno: Entorno) -> None:
    token, _ = entrar(entorno)
    otro = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "10.0.0.2")
    entorno.reloj.avanzar(days=DIAS_TOKEN_RENOVACION)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    # Que una caducara no es señal de robo: las demás no se tocan por esto
    otra = entorno.sesiones.obtener_por_token_hash(
        entorno.emisor.hash_de_token_renovacion(otro.tokens.token_renovacion)
    )
    assert otra is not None and otra.revocada_en is None


def test_una_carrera_que_pierde_la_rotacion_se_trata_como_reuso(entorno: Entorno) -> None:
    class RotacionPerdida(MemoriaSesionRepository):
        def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
            return False  # otra petición ganó la rotación entre la lectura y la escritura

    token, _ = entrar(entorno)
    guardada = entorno.sesiones.obtener_por_token_hash(entorno.emisor.hash_de_token_renovacion(token))
    assert guardada is not None
    perdedor = RotacionPerdida()
    perdedor.guardar(replace(guardada))

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion(sesiones=perdedor).ejecutar(token)

    revocada = perdedor.obtener_por_token_hash(entorno.emisor.hash_de_token_renovacion(token))
    assert revocada is not None and revocada.revocada_en is not None
