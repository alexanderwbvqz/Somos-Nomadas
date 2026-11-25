"""Las reglas de correo y clave existen dos veces: en Python (backend) y en TypeScript (frontend). Para que no se
desvíen, el backend exporta casos con la respuesta que da él y el frontend comprueba que da lo mismo en cada uno.
Estas pruebas fallan si el archivo de contrato/ se queda desactualizado."""

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "scripts" / "exportar_reglas_de_cuenta.py"
CONTRATO = RAIZ.parent / "contrato" / "reglas-de-cuenta.json"


def correr(*argumentos: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *argumentos], cwd=RAIZ, capture_output=True, text=True, encoding="utf-8"
    )


def test_las_reglas_de_contrato_estan_al_dia() -> None:
    resultado = correr("--comprobar")

    assert resultado.returncode == 0, resultado.stdout + resultado.stderr


def test_comprobar_falla_si_el_archivo_esta_desactualizado_o_no_existe(tmp_path: Path) -> None:
    destino = tmp_path / "reglas.json"
    destino.write_text("{}\n", encoding="utf-8")

    desactualizado = correr("--comprobar", "--destino", str(destino))
    inexistente = correr("--comprobar", "--destino", str(tmp_path / "no-existe.json"))

    assert desactualizado.returncode == 1 and "desactualizado" in desactualizado.stdout + desactualizado.stderr
    assert inexistente.returncode == 1


def test_la_exportacion_es_determinista_y_solo_ascii(tmp_path: Path) -> None:
    uno, otro = tmp_path / "uno.json", tmp_path / "otro.json"
    correr("--destino", str(uno))
    correr("--destino", str(otro))

    assert uno.read_bytes() == otro.read_bytes()
    # Solo ASCII: los caracteres raros van escapados, así ninguna herramienta puede deformarlos al leer o guardar
    assert uno.read_bytes().isascii()


def test_los_casos_cubren_lo_que_importa() -> None:
    reglas = json.loads(CONTRATO.read_text(encoding="utf-8"))

    assert set(reglas) >= {"correos", "claves", "claves_inicio_sesion", "correos_normalizados", "limites"}
    codigos_de_clave = {caso["error"] for caso in reglas["claves"]}
    # Todos los errores posibles de la clave aparecen, y también el caso sin error
    assert codigos_de_clave >= {
        None,
        "clave_corta",
        "clave_larga",
        "clave_sin_minuscula",
        "clave_sin_mayuscula",
        "clave_sin_numero",
        "clave_sin_especial",
    }
    assert {caso["error"] for caso in reglas["correos"]} >= {None, "correo_invalido", "obligatorio"}
    assert {caso["error"] for caso in reglas["claves_inicio_sesion"]} >= {None, "obligatorio", "clave_larga"}
    # Los casos que hacen distinto a Python y a JavaScript están
    valores = [caso["valor"] for caso in reglas["claves"] + reglas["correos"]]
    assert any("\U0001f600" in valor for valor in valores)  # un emoji ocupa 1 en Python y 2 en JavaScript
    assert any("İ" in valor for valor in valores)  # «İ» ocupa 2 al pasar a minúsculas
    assert any(" " in valor for valor in valores)  # espacio duro
    assert len(reglas["claves"]) >= 40 and len(reglas["correos"]) >= 40


def test_los_limites_son_los_del_dominio() -> None:
    from modules.acceso.domain.cuenta import LIMITES_CUENTA

    reglas = json.loads(CONTRATO.read_text(encoding="utf-8"))

    assert reglas["limites"] == {
        "correo": LIMITES_CUENTA.correo,
        "parte_local": LIMITES_CUENTA.parte_local,
        "clave_min": LIMITES_CUENTA.clave_min,
        "clave_max": LIMITES_CUENTA.clave_max,
    }
