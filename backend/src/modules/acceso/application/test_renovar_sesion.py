from datetime import timedelta
from uuid import UUID

import pytest

from modules.acceso.application.conftest import CLAVE, Entorno
from modules.acceso.domain.cuenta import DatosInicioSesion
from modules.acceso.domain.errores import NoAutenticado
from modules.acceso.domain.sesion import (
    DIAS_TOKEN_RENOVACION,
    SEGUNDOS_TOKEN_ACCESO,
    TOLERANCIA_REUSO_SEGUNDOS,
    ParDeTokens,
    Sesion,
)
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

CORREO = "ana@correo.com"


def iniciar(entorno: Entorno, origen: str) -> ParDeTokens:
    """Inicia sesión en un «dispositivo» (el origen distingue los intentos de cada uno)."""
    return entorno.iniciar_sesion().ejecutar(DatosInicioSesion(CORREO, CLAVE), origen).tokens


def sesion_de(entorno: Entorno, token: str) -> Sesion:
    encontrada = entorno.sesiones.obtener_por_token_hash(entorno.emisor.hash_de_token_renovacion(token))
    assert encontrada is not None
    return encontrada


def activas(entorno: Entorno, cuenta_id: UUID) -> int:
    return sum(1 for s in entorno.sesiones.de_cuenta(cuenta_id) if s.revocada_en is None)


@pytest.fixture
def cuenta_id(entorno: Entorno) -> UUID:
    return entorno.crear_cuenta(CORREO).id


# --- Renovar con normalidad ---


def test_renovar_da_tokens_nuevos_y_revoca_el_anterior_como_rotado(entorno: Entorno, cuenta_id: UUID) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion

    nuevos = entorno.renovar_sesion().ejecutar(token)

    assert nuevos.token_renovacion != token
    assert nuevos.expira_en_segundos == SEGUNDOS_TOKEN_ACCESO
    anterior, siguiente = sesion_de(entorno, token), sesion_de(entorno, nuevos.token_renovacion)
    assert anterior.revocada_en == entorno.reloj() and anterior.motivo_revocacion == "rotada"
    assert siguiente.revocada_en is None and siguiente.motivo_revocacion is None
    assert siguiente.expira_en == entorno.reloj() + timedelta(days=DIAS_TOKEN_RENOVACION)


def test_el_token_de_acceso_nuevo_sirve_para_la_misma_cuenta(entorno: Entorno, cuenta_id: UUID) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion

    nuevos = entorno.renovar_sesion().ejecutar(token)

    assert entorno.emisor.validar_acceso(nuevos.token_acceso, entorno.reloj()) == cuenta_id


def test_un_token_desconocido_no_autentica(entorno: Entorno, cuenta_id: UUID) -> None:
    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar("renovacion-inventado")


def test_un_token_caducado_no_autentica_y_no_cierra_otras_sesiones(entorno: Entorno, cuenta_id: UUID) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion
    otro = iniciar(entorno, "10.0.0.2").token_renovacion
    entorno.reloj.avanzar(days=DIAS_TOKEN_RENOVACION)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    # Que una caducara no es señal de robo: las demás no se tocan por esto
    assert sesion_de(entorno, otro).revocada_en is None


# --- Reúso de un token ROTADO ---


def test_reusar_un_token_rotado_dentro_de_la_tolerancia_es_una_carrera_y_no_cierra_nada(
    entorno: Entorno, cuenta_id: UUID
) -> None:
    # Dos peticiones casi a la vez con el mismo token (dos de Next): la segunda llega con el token ya rotado
    token = iniciar(entorno, "10.0.0.1").token_renovacion
    otro_dispositivo = iniciar(entorno, "10.0.0.2").token_renovacion
    ganadora = entorno.renovar_sesion().ejecutar(token)
    entorno.reloj.avanzar(seconds=TOLERANCIA_REUSO_SEGUNDOS)  # justo en el límite: todavía vale

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    # La sesión que acaba de nacer y la del otro dispositivo siguen vivas
    assert sesion_de(entorno, ganadora.token_renovacion).revocada_en is None
    assert sesion_de(entorno, otro_dispositivo).revocada_en is None
    assert activas(entorno, cuenta_id) == 2


