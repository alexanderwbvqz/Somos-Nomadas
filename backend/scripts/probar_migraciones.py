"""Verifica las migraciones SQL contra un Postgres desechable en Docker.

    uv run python scripts/probar_migraciones.py [carpeta-de-migraciones]

Hace falta Docker Desktop en marcha y la imagen postgres:17 (se descarga si falta). Solo toca su propio contenedor
(`nomadas-sql-pruebas`, en 127.0.0.1:54329), que borra al terminar. Imita los roles y los privilegios por defecto de
Supabase (`anon`, `authenticated`, `service_role`), así que prueba también que las funciones y las tablas no quedan
expuestas. NO prueba la API REST de Supabase ni el cliente de Python: eso necesita un proyecto de Supabase de pruebas
(ver test_contrato_repositorios.py).

Sale con código 1 si alguna comprobación falla. Para comprobar que las pruebas pueden fallar, pásale una carpeta con
una copia del SQL estropeada a propósito.
"""

import subprocess
import sys
import threading
import time
from pathlib import Path

CONTENEDOR = "nomadas-sql-pruebas"
PUERTO = "54329"
IMAGEN = "postgres:17"
CARPETA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "migraciones"
MIGRACIONES = sorted(CARPETA.glob("*.sql"))
print("Migraciones de:", CARPETA)
resultados: list[tuple[bool, str]] = []


def docker(*args: str, entrada: str | None = None, ok: bool = True) -> subprocess.CompletedProcess[str]:
    r = subprocess.run(["docker", *args], input=entrada, capture_output=True, text=True, encoding="utf-8")
    if ok and r.returncode != 0:
        raise RuntimeError(f"docker {' '.join(args[:3])} falló: {r.stderr.strip()[:400]}")
    return r


def psql(sql: str, *, rol: str | None = None, parar: bool = False) -> subprocess.CompletedProcess[str]:
    """Ejecuta SQL por stdin; devuelve stdout/stderr. `rol` ejecuta como ese rol (set role)."""
    prefijo = f"set role {rol};\n" if rol else ""
    banderas = ["-v", "ON_ERROR_STOP=1"] if parar else []
    return docker(
        "exec",
        "-i",
        CONTENEDOR,
        "psql",
        "-U",
        "postgres",
        "-d",
        "nomadas",
        "-q",
        "-tA",
        *banderas,
        "-f",
        "-",
        entrada=prefijo + sql,
        ok=False,
    )


def valor(sql: str, *, rol: str | None = None) -> str:
    r = psql(sql, rol=rol)
    return r.stdout.strip()


def comprobar(nombre: str, condicion: bool, detalle: str = "") -> None:
    resultados.append((condicion, nombre))
    print(
        ("  OK    " if condicion else "  FALLA ") + nombre + (f"  -> {detalle}" if (detalle and not condicion) else "")
    )


def denegado(sql: str, rol: str) -> bool:
    r = psql(sql, rol=rol)
    return "permission denied" in r.stderr.lower()


def en_paralelo(trabajos: list[tuple[float, str]]) -> list[str]:
    """Cada trabajo (retraso, sql) corre en su propia conexión; devuelve la salida de cada uno."""
    salidas = [""] * len(trabajos)

    def correr(i: int, retraso: float, sql: str) -> None:
        time.sleep(retraso)
        salidas[i] = psql(sql).stdout

    hilos = [threading.Thread(target=correr, args=(i, d, s)) for i, (d, s) in enumerate(trabajos)]
    [h.start() for h in hilos]
    [h.join() for h in hilos]
    return salidas


