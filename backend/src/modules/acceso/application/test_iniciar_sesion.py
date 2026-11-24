from datetime import timedelta

import pytest

from modules.acceso.application.conftest import CLAVE, Entorno
from modules.acceso.domain.cuenta import DatosInicioSesion
from modules.acceso.domain.errores import (
    CorreoSinConfirmar,
    CredencialesInvalidas,
    DatosInvalidos,
    LimiteExcedido,
)
from modules.acceso.domain.intentos import SESION_POR_CORREO, SESION_POR_ORIGEN
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, SEGUNDOS_TOKEN_ACCESO

ORIGEN = "203.0.113.7"


def datos(correo: str = "ana@correo.com", clave: str = CLAVE) -> DatosInicioSesion:
    return DatosInicioSesion(correo=correo, clave=clave)


def test_entra_con_correo_y_clave_correctos(entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta()

    resultado = entorno.iniciar_sesion().ejecutar(datos(), ORIGEN)

    assert resultado.correo == "ana@correo.com"
    assert resultado.tokens.expira_en_segundos == SEGUNDOS_TOKEN_ACCESO
    assert entorno.emisor.validar_acceso(resultado.tokens.token_acceso, entorno.reloj()) == cuenta.id


def test_guarda_la_sesion_solo_con_el_hash_del_token_de_renovacion(entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta()

    resultado = entorno.iniciar_sesion().ejecutar(datos(), ORIGEN)

    (sesion,) = entorno.sesiones.de_cuenta(cuenta.id)
    assert sesion.token_hash == entorno.emisor.hash_de_token_renovacion(resultado.tokens.token_renovacion)
    assert sesion.token_hash != resultado.tokens.token_renovacion
    assert sesion.expira_en == entorno.reloj() + timedelta(days=DIAS_TOKEN_RENOVACION)
    assert sesion.revocada_en is None


def test_el_correo_se_normaliza_al_entrar(entorno: Entorno) -> None:
    entorno.crear_cuenta("ana@correo.com")

    resultado = entorno.iniciar_sesion().ejecutar(datos("  ANA@Correo.com "), ORIGEN)

    assert resultado.correo == "ana@correo.com"


def test_clave_incorrecta_y_correo_inexistente_fallan_igual(entorno: Entorno) -> None:
    entorno.crear_cuenta()

    with pytest.raises(CredencialesInvalidas) as clave_mala:
        entorno.iniciar_sesion().ejecutar(datos(clave="Otra-clave9"), ORIGEN)
    with pytest.raises(CredencialesInvalidas) as sin_cuenta:
        entorno.iniciar_sesion().ejecutar(datos("nadie@correo.com"), ORIGEN)

    assert type(clave_mala.value) is type(sin_cuenta.value)
    assert str(clave_mala.value) == str(sin_cuenta.value)


def test_con_correo_inexistente_igual_se_gasta_una_verificacion(entorno: Entorno) -> None:
    # Tarda lo mismo exista o no el correo: no se puede averiguar quién está registrado
    with pytest.raises(CredencialesInvalidas):
        entorno.iniciar_sesion().ejecutar(datos("nadie@correo.com"), ORIGEN)

    assert entorno.hasheador.verificaciones_sin_hash == 1


def test_una_clave_corta_no_es_error_de_datos_sino_de_credenciales(entorno: Entorno) -> None:
    # El inicio de sesión no vuelve a exigir la composición de la clave
    entorno.crear_cuenta()

    with pytest.raises(CredencialesInvalidas):
        entorno.iniciar_sesion().ejecutar(datos(clave="corta"), ORIGEN)


def test_datos_invalidos_informan_los_campos(entorno: Entorno) -> None:
    with pytest.raises(DatosInvalidos) as error:
        entorno.iniciar_sesion().ejecutar(datos("", ""), ORIGEN)

    assert error.value.campos == {"correo": "obligatorio", "clave": "obligatorio"}


def test_con_el_correo_sin_confirmar_no_se_abre_sesion(entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta(confirmada=False)

    with pytest.raises(CorreoSinConfirmar):
        entorno.iniciar_sesion().ejecutar(datos(), ORIGEN)

    assert entorno.sesiones.de_cuenta(cuenta.id) == []


def test_sin_confirmar_con_clave_incorrecta_no_revela_que_la_cuenta_existe(entorno: Entorno) -> None:
    entorno.crear_cuenta(confirmada=False)

    with pytest.raises(CredencialesInvalidas):
        entorno.iniciar_sesion().ejecutar(datos(clave="Otra-clave9"), ORIGEN)


def test_si_no_se_exige_la_confirmacion_se_puede_entrar_sin_confirmar(entorno: Entorno) -> None:
    entorno.crear_cuenta(confirmada=False)

    resultado = entorno.iniciar_sesion(exigir_correo_confirmado=False).ejecutar(datos(), ORIGEN)

    assert resultado.correo == "ana@correo.com"


def test_se_superan_los_intentos_por_correo_aunque_la_clave_ya_sea_la_buena(entorno: Entorno) -> None:
    entorno.crear_cuenta()
    for i in range(SESION_POR_CORREO.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), f"10.0.0.{i}")

    with pytest.raises(LimiteExcedido) as error:
        entorno.iniciar_sesion().ejecutar(datos(), "10.0.1.1")

    assert error.value.reintentar_en_segundos == SESION_POR_CORREO.ventana_segundos


def test_se_superan_los_intentos_por_origen_probando_correos_distintos(entorno: Entorno) -> None:
    for i in range(SESION_POR_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(f"persona{i}@correo.com"), ORIGEN)

    with pytest.raises(LimiteExcedido):
        entorno.iniciar_sesion().ejecutar(datos("otra@correo.com"), ORIGEN)


def test_el_limite_por_correo_se_libera_al_pasar_la_ventana(entorno: Entorno) -> None:
    entorno.crear_cuenta()
    for i in range(SESION_POR_CORREO.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), f"10.0.0.{i}")

    entorno.reloj.avanzar(seconds=SESION_POR_CORREO.ventana_segundos)

    assert entorno.iniciar_sesion().ejecutar(datos(), "10.0.1.1").correo == "ana@correo.com"
