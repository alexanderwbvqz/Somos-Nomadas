import pytest

from modules.acceso.application.conftest import CLAVE, Entorno
from modules.acceso.domain.cuenta import DatosInicioSesion
from modules.acceso.domain.errores import NoAutenticado
from modules.acceso.domain.sesion import SEGUNDOS_TOKEN_ACCESO


def test_con_un_token_valido_devuelve_la_cuenta(entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta()
    token = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "203.0.113.7").tokens

    assert entorno.obtener_cuenta_actual().ejecutar(token.token_acceso) == cuenta


@pytest.mark.parametrize("token", ["", "basura", "acceso|no-es-un-uuid|tampoco"])
def test_un_token_que_no_es_valido_no_autentica(entorno: Entorno, token: str) -> None:
    with pytest.raises(NoAutenticado):
        entorno.obtener_cuenta_actual().ejecutar(token)


def test_un_token_caducado_no_autentica(entorno: Entorno) -> None:
    entorno.crear_cuenta()
    token = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "203.0.113.7").tokens

    entorno.reloj.avanzar(seconds=SEGUNDOS_TOKEN_ACCESO)

    with pytest.raises(NoAutenticado):
        entorno.obtener_cuenta_actual().ejecutar(token.token_acceso)


def test_un_token_de_una_cuenta_que_ya_no_existe_no_autentica(entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta()
    token = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "203.0.113.7").tokens
    entorno.cuentas.borrar(cuenta.id)

    with pytest.raises(NoAutenticado):
        entorno.obtener_cuenta_actual().ejecutar(token.token_acceso)
