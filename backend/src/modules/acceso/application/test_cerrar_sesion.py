import pytest

from modules.acceso.application.conftest import CLAVE, Entorno
from modules.acceso.domain.cuenta import DatosInicioSesion
from modules.acceso.domain.errores import NoAutenticado


def entrar(entorno: Entorno) -> str:
    entorno.crear_cuenta()
    resultado = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "203.0.113.7")
    return resultado.tokens.token_renovacion


def test_cerrar_sesion_revoca_la_sesion_y_ya_no_se_puede_renovar(entorno: Entorno) -> None:
    token = entrar(entorno)

    entorno.cerrar_sesion().ejecutar(token)

    with pytest.raises(NoAutenticado):
        entorno.renovar_sesion().ejecutar(token)


def test_cerrar_sesion_con_un_token_desconocido_no_falla(entorno: Entorno) -> None:
    entorno.cerrar_sesion().ejecutar("renovacion-inventado")  # no lanza nada


def test_cerrar_sesion_dos_veces_no_falla(entorno: Entorno) -> None:
    token = entrar(entorno)

    entorno.cerrar_sesion().ejecutar(token)
    entorno.cerrar_sesion().ejecutar(token)  # no lanza nada


def test_cerrar_una_sesion_no_toca_las_otras_de_la_misma_cuenta(entorno: Entorno) -> None:
    token = entrar(entorno)
    otra = entorno.iniciar_sesion().ejecutar(DatosInicioSesion("ana@correo.com", CLAVE), "10.0.0.2")

    entorno.cerrar_sesion().ejecutar(token)

    assert entorno.renovar_sesion().ejecutar(otra.tokens.token_renovacion).token_renovacion


def test_la_fecha_de_cierre_es_la_del_reloj_de_la_aplicacion(entorno: Entorno) -> None:
    token = entrar(entorno)
    entorno.reloj.avanzar(minutes=3)

    entorno.cerrar_sesion().ejecutar(token)

    sesion = entorno.sesiones.obtener_por_token_hash(entorno.emisor.hash_de_token_renovacion(token))
    assert sesion is not None
    assert sesion.revocada_en == entorno.reloj() and sesion.motivo_revocacion == "cerrada"
