from datetime import timedelta

import pytest

from modules.acceso.application.conftest import CLAVE, POLITICA, Entorno
from modules.acceso.domain.confirmacion import HORAS_ENLACE_CONFIRMACION, CorreoPendiente
from modules.acceso.domain.cuenta import DatosRegistro
from modules.acceso.domain.errores import DatosInvalidos, LimiteExcedido
from modules.acceso.domain.intentos import REGISTRO_POR_ORIGEN

ORIGEN = "203.0.113.7"


def datos(correo: str = "ana@correo.com", **cambios: object) -> DatosRegistro:
    base = {"correo": correo, "clave": CLAVE, "acepta_politica": True, "sitio_secundario": ""}
    return DatosRegistro(**{**base, **cambios})  # type: ignore[arg-type]


def test_crea_la_cuenta_normalizada_y_sin_confirmar(entorno: Entorno) -> None:
    entorno.registrar_cuenta().ejecutar(datos("  Ana@Correo.COM "), ORIGEN)

    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None
    assert not cuenta.correo_confirmado
    assert cuenta.clave_hash != CLAVE  # nunca se guarda la clave tal cual
    assert cuenta.clave_hash == entorno.hasheador.hashear(CLAVE)
    assert cuenta.politica_aceptada_en == entorno.reloj()
    assert cuenta.politica_version == POLITICA


def test_un_correo_ya_registrado_no_falla_ni_cambia_la_cuenta(entorno: Entorno) -> None:
    original = entorno.crear_cuenta("ana@correo.com", "Otra-clave1")

    entorno.registrar_cuenta().ejecutar(datos("ana@correo.com"), ORIGEN)  # no lanza nada

    assert entorno.cuentas.cantidad() == 1
    assert entorno.cuentas.obtener_por_correo("ana@correo.com") == original


def test_con_correo_repetido_tambien_se_calcula_el_hash(entorno: Entorno) -> None:
    # Tarda lo mismo exista o no el correo: no se puede averiguar quién está registrado
    entorno.crear_cuenta("ana@correo.com")
    hasheos_antes = entorno.hasheador.hasheos

    entorno.registrar_cuenta().ejecutar(datos("ana@correo.com"), ORIGEN)

    assert entorno.hasheador.hasheos == hasheos_antes + 1


def test_el_campo_trampa_relleno_responde_bien_sin_crear_nada(entorno: Entorno) -> None:
    entorno.registrar_cuenta().ejecutar(datos(sitio_secundario="http://spam.com"), ORIGEN)

    assert entorno.cuentas.cantidad() == 0


def test_datos_invalidos_informan_los_campos_y_no_crean_nada(entorno: Entorno) -> None:
    with pytest.raises(DatosInvalidos) as error:
        entorno.registrar_cuenta().ejecutar(datos("nada", clave="corta", acepta_politica=False), ORIGEN)

    assert error.value.campos == {
        "correo": "correo_invalido",
        "clave": "clave_corta",
        "acepta_politica": "politica_requerida",
    }
    assert entorno.cuentas.cantidad() == 0


def test_se_superan_los_intentos_por_origen_y_dice_cuanto_esperar(entorno: Entorno) -> None:
    for i in range(REGISTRO_POR_ORIGEN.maximo):
        entorno.registrar_cuenta().ejecutar(datos(f"persona{i}@correo.com"), ORIGEN)

    with pytest.raises(LimiteExcedido) as error:
        entorno.registrar_cuenta().ejecutar(datos("otra@correo.com"), ORIGEN)

    assert error.value.reintentar_en_segundos == REGISTRO_POR_ORIGEN.ventana_segundos
    assert entorno.cuentas.obtener_por_correo("otra@correo.com") is None


def test_los_intentos_con_datos_invalidos_tambien_cuentan(entorno: Entorno) -> None:
    for _ in range(REGISTRO_POR_ORIGEN.maximo):
        with pytest.raises(DatosInvalidos):
            entorno.registrar_cuenta().ejecutar(datos("nada"), ORIGEN)

    with pytest.raises(LimiteExcedido):
        entorno.registrar_cuenta().ejecutar(datos("nada"), ORIGEN)


def test_el_limite_es_por_origen_y_se_libera_al_pasar_la_ventana(entorno: Entorno) -> None:
    for i in range(REGISTRO_POR_ORIGEN.maximo):
        entorno.registrar_cuenta().ejecutar(datos(f"persona{i}@correo.com"), ORIGEN)

    entorno.registrar_cuenta().ejecutar(datos("de-otro-origen@correo.com"), "198.51.100.9")
    entorno.reloj.avanzar(seconds=REGISTRO_POR_ORIGEN.ventana_segundos)
    entorno.registrar_cuenta().ejecutar(datos("pasada-la-ventana@correo.com"), ORIGEN)

    assert entorno.cuentas.cantidad() == REGISTRO_POR_ORIGEN.maximo + 2


# --- El enlace de confirmación ---


def test_una_cuenta_nueva_devuelve_el_correo_a_enviar_con_el_enlace_y_el_idioma(entorno: Entorno) -> None:
    pendiente = entorno.registrar_cuenta().ejecutar(datos("  Ana@Correo.COM "), ORIGEN, "pt")

    assert isinstance(pendiente, CorreoPendiente)
    assert pendiente.destino == "ana@correo.com"
    assert pendiente.idioma == "pt"
    # El token del correo confirma la cuenta: lo guardado es su hash, no el token
    hash_del_token = entorno.emisor.hash_de_token_confirmacion(pendiente.token)
    assert hash_del_token != pendiente.token
    assert entorno.confirmaciones.confirmar(hash_del_token, entorno.reloj()) == "ana@correo.com"


def test_sin_idioma_el_correo_va_en_espanol(entorno: Entorno) -> None:
    pendiente = entorno.registrar_cuenta().ejecutar(datos(), ORIGEN)

    assert pendiente is not None and pendiente.idioma == "es"


def test_el_enlace_dura_24_horas(entorno: Entorno) -> None:
    pendiente = entorno.registrar_cuenta().ejecutar(datos(), ORIGEN)
    assert pendiente is not None
    hash_del_token = entorno.emisor.hash_de_token_confirmacion(pendiente.token)
    vence = entorno.reloj() + timedelta(hours=HORAS_ENLACE_CONFIRMACION)

    assert entorno.confirmaciones.confirmar(hash_del_token, vence) is None
    assert entorno.confirmaciones.confirmar(hash_del_token, vence - timedelta(seconds=1)) == "ana@correo.com"


def test_un_correo_ya_registrado_no_devuelve_nada_que_enviar_ni_crea_otro_enlace(entorno: Entorno) -> None:
    original = entorno.crear_cuenta("ana@correo.com", confirmada=False)

    pendiente = entorno.registrar_cuenta().ejecutar(datos("ana@correo.com"), ORIGEN)

    assert pendiente is None
    assert entorno.confirmaciones.vigentes(original.id) == 0


def test_el_campo_trampa_relleno_no_devuelve_nada_que_enviar(entorno: Entorno) -> None:
    assert entorno.registrar_cuenta().ejecutar(datos(sitio_secundario="http://spam.com"), ORIGEN) is None


def test_cada_registro_tiene_su_propio_token(entorno: Entorno) -> None:
    una = entorno.registrar_cuenta().ejecutar(datos("una@correo.com"), ORIGEN)
    otra = entorno.registrar_cuenta().ejecutar(datos("otra@correo.com"), ORIGEN)

    assert una is not None and otra is not None
    assert una.token != otra.token
