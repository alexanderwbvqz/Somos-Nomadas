"""Exporta la descripción de la API (OpenAPI) a contrato/openapi.json.

El archivo no se escribe a mano: sale de FastAPI. Si cambia la API, se vuelve a exportar:

    uv run python scripts/exportar_openapi.py              # escribe contrato/openapi.json
    uv run python scripts/exportar_openapi.py --comprobar  # no escribe; falla (1) si el archivo está desactualizado

No necesita secretos ni base de datos: arma la app con una configuración ficticia y datos en memoria.
"""

import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
DESTINO_POR_DEFECTO = RAIZ.parent / "contrato" / "openapi.json"

sys.path.insert(0, str(RAIZ / "src"))

from composition.app import crear_app  # noqa: E402
from shared.config.config import Configuracion  # noqa: E402


def generar() -> str:
    # Valores ficticios y fijos: lo que haya en el entorno del equipo no cambia el resultado
    config = Configuracion(  # type: ignore[call-arg]
        _env_file=None,
        entorno="desarrollo",
        almacen_de_datos="memoria",
        jwt_secreto="x" * 32,
        origenes_permitidos="http://localhost:3000",
    )
    descripcion = crear_app(config).openapi()
    return json.dumps(descripcion, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    # La consola de Windows usa otra codificación: los mensajes llevan tildes
    for flujo in (sys.stdout, sys.stderr):
        flujo.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    analizador = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    analizador.add_argument("--comprobar", action="store_true", help="no escribe: falla si el archivo no coincide")
    analizador.add_argument("--destino", type=Path, default=DESTINO_POR_DEFECTO, help="archivo a escribir o comprobar")
    argumentos = analizador.parse_args()

    nuevo = generar()
    if argumentos.comprobar:
        if not argumentos.destino.exists():
            print(f"No existe {argumentos.destino}: hay que exportarlo.")
            return 1
        # read_text normaliza los finales de línea: Git en Windows puede convertir LF a CRLF
        if argumentos.destino.read_text(encoding="utf-8") != nuevo:
            print(f"{argumentos.destino} está desactualizado: vuelve a exportarlo con scripts/exportar_openapi.py")
            return 1
        print("openapi.json al día")
        return 0

    argumentos.destino.parent.mkdir(parents=True, exist_ok=True)
    argumentos.destino.write_text(nuevo, encoding="utf-8", newline="\n")
    print(f"Escrito {argumentos.destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