def test_reusar_un_token_rotado_pasada_la_tolerancia_se_toma_por_robo_y_cierra_todas_las_sesiones(
    entorno: Entorno, cuenta_id: UUID
) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion
    otro_dispositivo = iniciar(entorno, "10.0.0.2").token_renovacion
    ganadora = entorno.renovar_sesion().ejecutar(token)
    entorno.reloj.avanzar(seconds=TOLERANCIA_REUSO_SEGUNDOS + 1)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    assert activas(entorno, cuenta_id) == 0
    assert sesion_de(entorno, ganadora.token_renovacion).motivo_revocacion == "robo"
    assert sesion_de(entorno, otro_dispositivo).motivo_revocacion == "robo"
    # La rotada conserva su motivo: el robo solo cierra lo que seguía abierto
    assert sesion_de(entorno, token).motivo_revocacion == "rotada"


def test_tras_el_robo_el_token_nuevo_ya_no_renueva(entorno: Entorno, cuenta_id: UUID) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion
    ganadora = entorno.renovar_sesion().ejecutar(token)
    entorno.reloj.avanzar(seconds=TOLERANCIA_REUSO_SEGUNDOS + 1)
    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(ganadora.token_renovacion)


def test_una_rotacion_que_se_pierde_en_una_carrera_solo_rechaza_y_no_cierra_nada(
    entorno: Entorno, cuenta_id: UUID
) -> None:
    class RotacionPerdida(MemoriaSesionRepository):
        def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
            return False  # otra petición ganó la rotación entre la lectura y la escritura

    token = iniciar(entorno, "10.0.0.1").token_renovacion
    otro_dispositivo = iniciar(entorno, "10.0.0.2").token_renovacion
    perdedor = RotacionPerdida(ahora=entorno.reloj)
    for s in entorno.sesiones.de_cuenta(cuenta_id):
        perdedor.guardar(s)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion(sesiones=perdedor).ejecutar(token)

    assert all(s.revocada_en is None for s in perdedor.de_cuenta(cuenta_id))
    assert sesion_de(entorno, otro_dispositivo).revocada_en is None


# --- Un token CERRADO por la persona no es un robo ---


def test_un_token_cerrado_se_rechaza_pero_no_cierra_las_otras_sesiones(entorno: Entorno, cuenta_id: UUID) -> None:
    # Cierro sesión en el móvil; una pestaña vieja reenvía ese token. El portátil no debe desconectarse
    movil = iniciar(entorno, "10.0.0.1").token_renovacion
    portatil = iniciar(entorno, "10.0.0.2").token_renovacion
    entorno.cerrar_sesion().ejecutar(movil)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(movil)

    assert sesion_de(entorno, portatil).revocada_en is None
    assert sesion_de(entorno, movil).motivo_revocacion == "cerrada"


def test_un_token_cerrado_nunca_se_toma_por_robo_aunque_pase_mucho_tiempo(entorno: Entorno, cuenta_id: UUID) -> None:
    movil = iniciar(entorno, "10.0.0.1").token_renovacion
    portatil = iniciar(entorno, "10.0.0.2").token_renovacion
    entorno.cerrar_sesion().ejecutar(movil)
    entorno.reloj.avanzar(days=1)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(movil)

    assert sesion_de(entorno, portatil).revocada_en is None


def test_un_token_ya_cerrado_por_robo_solo_se_rechaza(entorno: Entorno, cuenta_id: UUID) -> None:
    token = iniciar(entorno, "10.0.0.1").token_renovacion
    entorno.sesiones.revocar_todas_de_cuenta(cuenta_id, "robo")
    nueva = iniciar(entorno, "10.0.0.2").token_renovacion  # la persona vuelve a entrar con su clave

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)

    assert sesion_de(entorno, nueva).revocada_en is None
