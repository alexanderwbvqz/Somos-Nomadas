import pytest

from modules.acceso.application.conftest import Entorno
from modules.acceso.domain.confirmacion import HORAS_ENLACE_CONFIRMACION, CorreoPendiente
from modules.acceso.domain.cuenta import DatosRegistro
from modules.acceso.domain.errores import EnlaceInvalido, LimiteExcedido
from modules.acceso.domain.intentos import CONFIRMACION_POR_ORIGEN

ORIGEN = "203.0.113.7"


def registrar(entorno: Entorno, correo: str = "ana@correo.com") -> CorreoPendiente:
    pendiente = entorno.registrar_cuenta().ejecutar(DatosRegistro(correo, "Clave-segura1", True), "198.51.100.1")
    assert pendiente is not None
    return pendiente


def test_el_token_del_correo_confirma_la_cuenta_y_devuelve_su_correo(entorno: Entorno) -> None:
    pendiente = registrar(entorno)

    correo = entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    assert correo == "ana@correo.com"
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and cuenta.correo_confirmado


def test_confirmar_no_abre_ninguna_sesion(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None

    entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    assert entorno.sesiones.de_cuenta(cuenta.id) == []


def test_el_mismo_token_no_sirve_dos_veces(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)


def test_un_token_caducado_no_confirma(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.reloj.avanzar(hours=HORAS_ENLACE_CONFIRMACION)

    with pytest.raises(EnlaceInvalido):
        entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN)

    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and not cuenta.correo_confirmado


@pytest.mark.parametrize(
    "token",
    ["", "corto", "a" * 201, "con espacios aaaaaaaaaaaaaaa", "token-que-no-existe-0123456789"],
)
def test_un_token_desconocido_o_con_forma_rara_da_el_mismo_error(entorno: Entorno, token: str) -> None:
    registrar(entorno)

    with pytest.raises(EnlaceInvalido) as error:
        entorno.confirmar_correo().ejecutar(token, ORIGEN)

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
    assert entorno.confirmar_correo().ejecutar(pendiente.token, "198.51.100.9") == "ana@correo.com"


def test_el_limite_se_libera_al_pasar_la_ventana(entorno: Entorno) -> None:
    for _ in range(CONFIRMACION_POR_ORIGEN.maximo):
        with pytest.raises(EnlaceInvalido):
            entorno.confirmar_correo().ejecutar("token-que-no-existe-0123456789", ORIGEN)
    pendiente = registrar(entorno)

    entorno.reloj.avanzar(seconds=CONFIRMACION_POR_ORIGEN.ventana_segundos)

    assert entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN) == "ana@correo.com"


def test_un_enlace_vale_hasta_un_segundo_antes_de_caducar(entorno: Entorno) -> None:
    pendiente = registrar(entorno)
    entorno.reloj.avanzar(hours=HORAS_ENLACE_CONFIRMACION, seconds=-1)

    assert entorno.confirmar_correo().ejecutar(pendiente.token, ORIGEN) == "ana@correo.com"
