from datetime import timedelta

import pytest

from modules.acceso.application.conftest import Entorno
from modules.acceso.domain.confirmacion import MINUTOS_ENLACE_CONFIRMACION, CorreoPendiente
from modules.acceso.domain.cuenta import DatosRegistro
from modules.acceso.domain.errores import EnlaceInvalido, LimiteExcedido
from modules.acceso.domain.intentos import CONFIRMACION_POR_ORIGEN
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, SEGUNDOS_TOKEN_ACCESO

ORIGEN = "203.0.113.7"
# La marca que la web guarda en el navegador al registrarse (aleatoria, con forma de token)
MARCA = "marca-del-navegador-0123456789"
OTRA_MARCA = "marca-de-otro-navegador-0123456789"


def registrar(entorno: Entorno, correo: str = "ana@correo.com", navegador: str | None = MARCA) -> CorreoPendiente:
    pendiente = entorno.registrar_cuenta().ejecutar(
        DatosRegistro(correo, "Clave-segura1", True), "198.51.100.1", navegador=navegador
    )
    assert pendiente is not None
    return pendiente


def test_el_token_del_correo_confirma_la_cuenta_y_devuelve_su_correo(entorno: Entorno) -> None:
    pendiente = registrar(entorno)

    confirmado = entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    assert confirmado.correo == "ana@correo.com"
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and cuenta.correo_confirmado


# --- El mismo navegador entra; otro solo confirma ---


def test_en_el_mismo_navegador_del_registro_confirma_y_abre_la_sesion(entorno: Entorno) -> None:
    pendiente = registrar(entorno, navegador=MARCA)
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None

    confirmado = entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=MARCA)

    assert confirmado.correo == "ana@correo.com"
    assert confirmado.tokens is not None
    assert confirmado.tokens.expira_en_segundos == SEGUNDOS_TOKEN_ACCESO
    assert entorno.emisor.validar_acceso(confirmado.tokens.token_acceso, entorno.reloj()) == cuenta.id
    # La misma sesión que al iniciar sesión: guardada solo con el hash de la renovación, de 30 días
    (sesion,) = entorno.sesiones.de_cuenta(cuenta.id)
    assert sesion.token_hash == entorno.emisor.hash_de_token_renovacion(confirmado.tokens.token_renovacion)
    assert sesion.expira_en == entorno.reloj() + timedelta(days=DIAS_TOKEN_RENOVACION)


@pytest.mark.parametrize("navegador", [OTRA_MARCA, None, "", "no tiene forma"])
def test_en_otro_navegador_o_sin_marca_solo_confirma_sin_abrir_sesion(entorno: Entorno, navegador: str | None) -> None:
    pendiente = registrar(entorno, navegador=MARCA)
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None

    confirmado = entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=navegador)

    assert confirmado.correo == "ana@correo.com"
    assert confirmado.tokens is None
    assert entorno.sesiones.de_cuenta(cuenta.id) == []
    despues = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert despues is not None and despues.correo_confirmado


@pytest.mark.parametrize("marca_rara", ["", "corta", "con espacios aaaaaaaaaaaaaaaaaaa"])
def test_si_al_registrarse_no_hubo_marca_valida_el_enlace_nunca_abre_sesion(entorno: Entorno, marca_rara: str) -> None:
    # Ni siquiera presentando la misma marca rara: lo que no tiene forma de marca no se guarda
    pendiente = registrar(entorno, navegador=marca_rara or None)

    confirmado = entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=marca_rara)

    assert confirmado.tokens is None


def test_un_enlace_que_no_vale_no_abre_sesion_aunque_la_marca_coincida(entorno: Entorno) -> None:
    pendiente = registrar(entorno, navegador=MARCA)
    entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=OTRA_MARCA)

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=MARCA)

    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and entorno.sesiones.de_cuenta(cuenta.id) == []


# --- Lo que ya valía ---


def test_el_mismo_token_no_sirve_dos_veces(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)


def test_un_token_caducado_no_confirma(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.reloj.avanzar(minutes=MINUTOS_ENLACE_CONFIRMACION)

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN, navegador=MARCA)

    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and not cuenta.correo_confirmado
    assert entorno.sesiones.de_cuenta(cuenta.id) == []


def test_un_enlace_vale_hasta_un_segundo_antes_de_caducar(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.reloj.avanzar(minutes=MINUTOS_ENLACE_CONFIRMACION, seconds=-1)

    assert entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN).correo == "ana@correo.com"


@pytest.mark.parametrize(
    "token",
    ["", "corto", "a" * 201, "con espacios aaaaaaaaaaaaaaa", "token-que-no-existe-0123456789"],
)
def test_un_token_desconocido_o_con_forma_rara_da_el_mismo_error(entorno: Entorno, token: str) -> None:
    registrar(entorno)

    with pytest.raises(EnlaceInvalido) as error:
        entorno.confirmar_correo().ejecutar(token, ORIGEN, navegador=MARCA)

    # Siempre el mismo mensaje: no dice por qué, ni repite el token
    assert str(error.value) == "Enlace inválido"


def test_un_token_con_forma_rara_no_se_busca_en_la_base(entorno: Entorno) -> None:
    class Espia:
        consultas = 0

        def confirmar(self, token_hash: str, ahora: object) -> None:
            Espia.consultas += 1

    caso = entorno.confirmar_correo()
    caso._confirmaciones = Espia()  # type: ignore[assignment]

    with pytest.raises(EnlaceInvalido):
        caso.ejecutar("no tiene forma", ORIGEN)

    assert Espia.consultas == 0


def test_se_limitan_los_intentos_por_origen_aunque_los_tokens_sean_malos(entorno: Entorno) -> None:
    for _ in range(CONFIRMACION_POR_ORIGEN.maximo):
        with pytest.raises(EnlaceInvalido):
            entorno.confirmar_correo().ejecutar("token-que-no-existe-0123456789", ORIGEN)

    pendiente = registrar(entorno)
    with pytest.raises(LimiteExcedido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    # Desde otro origen sí se puede, y al pasar la ventana también
    assert entorno.confirmar_correo().ejecutar(pendiente.token, "198.51.100.9").correo == "ana@correo.com"


def test_el_limite_se_libera_al_pasar_la_ventana(entorno: Entorno) -> None:
    for _ in range(CONFIRMACION_POR_ORIGEN.maximo):
        with pytest.raises(EnlaceInvalido):
            entorno.confirmar_correo().ejecutar("token-que-no-existe-0123456789", ORIGEN)

    entorno.reloj.avanzar(seconds=CONFIRMACION_POR_ORIGEN.ventana_segundos)
    # El enlace se pide después: dura lo mismo que la ventana y habría caducado
    pendiente = registrar(entorno)

    assert entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN).correo == "ana@correo.com"
