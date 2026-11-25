"""Exporta a contrato/reglas-de-cuenta.json casos de correo y clave con la respuesta que da el backend.

Las reglas existen en Python y en TypeScript; el frontend lee este archivo y comprueba que da lo mismo en cada caso:

    uv run python scripts/exportar_reglas_de_cuenta.py              # escribe contrato/reglas-de-cuenta.json
    uv run python scripts/exportar_reglas_de_cuenta.py --comprobar  # no escribe; falla (1) si está desactualizado

El archivo es solo ASCII (lo raro va escapado) para que ninguna herramienta lo deforme. Sin secretos ni base de datos.
"""

import argparse
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
DESTINO_POR_DEFECTO = RAIZ.parent / "contrato" / "reglas-de-cuenta.json"

sys.path.insert(0, str(RAIZ / "src"))

from modules.acceso.domain.cuenta import (  # noqa: E402
    LIMITES_CUENTA,
    DatosInicioSesion,
    DatosRegistro,
    normalizar_correo,
    validar_inicio_sesion,
    validar_registro,
)

CLAVE_BUENA = "Clave-segura1"
CORREO_BUENO = "ana@correo.com"

CORREOS = [
    "ana@correo.com",
    "  Ana@Correo.COM  ",
    "",
    "   ",
    "\t\n",
    "ana",
    "ana@",
    "@correo.com",
    "ana@correo",
    "ana@correo.",
    "ana@.com",
    "ana@correo..com",
    "ana@@correo.com",
    "ana@b@correo.com",
    "ana @correo.com",
    "ana@cor reo.com",
    "ana @correo.com",
    "ana@correo.com ",
    " ana@correo.com",
    "ana @correo.com",
    "ana　@correo.com",
    "　Ana@Correo.com　",
    "ana@correo.com",
    "ana@correo.com",
    "﻿ana@correo.com",
    "\x85ana@correo.com\x85",
    "\u1680ana@correo.com\u1680",
    "\u2028ana@correo.com\u2028",
    "\u2029ana@correo.com\u2029",
    "\u202fana@correo.com\u202f",
    "\u205fana@correo.com\u205f",
    "\u2000ana@correo.com\u2000",
    "\u200aana@correo.com\u200a",
    "ana@correo.com@correo.com",
    "ana@correo.com@",
    "ana​@correo.com",
    "ana\u0000@correo.com",
    "ana\u0007@correo.com",
    "ana\u007f@correo.com",
    "ana\u0085@correo.com",
    "ana@correo.c",
    "ana@correo.co",
    "ana@correo.c0m",
    "ana@correo.123",
    "ana@correo.com1",
    "ana+etiqueta@correo.com",
    "ana.perez@sub.correo.com",
    "ana@correo.españa",
    "aña@correo.com",
    "ana@correo.жж",
    "\U0001f600@correo.com",
    "ana@\U0001f600.com",
    "ana@correo.\U0001f600\U0001f600",
    "İ@correo.com",
    "a" * 64 + "@correo.com",
    "a" * 65 + "@correo.com",
    "a" * 64 + "@" + "b" * 50 + ".com",
    "a" * 50 + "@" + "b" * 62 + ".com",
    "a" * 50 + "@" + "b" * 63 + ".com",
    "İ" * 60 + "@correo.com",
    "İ" * 61 + "@a.com",
    "\U0001f600" * 60 + "@a.com",
    "\U0001f600" * 118 + "@a.com",
    "\U0001f600" * 115 + "@a.com",
    "ana@correo.com.",
    ".ana@correo.com",
    "an a@correo.com",
]