def principal() -> None:
    print(f"Levantando {IMAGEN} como {CONTENEDOR} en 127.0.0.1:{PUERTO}")
    docker("rm", "-f", CONTENEDOR, ok=False)
    docker(
        "run",
        "-d",
        "--name",
        CONTENEDOR,
        "-e",
        "POSTGRES_PASSWORD=pruebas",
        "-e",
        "POSTGRES_DB=nomadas",
        "-p",
        f"127.0.0.1:{PUERTO}:5432",
        IMAGEN,
    )
    for _ in range(60):
        r = docker("exec", CONTENEDOR, "pg_isready", "-U", "postgres", "-d", "nomadas", ok=False)
        if r.returncode == 0:
            time.sleep(1.5)  # el arranque inicial reinicia una vez
            if docker("exec", CONTENEDOR, "pg_isready", "-U", "postgres", "-d", "nomadas", ok=False).returncode == 0:
                break
        time.sleep(1)
    else:
        raise RuntimeError("Postgres no arrancó")
    print("Versión:", valor("select version();").split(",")[0])

    # Imita a Supabase: roles y privilegios por defecto (por eso las migraciones tienen que revocarlos)
    psql(
        """
        create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
        grant usage on schema public to anon, authenticated, service_role;
        alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
        alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
        alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    """,
        parar=True,
    )

    print("\n[1] Aplicar las migraciones desde sus archivos")
    for archivo in MIGRACIONES:
        r = psql(archivo.read_text(encoding="utf-8"), parar=True)
        comprobar(f"se aplica {archivo.name}", r.returncode == 0, r.stderr.strip()[:300])
    if not all(ok for ok, _ in resultados):
        return

    print("\n[2] Estructura y seguridad")
    for tabla in ("cuentas", "sesiones", "intentos_acceso"):
        comprobar(
            f"RLS activado en {tabla}", valor(f"select relrowsecurity from pg_class where relname='{tabla}';") == "t"
        )
    comprobar("ninguna política (solo entra el backend)", valor("select count(*) from pg_policies;") == "0")
    funciones = valor(
        "select string_agg(p.oid::regprocedure::text, '|') from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
        "where n.nspname='public';"
    ).split("|")
    comprobar("las 6 funciones existen", len(funciones) == 6, str(funciones))
    for f in funciones:
        for rol in ("anon", "authenticated", "public"):
            ejecutable = (
                valor(f"select has_function_privilege('{rol}', '{f}'::regprocedure, 'execute');")
                if rol != "public"
                else valor(
                    "select exists(select 1 from pg_proc p, "
                    "aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a "
                    f"where p.oid='{f}'::regprocedure and a.grantee=0 and a.privilege_type='EXECUTE');"
                )
            )
            comprobar(f"{rol} NO puede ejecutar {f}", ejecutable == "f")
        comprobar(
            f"service_role SÍ puede ejecutar {f}",
            valor(f"select has_function_privilege('service_role', '{f}'::regprocedure, 'execute');") == "t",
        )
    for tabla in ("cuentas", "sesiones", "intentos_acceso"):
        for rol in ("anon", "authenticated"):
            comprobar(f"{rol} NO puede leer {tabla}", denegado(f"select * from {tabla};", rol))
            comprobar(f"{rol} NO puede escribir en {tabla}", denegado(f"delete from {tabla};", rol))
    comprobar(
        "anon no puede llamar a crear_cuenta (como haría la API REST)",
        denegado("select crear_cuenta(gen_random_uuid(),'a@b.co','h',false,now(),'v',now());", "anon"),
    )
    comprobar(
        "authenticated no puede llamar a consumir_intento",
        denegado("select consumir_intento('sesion','x',1,60,now());", "authenticated"),
    )
    comprobar(
        "todas las funciones fijan search_path",
        valor(
            "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' "
            "and not exists (select 1 from unnest(coalesce(p.proconfig,'{}')) c where c like 'search_path=%');"
        )
        == "0",
    )

    print("\n[3] Cuentas")
    uno = "11111111-1111-4111-8111-111111111111"
    dos = "22222222-2222-4222-8222-222222222222"

    def crear(i, correo):
        fecha = "2026-11-24T12:00:00+00:00"
        return f"select crear_cuenta('{i}','{correo}','$argon2id$h',false,'{fecha}','2026-11','{fecha}');"

    comprobar(
        "crear_cuenta devuelve true la primera vez", valor(crear(uno, "ana@correo.com"), rol="service_role") == "t"
    )
    comprobar(
        "crear_cuenta devuelve false con el correo repetido",
        valor(crear(dos, "ana@correo.com"), rol="service_role") == "f",
    )
    comprobar(
        "el repetido no cambia nada (1 fila, la original)",
        valor("select count(*) || ':' || min(id::text) from cuentas;") == f"1:{uno}",
    )
    comprobar(
        "el correo en mayúsculas lo rechaza la restricción",
        "check" in psql(crear(dos, "ANA2@correo.com")).stderr.lower(),
    )
    comprobar(
        "el correo de más de 120 caracteres lo rechaza la restricción",
        "check" in psql(crear(dos, "a" * 115 + "@b.com")).stderr.lower(),
    )
    comprobar(
        "obtener_cuenta_por_correo devuelve la fila",
        valor("select id from obtener_cuenta_por_correo('ana@correo.com');", rol="service_role") == uno,
    )
    comprobar(
        "obtener_cuenta_por_correo devuelve nada si no existe",
        valor("select count(*) from obtener_cuenta_por_correo('x@correo.com');", rol="service_role") == "0",
    )
    comprobar(
        "obtener_cuenta_por_correo no la puede llamar anon",
        denegado("select * from obtener_cuenta_por_correo('ana@correo.com');", "anon"),
    )
    salidas = en_paralelo(
        [
            (
                0.0,
                "begin;\n"
                + crear("33333333-3333-4333-8333-333333333333", "carrera@correo.com")
                + "\nselect pg_sleep(2);\ncommit;",
            ),
            (0.7, crear("44444444-4444-4444-8444-444444444444", "carrera@correo.com")),
        ]
    )
    lineas = [x for s in salidas for x in s.split() if x in ("t", "f")]
    comprobar(
        "dos altas simultáneas del mismo correo: exactamente una gana", sorted(lineas) == ["f", "t"], str(salidas)
    )
    comprobar(
        "y solo queda una cuenta con ese correo",
        valor("select count(*) from cuentas where correo='carrera@correo.com';") == "1",
    )

    print("\n[4] Sesiones")

    def s(n):
        return f"aaaaaaaa-0000-4000-8000-00000000000{n}"

    def insertar(i, h):
        return (
            f"insert into sesiones(id,cuenta_id,token_hash,expira_en,creada_en) values "
            f"('{i}','{uno}','{h}','2026-12-24T12:00:00+00:00','2026-11-24T12:00:00+00:00');"
        )

    psql(insertar(s(1), "h1"), parar=True)

    def rotar(a, n, h):
        return (
            f"select rotar_sesion('{a}','{n}','{uno}','{h}','2026-12-24T12:00:00+00:00','2026-11-24T12:00:00+00:00');"
        )

    comprobar("rotar_sesion devuelve true", valor(rotar(s(1), s(2), "h2"), rol="service_role") == "t")
    comprobar(
        "la anterior queda revocada y la nueva sin revocar",
        valor(
            "select (select revocada_en is not null from sesiones where token_hash='h1') and "
            "(select revocada_en is null from sesiones where token_hash='h2');"
        )
        == "t",
    )
    comprobar(
        "rotar la misma anterior otra vez devuelve false", valor(rotar(s(1), s(3), "h3"), rol="service_role") == "f"
    )
    comprobar("y no guarda la nueva", valor("select count(*) from sesiones where token_hash='h3';") == "0")
    comprobar(
        "rotar una sesión que no existe devuelve false", valor(rotar(s(9), s(4), "h4"), rol="service_role") == "f"
    )
    comprobar(
        "una sesión con token_hash repetido se rechaza (único)", "unique" in psql(insertar(s(5), "h2")).stderr.lower()
    )
    comprobar(
        "una sesión de una cuenta inexistente se rechaza (clave foránea)",
        "foreign key"
        in psql(
            f"insert into sesiones(id,cuenta_id,token_hash,expira_en,creada_en) values "
            f"('{s(6)}',gen_random_uuid(),'hx','2026-12-24','2026-11-24');"
        ).stderr.lower(),
    )
    psql(insertar(s(7), "h7"), parar=True)
    salidas = en_paralelo(
        [
            (0.0, "begin;\n" + rotar(s(7), s(8), "h8") + "\nselect pg_sleep(2);\ncommit;"),
            (0.7, rotar(s(7), "aaaaaaaa-0000-4000-8000-0000000000a9", "h9")),
        ]
    )
    lineas = [x for sal in salidas for x in sal.split() if x in ("t", "f")]
    comprobar(
        "dos rotaciones simultáneas del mismo token: exactamente una gana", sorted(lineas) == ["f", "t"], str(salidas)
    )
    comprobar(
        "y la perdedora no deja sesión guardada",
        valor("select count(*) from sesiones where token_hash in ('h8','h9');") == "1",
    )
    psql(f"select revocar_sesion('{s(1)}');", rol="service_role")
    antes = valor("select revocada_en from sesiones where token_hash='h1';")
    time.sleep(1.1)
    psql(f"select revocar_sesion('{s(1)}');", rol="service_role")
    comprobar(
        "revocar es idempotente: no cambia la fecha de una ya revocada",
        valor("select revocada_en from sesiones where token_hash='h1';") == antes,
    )
    psql(f"select revocar_sesiones_de_cuenta('{uno}');", rol="service_role")
    comprobar(
        "revocar_sesiones_de_cuenta revoca todas las de la cuenta",
        valor(f"select count(*) from sesiones where cuenta_id='{uno}' and revocada_en is null;") == "0",
    )
    psql(f"delete from cuentas where id='{uno}';", parar=True)
    comprobar(
        "al borrar la cuenta se borran sus sesiones (cascada)",
        valor(f"select count(*) from sesiones where cuenta_id='{uno}';") == "0",
    )

    print("\n[5] Límite de intentos (misma regla que MemoriaLimitadorIntentos)")
    ahora = "2026-11-24T12:00:00+00:00"

    def consumir(accion, clave, maximo, ventana, t):
        return f"select coalesce(consumir_intento('{accion}','{clave}',{maximo},{ventana},'{t}')::text,'-');"

    comprobar(
        "permite hasta el máximo (3 de 3)",
        [valor(consumir("sesion", "k1", 3, 60, ahora), rol="service_role") for _ in range(3)] == ["-", "-", "-"],
    )
    comprobar(
        "el cuarto dice cuánto falta (50 s)",
        valor(consumir("sesion", "k1", 3, 60, "2026-11-24T12:00:10+00:00"), rol="service_role") == "50",
    )
    comprobar(
        "a los 59 s sigue bloqueado",
        valor(consumir("sesion", "k1", 3, 60, "2026-11-24T12:00:59+00:00"), rol="service_role") != "-",
    )
    comprobar(
        "a los 60 s vuelve a permitir",
        valor(consumir("sesion", "k1", 3, 60, "2026-11-24T12:01:00+00:00"), rol="service_role") == "-",
    )
    for _ in range(3):
        psql(consumir("sesion", "k2", 3, 60, ahora))
    comprobar("otra clave no se ve afectada", valor(consumir("sesion", "k3", 3, 60, ahora)) == "-")
    comprobar(
        "otra acción con la misma clave no se ve afectada", valor(consumir("registro", "k2", 3, 60, ahora)) == "-"
    )
    comprobar("la misma clave y acción sí sigue bloqueada", valor(consumir("sesion", "k2", 3, 60, ahora)) != "-")
    comprobar(
        "una acción desconocida se rechaza (restricción)",
        "check" in psql(consumir("otra", "k", 3, 60, ahora)).stderr.lower(),
    )
    comprobar(
        "lo caducado de esa clave se borra al consultarla",
        valor("select count(*) from intentos_acceso where huella='k1';") == "1",
    )
    trabajos = [
        (0.0 + i * 0.3, "begin;\n" + consumir("sesion", "carrera", 3, 60, ahora) + "\nselect pg_sleep(1.5);\ncommit;")
        for i in range(5)
    ]
    salidas = en_paralelo(trabajos)
    permitidos = sum(1 for s_ in salidas if s_.split()[0] == "-")
    comprobar(
        "5 intentos simultáneos con máximo 3: se permiten exactamente 3",
        permitidos == 3,
        str([x.split() for x in salidas]),
    )
    comprobar(
        "y quedan registrados exactamente 3",
        valor("select count(*) from intentos_acceso where huella='carrera';") == "3",
    )


try:
    principal()
finally:
    docker("rm", "-f", CONTENEDOR, ok=False)
    print(f"\nContenedor {CONTENEDOR} borrado.")
total = len(resultados)
fallos = [n for ok, n in resultados if not ok]
print(f"\n{total - len(fallos)}/{total} comprobaciones correctas")
for n in fallos:
    print("  FALLA:", n)
sys.exit(1 if fallos else 0)
