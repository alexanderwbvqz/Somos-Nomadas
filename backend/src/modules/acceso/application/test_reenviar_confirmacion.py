from datetime import timedelta

import pytest

from modules.acceso.application.conftest import Entorno
from modules.acceso.domain.confirmacion import MINUTOS_ENLACE_CONFIRMACION, CorreoPendiente
from modules.acceso.domain.cuenta import DatosRegistro
from modules.acceso.domain.errores import DatosInvalidos, EnlaceInvalido, LimiteExcedido
from modules.acceso.domain.intentos import REENVIO_POR_CORREO, REENVIO_POR_ORIGEN

ORIGEN = "203.0.113.7"


def registrar(entorno: Entorno, correo: str = "ana@correo.com") -> CorreoPendiente:
    pendiente = entorno.registrar_cuenta().ejecutar(DatosRegistro(correo, "Clave-segura1", True), "198.51.100.1")
    assert pendiente is not None
    return pendiente


def test_con_la_cuenta_sin_confirmar_devuelve_un_enlace_nuevo_en_el_idioma_pedido(entorno: Entorno) -> None:
    registrar(entorno)

    pendiente = entorno.reenviar_confirmacion().ejecutar("  ANA@correo.com ", ORIGEN, "en")

    assert isinstance(pendiente, CorreoPendiente)
    assert pendiente.destino == "ana@correo.com"
    assert pendiente.idioma == "en"
    assert entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN).correo == "ana@correo.com"


def test_el_enlace_nuevo_queda_atado_al_navegador_que_lo_pide(entorno: Entorno) -> None:
    # Se registró en un navegador y pide otro enlace desde otro: el enlace nuevo abre sesión solo en el segundo
    entorno.registrar_cuenta().ejecutar(
        DatosRegistro("ana@correo.com", "Clave-segura1", True),
        "198.51.100.1",
        navegador="marca-del-portatil-0123456789",
    )

    pendiente = entorno.reenviar_confirmacion().ejecutar(
        "ana@correo.com", ORIGEN, "es", navegador="marca-del-movil-0123456789"
    )

    assert pendiente is not None
    hash_del_token = entorno.emisor.hash_de_token_confirmacion(pendiente.token)
    usado = entorno.confirmaciones.confirmar(hash_del_token, entorno.reloj())
    assert usado is not None
    assert usado.navegador_hash == entorno.emisor.hash_de_marca_navegador("marca-del-movil-0123456789")


def test_sin_marca_el_enlace_nuevo_no_queda_atado_a_ningun_navegador(entorno: Entorno) -> None:
    registrar(entorno)

    pendiente = entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")

    assert pendiente is not None
    usado = entorno.confirmaciones.confirmar(
        entorno.emisor.hash_de_token_confirmacion(pendiente.token), entorno.reloj()
    )
    assert usado is not None and usado.navegador_hash is None


def test_el_enlace_nuevo_dura_15_minutos(entorno: Entorno) -> None:
    registrar(entorno)
    pendiente = entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")
    assert pendiente is not None
    hash_del_token = entorno.emisor.hash_de_token_confirmacion(pendiente.token)
    vence = entorno.reloj() + timedelta(minutes=MINUTOS_ENLACE_CONFIRMACION)

    assert entorno.confirmaciones.confirmar(hash_del_token, vence) is None
    assert entorno.confirmaciones.confirmar(hash_del_token, vence - timedelta(seconds=1)) is not None


def test_el_enlace_anterior_deja_de_valer(entorno: Entorno) -> None:
    primero = registrar(entorno)

    entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(primero.token, ORIGEN)


def test_sin_cuenta_o_con_la_cuenta_ya_confirmada_no_hay_nada_que_enviar_y_no_falla(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    assert entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es") is None
    assert entorno.reenviar_confirmacion().ejecutar("nadie@correo.com", ORIGEN, "es") is None


def test_un_correo_mal_escrito_es_un_error_de_datos(entorno: Entorno) -> None:
    with pytest.raises(DatosInvalidos) as error:
        entorno.reenviar_confirmacion().ejecutar("ana@correo", ORIGEN, "es")

    assert error.value.campos == {"correo": "correo_invalido"}


def test_hasta_3_reenvios_por_hora_para_el_mismo_correo(entorno: Entorno) -> None:
    registrar(entorno)
    for i in range(REENVIO_POR_CORREO.maximo):
        assert entorno.reenviar_confirmacion().ejecutar("ana@correo.com", f"198.51.100.{i}", "es") is not None

    # Aunque llegue desde otro origen: el límite es del correo, para no llenar su buzón
    with pytest.raises(LimiteExcedido) as error:
        entorno.reenviar_confirmacion().ejecutar("ANA@correo.com", "192.0.2.50", "es")

    assert error.value.reintentar_en_segundos == REENVIO_POR_CORREO.ventana_segundos


def test_el_limite_por_correo_cuenta_tambien_los_correos_sin_cuenta(entorno: Entorno) -> None:
    # Si solo contara los que tienen cuenta, el límite delataría quién está registrado
    for _ in range(REENVIO_POR_CORREO.maximo):
        assert entorno.reenviar_confirmacion().ejecutar("nadie@correo.com", ORIGEN, "es") is None

    with pytest.raises(LimiteExcedido):
        entorno.reenviar_confirmacion().ejecutar("nadie@correo.com", ORIGEN, "es")


def test_hasta_10_reenvios_por_hora_desde_el_mismo_origen(entorno: Entorno) -> None:
    for i in range(REENVIO_POR_ORIGEN.maximo):
        entorno.reenviar_confirmacion().ejecutar(f"persona{i}@correo.com", ORIGEN, "es")

    with pytest.raises(LimiteExcedido) as error:
        entorno.reenviar_confirmacion().ejecutar("otra@correo.com", ORIGEN, "es")

    assert error.value.reintentar_en_segundos == REENVIO_POR_ORIGEN.ventana_segundos


def test_el_limite_por_origen_cuenta_tambien_los_correos_mal_escritos(entorno: Entorno) -> None:
    for _ in range(REENVIO_POR_ORIGEN.maximo):
        with pytest.raises(DatosInvalidos):
            entorno.reenviar_confirmacion().ejecutar("mal", ORIGEN, "es")

    with pytest.raises(LimiteExcedido):
        entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")


def test_un_origen_bloqueado_no_gasta_el_cupo_del_correo(entorno: Entorno) -> None:
    registrar(entorno)
    for i in range(REENVIO_POR_ORIGEN.maximo):
        entorno.reenviar_confirmacion().ejecutar(f"persona{i}@correo.com", ORIGEN, "es")
    for _ in range(5):
        with pytest.raises(LimiteExcedido):
            entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")

    # La dueña del correo, desde su equipo, sigue teniendo sus 3 reenvíos
    for _ in range(REENVIO_POR_CORREO.maximo):
        assert entorno.reenviar_confirmacion().ejecutar("ana@correo.com", "198.51.100.77", "es") is not None


def test_los_limites_se_liberan_al_pasar_la_hora(entorno: Entorno) -> None:
    registrar(entorno)
    for _ in range(REENVIO_POR_CORREO.maximo):
        entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es")

    entorno.reloj.avanzar(seconds=REENVIO_POR_CORREO.ventana_segundos)

    assert entorno.reenviar_confirmacion().ejecutar("ana@correo.com", ORIGEN, "es") is not None