CLAVES = [
    CLAVE_BUENA,
    "Aa1!aaaa",
    "Aa1!aaa",
    "",
    "        ",
    "1234567",
    "sololetras",
    "SOLOMAYUSCULAS1!",
    "solominusculas1!",
    "Sinnumero!!",
    "Sinespecial1",
    "Con espacio1",
    "Con espacio1",
    "Ñandú1ñandú",
    "Ñandú1ñandú!",
    "Árbol1árbol",
    "Árbol1árbol!",
    "Clave١٢٣٤!",
    "Clave²²²²!a",
    "ClaveⅠⅡⅢⅣ!a",
    "Claveжжжжж!1",
    "Жжжжжж!1",
    "ЖЖЖЖЖЖ!1",
    "Claveßss1!",
    "CLAVEß1!A",
    "ǅaaaaaa1!",
    "İaaaaaa1!",
    "İİİİİİİİİ",
    "Claveアアアア1!",
    "Clave中文中文!1",
    "Clave\U0001f600aaa1",
    "Clave\U0001f600\U0001f600\U0001f600\U0001f600!1",
    "Aa1\U0001f600\U0001f600\U0001f600\U0001f600\U0001f600",
    "Aa1" + "\U0001f600" * 4,
    "Aa1" + "\U0001f600" * 5,
    "A1́́́́́́a",
    "Aa1!" + "́" * 4,
    "Aa1!" + "́" * 3,
    "Aa1!" + "a" * 124,
    "Aa1!" + "a" * 125,
    "Aa1!" + "\U0001f600" * 124,
    "Aa1!" + "\U0001f600" * 125,
    "Aa1" + "ñ" * 125,
    "Aa1" + "ñ" * 126,
    "a" * 129,
    "A" * 129,
    "aA1\n!aaa",
    "aA1\t!aaa",
    "  aA1!aaa",
    "aA1!aaa  ",
    "ªº1Aªº!x",
    "A1!ʰʰʰʰʰ",
]

CLAVES_INICIO_SESION = [
    "",
    " ",
    "x",
    "a",
    CLAVE_BUENA,
    "solominusculas",
    "a" * 128,
    "a" * 129,
    "\U0001f600" * 128,
    "\U0001f600" * 129,
    "İ" * 128,
    "İ" * 129,
    "        ",
    "1234567",
]


def _caso(valor: str, error: str | None) -> dict[str, object]:
    return {"valor": valor, "error": error}


def _correos() -> list[dict[str, object]]:
    return [
        _caso(c, validar_inicio_sesion(DatosInicioSesion(correo=c, clave=CLAVE_BUENA)).get("correo")) for c in CORREOS
    ]


def _claves() -> list[dict[str, object]]:
    return [
        _caso(c, validar_registro(DatosRegistro(correo=CORREO_BUENO, clave=c, acepta_politica=True)).get("clave"))
        for c in CLAVES
    ]


def _claves_inicio_sesion() -> list[dict[str, object]]:
    return [
        _caso(c, validar_inicio_sesion(DatosInicioSesion(correo=CORREO_BUENO, clave=c)).get("clave"))
        for c in CLAVES_INICIO_SESION
    ]


def generar() -> str:
    reglas = {
        "descripcion": "Generado por backend/scripts/exportar_reglas_de_cuenta.py: no se edita a mano.",
        "limites": {
            "correo": LIMITES_CUENTA.correo,
            "parte_local": LIMITES_CUENTA.parte_local,
            "clave_min": LIMITES_CUENTA.clave_min,
            "clave_max": LIMITES_CUENTA.clave_max,
        },
        "correos": _correos(),
        "correos_normalizados": [{"valor": c, "normalizado": normalizar_correo(c)} for c in CORREOS],
        "claves": _claves(),
        "claves_inicio_sesion": _claves_inicio_sesion(),
    }
    return json.dumps(reglas, indent=2, ensure_ascii=True) + "\n"


def main() -> int:
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
        if argumentos.destino.read_text(encoding="utf-8") != nuevo:
            print(f"{argumentos.destino} esta desactualizado: vuelve a exportarlo con exportar_reglas_de_cuenta.py")
            return 1
        print("reglas-de-cuenta.json al dia")
        return 0

    argumentos.destino.parent.mkdir(parents=True, exist_ok=True)
    argumentos.destino.write_text(nuevo, encoding="utf-8", newline="\n")
    print(f"Escrito {argumentos.destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
