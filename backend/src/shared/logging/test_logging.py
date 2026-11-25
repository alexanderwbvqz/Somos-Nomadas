import logging

import pytest

from shared.logging.logging import configurar_logging


@pytest.fixture(autouse=True)
def restaurar_logging() -> object:
    raiz = logging.getLogger()
    manejadores, nivel = list(raiz.handlers), raiz.level
    yield
    raiz.handlers[:] = manejadores
    raiz.setLevel(nivel)


def test_configura_el_nivel_y_un_unico_manejador_con_formato() -> None:
    configurar_logging("WARNING")

    raiz = logging.getLogger()
    assert raiz.level == logging.WARNING
    propios = [m for m in raiz.handlers if getattr(m, "_nomadas", False)]
    assert len(propios) == 1
    assert propios[0].formatter is not None
    assert "%(levelname)s" in (propios[0].formatter._fmt or "")


def test_llamarlo_dos_veces_no_duplica_los_mensajes() -> None:
    configurar_logging("INFO")
    configurar_logging("INFO")

    assert len([m for m in logging.getLogger().handlers if getattr(m, "_nomadas", False)]) == 1


def test_un_nivel_desconocido_es_un_error_claro() -> None:
    with pytest.raises(ValueError, match="Nivel"):
        configurar_logging("RUIDOSO")


def test_el_formato_no_incluye_la_ruta_de_la_peticion_ni_argumentos_sueltos(caplog: pytest.LogCaptureFixture) -> None:
    configurar_logging("INFO")
    formato = next(m for m in logging.getLogger().handlers if getattr(m, "_nomadas", False)).formatter
    assert formato is not None

    registro = logging.LogRecord("nomadas", logging.INFO, __file__, 1, "Error %s", ("RuntimeError",), None)

    linea = formato.format(registro)
    assert linea.endswith("nomadas Error RuntimeError")


def test_httpx_y_httpcore_no_escriben_las_peticiones_ni_en_modo_debug() -> None:
    # httpx registra en INFO la URL completa de cada petición: la de Supabase llevaría ids y tokens en la ruta
    for nombre in ("httpx", "httpcore"):
        logging.getLogger(nombre).setLevel(logging.NOTSET)

    configurar_logging("DEBUG")

    for nombre in ("httpx", "httpcore"):
        assert logging.getLogger(nombre).getEffectiveLevel() >= logging.WARNING, nombre
