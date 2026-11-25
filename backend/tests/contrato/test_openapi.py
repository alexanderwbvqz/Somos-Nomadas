"""El openapi.json de contrato/ lo exporta un script desde FastAPI; no se escribe a mano. Estas pruebas fallan si el
archivo se queda desactualizado respecto de la API."""

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "scripts" / "exportar_openapi.py"
CONTRATO = RAIZ.parent / "contrato" / "openapi.json"


def correr(*argumentos: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *argumentos],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def test_el_openapi_de_contrato_esta_al_dia() -> None:
    resultado = correr("--comprobar")

    assert resultado.returncode == 0, resultado.stdout + resultado.stderr


def test_exportar_y_comprobar_contra_el_mismo_archivo_coincide(tmp_path: Path) -> None:
    destino = tmp_path / "openapi.json"

    assert correr("--destino", str(destino)).returncode == 0
    assert correr("--comprobar", "--destino", str(destino)).returncode == 0


def test_comprobar_falla_si_el_archivo_esta_desactualizado_o_no_existe(tmp_path: Path) -> None:
    destino = tmp_path / "openapi.json"
    destino.write_text('{"openapi": "3.1.0", "paths": {}}\n', encoding="utf-8")

    desactualizado = correr("--comprobar", "--destino", str(destino))
    inexistente = correr("--comprobar", "--destino", str(tmp_path / "no-existe.json"))

    assert desactualizado.returncode == 1
    assert "desactualizado" in desactualizado.stdout + desactualizado.stderr
    assert inexistente.returncode == 1


def test_la_exportacion_es_determinista_y_describe_las_rutas_de_acceso(tmp_path: Path) -> None:
    uno, otro = tmp_path / "uno.json", tmp_path / "otro.json"
    correr("--destino", str(uno))
    correr("--destino", str(otro))

    assert uno.read_bytes() == otro.read_bytes()
    descripcion = json.loads(uno.read_text(encoding="utf-8"))
    assert set(descripcion["paths"]) == {
        "/acceso/registro",
        "/acceso/sesion",
        "/acceso/renovar",
        "/acceso/cierre",
        "/acceso/yo",
        "/acceso/confirmacion",
        "/acceso/confirmacion/reenvio",
    }
    assert descripcion["info"]["title"] == "Somos Nómadas API"


def test_la_exportacion_no_depende_de_las_variables_de_entorno_del_equipo(tmp_path: Path) -> None:
    import os

    destino = tmp_path / "openapi.json"
    entorno = {**os.environ, "ENTORNO": "produccion", "JWT_SECRETO": "corto", "ALMACEN_DE_DATOS": "supabase"}

    resultado = subprocess.run(
        [sys.executable, str(SCRIPT), "--destino", str(destino)],
        cwd=RAIZ,
        env=entorno,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )

    assert resultado.returncode == 0, resultado.stdout + resultado.stderr
    assert destino.exists()
