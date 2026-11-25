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
from modules.acceso.domain.intentos import SESION_POR_CORREO_TOTAL, SESION_POR_CORREO_Y_ORIGEN, SESION_POR_ORIGEN
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


def test_se_superan_los_intentos_de_un_correo_desde_el_mismo_origen_aunque_la_clave_ya_sea_la_buena(
    entorno: Entorno,
) -> None:
    entorno.crear_cuenta()
    for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), ORIGEN)

    with pytest.raises(LimiteExcedido) as error:
        entorno.iniciar_sesion().ejecutar(datos(), ORIGEN)

    assert error.value.reintentar_en_segundos == SESION_POR_CORREO_Y_ORIGEN.ventana_segundos


def test_quien_agota_los_intentos_con_el_correo_de_otra_persona_solo_se_bloquea_a_si_mismo(entorno: Entorno) -> None:
    # La titular entra desde su propio origen aunque otra persona haya gastado los cinco intentos con su correo
    entorno.crear_cuenta()
    atacante, titular = "203.0.113.66", "198.51.100.7"
    for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), atacante)
    with pytest.raises(LimiteExcedido):
        entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), atacante)

    assert entorno.iniciar_sesion().ejecutar(datos(), titular).correo == "ana@correo.com"


def test_los_intentos_bloqueados_en_la_pareja_no_gastan_el_techo_por_correo(entorno: Entorno) -> None:
    # 10 atacantes insisten con el correo de la titular, cada uno desde su origen, hasta que su límite por origen los
    # corta. De sus 200 intentos solo pasan 5 por atacante; el resto no debe contar para el techo por correo (100).
    # Si contara, 200 intentos agotarían el techo y la titular quedaría fuera desde su propio origen.
    entorno.crear_cuenta()
    for atacante in range(10):
        origen = f"203.0.113.{atacante}"
        for intento in range(SESION_POR_ORIGEN.maximo):
            esperado = CredencialesInvalidas if intento < SESION_POR_CORREO_Y_ORIGEN.maximo else LimiteExcedido
            with pytest.raises(esperado):
                entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), origen)

    assert entorno.iniciar_sesion().ejecutar(datos(), "198.51.100.7").correo == "ana@correo.com"


def test_repartir_intentos_entre_muchos_origenes_agota_el_techo_por_correo(entorno: Entorno) -> None:
    # Sin este techo, quien tuviera muchas IPs podría probar claves sin límite contra una sola cuenta
    entorno.crear_cuenta()
    origenes = SESION_POR_CORREO_TOTAL.maximo // SESION_POR_CORREO_Y_ORIGEN.maximo
    for origen in range(origenes):
        for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
            with pytest.raises(CredencialesInvalidas):
                entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), f"10.1.{origen}.1")

    with pytest.raises(LimiteExcedido) as error:
        entorno.iniciar_sesion().ejecutar(datos(), "10.9.9.9")

    assert error.value.reintentar_en_segundos == SESION_POR_CORREO_TOTAL.ventana_segundos


def test_el_bloqueo_por_correo_y_origen_se_cuenta_por_separado_para_cada_correo(entorno: Entorno) -> None:
    entorno.crear_cuenta("ana@correo.com")
    entorno.crear_cuenta("luis@correo.com")
    for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos("ana@correo.com", "Mala-clave9"), ORIGEN)

    # Desde el mismo origen, otro correo todavía tiene sus intentos
    assert entorno.iniciar_sesion().ejecutar(datos("luis@correo.com"), ORIGEN).correo == "luis@correo.com"


@pytest.mark.parametrize("separador", ["", "|", "-", "_", ":", "/", ",", "#", "+", "."])
def test_un_correo_que_imita_una_pareja_de_correo_y_origen_no_gasta_los_intentos_de_esa_pareja(
    entorno: Entorno, separador: str
) -> None:
    # «ana@correo.com<sep>x.com» es un correo válido con cualquiera de estos separadores. Si la clave de la pareja
    # (ana, origen x.com) se formara con ese separador, sería idéntica a la del techo de ese otro correo y quien lo
    # usara podría dejar fuera a la titular en el origen x.com. El único separador seguro es el espacio, que un correo
    # válido no puede llevar.
    entorno.crear_cuenta()
    imitacion = f"ana@correo.com{separador}x.com"
    for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(imitacion, "Mala-clave9"), "9.9.9.9")

    assert entorno.iniciar_sesion().ejecutar(datos(), "x.com").correo == "ana@correo.com"


def test_se_superan_los_intentos_por_origen_probando_correos_distintos(entorno: Entorno) -> None:
    for i in range(SESION_POR_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(f"persona{i}@correo.com"), ORIGEN)

    with pytest.raises(LimiteExcedido):
        entorno.iniciar_sesion().ejecutar(datos("otra@correo.com"), ORIGEN)


def test_el_limite_por_correo_y_origen_se_libera_al_pasar_la_ventana(entorno: Entorno) -> None:
    entorno.crear_cuenta()
    for _ in range(SESION_POR_CORREO_Y_ORIGEN.maximo):
        with pytest.raises(CredencialesInvalidas):
            entorno.iniciar_sesion().ejecutar(datos(clave="Mala-clave9"), ORIGEN)

    entorno.reloj.avanzar(seconds=SESION_POR_CORREO_Y_ORIGEN.ventana_segundos)

    assert entorno.iniciar_sesion().ejecutar(datos(), ORIGEN).correo == "ana@correo.com"
