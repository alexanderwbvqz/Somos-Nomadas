import os
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]

# Se llama a la función del paquete porque `python -m importlinter.cli` no ejecuta nada
ORDEN = (
    "import sys; from importlinter.cli import lint_imports; sys.exit(lint_imports(config_filename='pyproject.toml'))"
)


def correr_import_linter() -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-c", ORDEN],
        cwd=RAIZ,
        env={**os.environ, "PYTHONPATH": str(RAIZ / "src"), "PYTHONIOENCODING": "utf-8"},
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def test_las_reglas_de_capas_se_cumplen() -> None:
    resultado = correr_import_linter()
    assert resultado.returncode == 0, resultado.stdout + resultado.stderr
