"""Aplica las migraciones SQL de migraciones/ a una base de Postgres, en orden y una sola vez cada una.

    uv run --env-file .env.pruebas python scripts/aplicar_migraciones.py            # solo lista; no cambia nada
    uv run --env-file .env.pruebas python scripts/aplicar_migraciones.py --aplicar  # aplica las que faltan

La base se indica con la variable de entorno DATABASE_URL (la cadena de conexión de Postgres, con la contraseña).
Nunca se imprime: solo el nombre del servidor. No hace falta tener `psql`: se usa el de la imagen postgres:17 de Docker,
y la cadena le llega por entorno, sin pasar por la línea de comandos.

Qué ya se aplicó se anota en la tabla nomadas.migraciones_aplicadas (un esquema que la API REST de Supabase no expone),
con una suma de comprobación de cada archivo. Cada migración se aplica en una sola transacción: si falla, no queda a
medias. Una migración ya aplicada no se puede modificar (se añade otra nueva), y no se puede añadir una anterior a
las ya aplicadas.
"""

import argparse
import hashlib
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

RAIZ = Path(__file__).resolve().parents[1]
IMAGEN = "postgres:17"
NOMBRE_VALIDO = re.compile(r"^(\d{4})_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$")


class ErrorDeMigraciones(Exception):
    pass


@dataclass(frozen=True)
class Migracion:
    nombre: str
    suma: str
    sql: str


def suma_de(texto: str) -> str:
    # Los finales de línea se normalizan: Git en Windows puede convertir LF a CRLF y no es un cambio de la migración
    return hashlib.sha256(texto.replace("\r\n", "\n").encode("utf-8")).hexdigest()


def leer_migraciones(carpeta: Path) -> list[Migracion]:
    migraciones: list[Migracion] = []
    numeros: dict[str, str] = {}
    for archivo in sorted(carpeta.glob("*.sql")):
        coincidencia = NOMBRE_VALIDO.match(archivo.name)
        if not coincidencia:
            raise ErrorDeMigraciones(
                f"El nombre «{archivo.name}» no es válido: debe ser NNNN_descripcion.sql, en minúsculas"
            )
        numero = coincidencia.group(1)
        if numero in numeros:
            raise ErrorDeMigraciones(
                f"Dos migraciones con el mismo número {numero}: {numeros[numero]} y {archivo.name}"
            )
        numeros[numero] = archivo.name
        sql = archivo.read_text(encoding="utf-8")
        migraciones.append(Migracion(nombre=archivo.name, suma=suma_de(sql), sql=sql))
    return migraciones


def pendientes(locales: list[Migracion], aplicadas: dict[str, str]) -> list[Migracion]:
    por_nombre = {m.nombre: m for m in locales}
    for nombre in sorted(aplicadas):
        if nombre not in por_nombre:
            raise ErrorDeMigraciones(f"Falta el archivo de la migración ya aplicada {nombre}")
        if por_nombre[nombre].suma != aplicadas[nombre]:
            raise ErrorDeMigraciones(
                f"La migración {nombre} ya está aplicada y fue modificada: no se editan, se añade otra nueva"
            )
    faltan = [m for m in locales if m.nombre not in aplicadas]
    if aplicadas:
        ultima = max(aplicadas)
        for m in faltan:
            if m.nombre < ultima:
                raise ErrorDeMigraciones(
                    f"La migración {m.nombre} es anterior a una ya aplicada ({ultima}): rompe el orden"
                )
    return faltan


# --- Lo que habla con la base (se prueba a mano contra un Postgres desechable) ---

PREPARAR = """
create schema if not exists nomadas;
create table if not exists nomadas.migraciones_aplicadas (
  nombre text not null,
  suma text not null,
  aplicada_en timestamptz not null default now(),
  constraint migraciones_aplicadas_pkey primary key (nombre)
);
revoke all on schema nomadas from public;
revoke all on table nomadas.migraciones_aplicadas from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on schema nomadas from anon;
    revoke all on table nomadas.migraciones_aplicadas from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on schema nomadas from authenticated;
    revoke all on table nomadas.migraciones_aplicadas from authenticated;
  end if;
end;
$$;
"""


def psql(sql: str, *, en_una_transaccion: bool = False) -> str:
    # psql no lee DATABASE_URL por sí solo: se le pasa con "$DATABASE_URL" dentro de un shell del contenedor. La cadena
    # llega por el entorno del proceso docker (-e DATABASE_URL sin valor), nunca por la línea de comandos.
    banderas = "-v ON_ERROR_STOP=1 -q -tA" + (" --single-transaction" if en_una_transaccion else "")
    orden = [
        "docker",
        "run",
        "--rm",
        "-i",
        "-e",
        "DATABASE_URL",
        IMAGEN,
        "sh",
        "-c",
        f'exec psql "$DATABASE_URL" {banderas} -f -',
    ]
    r = subprocess.run(orden, input=sql, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        raise ErrorDeMigraciones(f"psql falló:\n{r.stderr.strip()[:800]}")
    return r.stdout


def leer_aplicadas() -> dict[str, str]:
    existe = psql("select to_regclass('nomadas.migraciones_aplicadas') is not null;").strip() == "t"
    if not existe:
        return {}
    filas = psql("select nombre || '|' || suma from nomadas.migraciones_aplicadas order by nombre;")
    return dict(linea.split("|", 1) for linea in filas.splitlines() if linea)


def aplicar(m: Migracion) -> None:
    anotar = f"\ninsert into nomadas.migraciones_aplicadas (nombre, suma) values ('{m.nombre}', '{m.suma}');\n"
    psql(m.sql + anotar, en_una_transaccion=True)


def principal() -> int:
    for flujo in (sys.stdout, sys.stderr):
        flujo.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    analizador = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    analizador.add_argument("--aplicar", action="store_true", help="aplica las que faltan (sin esto, solo lista)")
    analizador.add_argument("--carpeta", type=Path, default=RAIZ / "migraciones")
    argumentos = analizador.parse_args()

    url = os.environ.get("DATABASE_URL", "")
    if not url:
        print("Falta la variable de entorno DATABASE_URL (la cadena de conexión de Postgres).")
        return 2
    destino = urlparse(url)
    print(f"Base: servidor {destino.hostname}, base «{destino.path.lstrip('/')}»")

    try:
        locales = leer_migraciones(argumentos.carpeta)
        aplicadas = leer_aplicadas()
        faltan = pendientes(locales, aplicadas)
        for m in locales:
            print(f"  {'aplicada ' if m.nombre in aplicadas else 'pendiente'}  {m.nombre}")
        if not faltan:
            print("Todo al día.")
            return 0
        if not argumentos.aplicar:
            print(f"Faltan {len(faltan)}. No se ha cambiado nada: añade --aplicar para aplicarlas.")
            return 0
        psql(PREPARAR)
        for m in faltan:
            aplicar(m)
            print(f"  APLICADA  {m.nombre}")
        print(f"Listo: {len(faltan)} aplicada(s).")
        return 0
    except ErrorDeMigraciones as error:
        print(f"ERROR: {error}")
        return 1


if __name__ == "__main__":
    sys.exit(principal())
