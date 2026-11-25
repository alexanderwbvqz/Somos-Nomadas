"""La lógica de scripts/aplicar_migraciones.py que no necesita base de datos: qué falta por aplicar y qué es un error.

Lo que sí habla con una base (psql dentro de Docker) se prueba a mano contra un Postgres desechable; ver el script.
"""

import importlib.util
from pathlib import Path
from types import ModuleType
from typing import Any

import pytest

RUTA = Path(__file__).resolve().parents[2] / "scripts" / "aplicar_migraciones.py"


def cargar() -> ModuleType:
    especificacion = importlib.util.spec_from_file_location("aplicar_migraciones", RUTA)
    assert especificacion is not None and especificacion.loader is not None
    modulo = importlib.util.module_from_spec(especificacion)
    especificacion.loader.exec_module(modulo)
    return modulo


M = cargar()


def migracion(nombre: str, sql: str = "select 1;") -> Any:
    return M.Migracion(nombre=nombre, suma=M.suma_de(sql), sql=sql)


# --- Lectura de la carpeta ---


def test_lee_las_migraciones_en_orden_por_nombre(tmp_path: Path) -> None:
    for nombre in ("0003_c.sql", "0001_a.sql", "0002_b.sql"):
        (tmp_path / nombre).write_text("select 1;", encoding="utf-8")

    assert [m.nombre for m in M.leer_migraciones(tmp_path)] == ["0001_a.sql", "0002_b.sql", "0003_c.sql"]


def test_una_carpeta_sin_migraciones_da_una_lista_vacia(tmp_path: Path) -> None:
    assert M.leer_migraciones(tmp_path) == []


@pytest.mark.parametrize("nombre", ["1_x.sql", "0001_Mayus.sql", "0001-cuentas.sql", "cuentas.sql", "0001_.sql"])
def test_rechaza_nombres_que_no_son_numero_guion_bajo_nombre_en_minusculas(tmp_path: Path, nombre: str) -> None:
    (tmp_path / nombre).write_text("select 1;", encoding="utf-8")

    with pytest.raises(M.ErrorDeMigraciones, match="nombre"):
        M.leer_migraciones(tmp_path)


def test_rechaza_dos_migraciones_con_el_mismo_numero(tmp_path: Path) -> None:
    (tmp_path / "0001_a.sql").write_text("select 1;", encoding="utf-8")
    (tmp_path / "0001_b.sql").write_text("select 2;", encoding="utf-8")

    with pytest.raises(M.ErrorDeMigraciones, match="número"):
        M.leer_migraciones(tmp_path)


def test_ignora_lo_que_no_es_sql(tmp_path: Path) -> None:
    (tmp_path / ".gitkeep").write_text("", encoding="utf-8")
    (tmp_path / "LEEME.md").write_text("hola", encoding="utf-8")
    (tmp_path / "0001_a.sql").write_text("select 1;", encoding="utf-8")

    assert [m.nombre for m in M.leer_migraciones(tmp_path)] == ["0001_a.sql"]


# --- Suma de comprobación ---


def test_la_suma_no_depende_de_los_finales_de_linea() -> None:
    # Git en Windows puede convertir LF a CRLF: eso no debe contar como una migración modificada
    assert M.suma_de("a\nb\n") == M.suma_de("a\r\nb\r\n")


def test_la_suma_cambia_si_cambia_el_contenido() -> None:
    assert M.suma_de("select 1;") != M.suma_de("select 2;")
    assert M.suma_de("select 1;") != M.suma_de("select 1; ")


# --- Qué falta por aplicar ---


def test_sin_nada_aplicado_faltan_todas() -> None:
    locales = [migracion("0001_a.sql"), migracion("0002_b.sql")]

    assert [m.nombre for m in M.pendientes(locales, {})] == ["0001_a.sql", "0002_b.sql"]


def test_faltan_solo_las_posteriores_a_las_aplicadas() -> None:
    locales = [migracion("0001_a.sql"), migracion("0002_b.sql"), migracion("0003_c.sql")]
    aplicadas = {"0001_a.sql": locales[0].suma, "0002_b.sql": locales[1].suma}

    assert [m.nombre for m in M.pendientes(locales, aplicadas)] == ["0003_c.sql"]


def test_con_todo_aplicado_no_falta_nada() -> None:
    locales = [migracion("0001_a.sql")]

    assert M.pendientes(locales, {"0001_a.sql": locales[0].suma}) == []


def test_una_migracion_ya_aplicada_no_puede_haberse_modificado() -> None:
    locales = [migracion("0001_a.sql", "select 1;")]

    with pytest.raises(M.ErrorDeMigraciones, match="modificada"):
        M.pendientes(locales, {"0001_a.sql": M.suma_de("select 999;")})


def test_una_migracion_aplicada_no_puede_haber_desaparecido() -> None:
    locales = [migracion("0002_b.sql")]

    with pytest.raises(M.ErrorDeMigraciones, match="Falta"):
        M.pendientes(locales, {"0001_a.sql": "x", "0002_b.sql": locales[0].suma})


def test_una_migracion_nueva_no_puede_ir_antes_de_una_ya_aplicada() -> None:
    # Alguien añadió la 0002 cuando la 0003 ya estaba en la base: el orden real ya no coincide con el de los archivos
    locales = [migracion("0001_a.sql"), migracion("0002_b.sql"), migracion("0003_c.sql")]
    aplicadas = {"0001_a.sql": locales[0].suma, "0003_c.sql": locales[2].suma}

    with pytest.raises(M.ErrorDeMigraciones, match="orden"):
        M.pendientes(locales, aplicadas)
