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


def psql(
    sql: str, *, rol: str | None = None, parar: bool = False, base: str = "nomadas"
) -> subprocess.CompletedProcess[str]:
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
        base,
        "-q",
        "-tA",
        *banderas,
        "-f",
        "-",
        entrada=prefijo + sql,
        ok=False,
    )


def valor(sql: str, *, rol: str | None = None, base: str = "nomadas") -> str:
    r = psql(sql, rol=rol, base=base)
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
    for tabla in ("cuentas", "sesiones", "intentos_acceso", "confirmaciones_correo"):
        comprobar(
            f"RLS activado en {tabla}", valor(f"select relrowsecurity from pg_class where relname='{tabla}';") == "t"
        )
    comprobar("ninguna política (solo entra el backend)", valor("select count(*) from pg_policies;") == "0")
    funciones = valor(
        "select string_agg(p.oid::regprocedure::text, '|') from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
        "where n.nspname='public';"
    ).split("|")
    comprobar("las 10 funciones existen", len(funciones) == 10, str(funciones))
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
    for tabla in ("cuentas", "sesiones", "intentos_acceso", "confirmaciones_correo"):
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

    # Recalcular el hash de la clave (migración 0006): cambia solo si el hash sigue siendo el que se verificó
    clave_h = "55555555-5555-4555-8555-555555555555"
    valor(crear(clave_h, "hash@correo.com"), rol="service_role")

    def actualizar(i, anterior, nuevo):
        return f"select actualizar_clave_hash('{i}','{anterior}','{nuevo}');"

    comprobar(
        "actualizar_clave_hash devuelve true y cambia el hash si el anterior coincide",
        valor(actualizar(clave_h, "$argon2id$h", "$argon2id$nuevo"), rol="service_role") == "t"
        and valor(f"select clave_hash from cuentas where id='{clave_h}';") == "$argon2id$nuevo",
    )
    comprobar(
        "actualizar_clave_hash devuelve false y no cambia nada si el anterior ya no es ese",
        valor(actualizar(clave_h, "$argon2id$h", "$argon2id$otro"), rol="service_role") == "f"
        and valor(f"select clave_hash from cuentas where id='{clave_h}';") == "$argon2id$nuevo",
    )
    comprobar(
        "actualizar_clave_hash devuelve false si la cuenta no existe",
        valor(actualizar("99999999-9999-4999-8999-999999999999", "$argon2id$h", "x"), rol="service_role") == "f",
    )
    comprobar(
        "actualizar_clave_hash no toca otras cuentas aunque tengan el mismo hash",
        valor(f"select clave_hash from cuentas where id='{uno}';") == "$argon2id$h",
    )
    comprobar("actualizar_clave_hash no la puede llamar anon", denegado(actualizar(clave_h, "a", "b"), "anon"))
    comprobar(
        "actualizar_clave_hash no la puede llamar authenticated",
        denegado(actualizar(clave_h, "a", "b"), "authenticated"),
    )
    salidas = en_paralelo(
        [
            (
                0.0,
                "begin;\n" + actualizar(clave_h, "$argon2id$nuevo", "$argon2id$A") + "\nselect pg_sleep(2);\ncommit;",
            ),
            (0.7, actualizar(clave_h, "$argon2id$nuevo", "$argon2id$B")),
        ]
    )
    lineas = [x for s_ in salidas for x in s_.split() if x in ("t", "f")]
    comprobar(
        "dos cambios simultáneos desde el mismo hash: exactamente uno gana", sorted(lineas) == ["f", "t"], str(salidas)
    )
    comprobar(
        "y el hash guardado es el del que ganó (no una mezcla)",
        valor(f"select clave_hash from cuentas where id='{clave_h}';") == "$argon2id$A",
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
    comprobar(
        "al rotar, la anterior se revoca en p_creada_en (la hora de la aplicación), no en now()",
        valor("select revocada_en = '2026-11-24T12:00:00+00:00'::timestamptz from sesiones where token_hash='h1';")
        == "t",
    )
    psql(f"select revocar_sesion('{s(1)}', '2030-01-01T00:00:00+00:00');", rol="service_role")
    psql(f"select revocar_sesion('{s(1)}', '2031-01-01T00:00:00+00:00');", rol="service_role")
    comprobar(
        "revocar es idempotente: no cambia la fecha de una ya revocada",
        valor("select revocada_en = '2026-11-24T12:00:00+00:00'::timestamptz from sesiones where token_hash='h1';")
        == "t",
    )
    comprobar(
        "revocar no pisa el motivo de una ya rotada: sigue siendo rotada",
        valor("select motivo_revocacion from sesiones where token_hash='h1';") == "rotada",
    )
    comprobar(
        "al rotar, la anterior queda con motivo rotada y la nueva sin motivo",
        valor(
            "select (select motivo_revocacion from sesiones where token_hash='h1') || ',' || "
            "coalesce((select motivo_revocacion from sesiones where token_hash='h2'), '-');"
        )
        == "rotada,-",
    )
    cerrada_id, abierta_id = "aaaaaaaa-0000-4000-8000-0000000000b1", "aaaaaaaa-0000-4000-8000-0000000000b2"
    psql(insertar(cerrada_id, "h10"), parar=True)
    psql(f"select revocar_sesion('{cerrada_id}', '2020-03-04T05:06:07+00:00');", rol="service_role")
    comprobar(
        "revocar_sesion deja el motivo cerrada y la fecha que se le pasa (una de 2020, no la de hoy)",
        valor(
            "select motivo_revocacion || ':' || (revocada_en = '2020-03-04T05:06:07+00:00'::timestamptz)::text "
            "from sesiones where token_hash='h10';"
        )
        == "cerrada:true",
    )
    psql(insertar(abierta_id, "h11"), parar=True)
    comprobar(
        "un motivo que no existe se rechaza (restricción)",
        "check"
        in psql(f"select revocar_sesiones_de_cuenta('{uno}', 'otro', now());", rol="service_role").stderr.lower(),
    )
    comprobar(
        "y esa llamada fallida no revocó nada",
        valor("select count(*) from sesiones where token_hash='h11' and revocada_en is null;") == "1",
    )
    psql(f"select revocar_sesion('{abierta_id}', now());", rol="service_role")
    comprobar(
        "una sesión no puede tener motivo sin estar revocada",
        "check" in psql("update sesiones set revocada_en = null where token_hash='h1';").stderr.lower(),
    )
    comprobar(
        "ni estar revocada sin motivo",
        "check" in psql("update sesiones set motivo_revocacion = null where token_hash='h1';").stderr.lower(),
    )
    psql(insertar("aaaaaaaa-0000-4000-8000-0000000000b3", "h12"), parar=True)
    psql(f"select revocar_sesiones_de_cuenta('{uno}', 'robo', '2022-02-02T02:02:02+00:00');", rol="service_role")
    comprobar(
        "revocar_sesiones_de_cuenta pone la fecha que se le pasa en las que cierra",
        valor(
            f"select count(*) from sesiones where cuenta_id='{uno}' and motivo_revocacion = 'robo' "
            "and revocada_en <> '2022-02-02T02:02:02+00:00'::timestamptz;"
        )
        == "0",
    )
    comprobar(
        "revocar_sesiones_de_cuenta revoca todas las de la cuenta",
        valor(f"select count(*) from sesiones where cuenta_id='{uno}' and revocada_en is null;") == "0",
    )
    comprobar(
        "las que seguían abiertas quedan con motivo robo y las ya revocadas conservan el suyo",
        valor(
            f"select string_agg(token_hash || ':' || motivo_revocacion, ',' order by token_hash) "
            f"from sesiones where cuenta_id='{uno}';"
        )
        == "h1:rotada,h10:cerrada,h11:cerrada,h12:robo,h2:robo,h7:rotada,h8:robo",
        valor(
            f"select string_agg(token_hash || ':' || motivo_revocacion, ',' order by token_hash) "
            f"from sesiones where cuenta_id='{uno}';"
        ),
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
    confirmaciones()


def confirmaciones() -> None:
    print("\n[9] Confirmación del correo (migración 0007)")
    cuenta = "c0000000-0000-4000-8000-000000000001"
    hoy = "2026-11-25T12:00:00+00:00"
    manana = "2026-11-26T12:00:00+00:00"

    def crear(cuenta_id, correo, confirmacion_id, token):
        return (
            f"select crear_cuenta_con_confirmacion('{cuenta_id}','{correo}','$argon2id$h','{hoy}','v1','{hoy}',"
            f"'{confirmacion_id}','{token}','{manana}');"
        )

    def renovar(correo, confirmacion_id, token, ahora=hoy, expira=manana):
        return f"select renovar_confirmacion('{correo}','{confirmacion_id}','{token}','{expira}','{ahora}');"

    def confirmar(token, ahora=hoy):
        return f"select coalesce(confirmar_correo('{token}','{ahora}'), '-');"

    def vigentes(cuenta_id):
        return valor(
            f"select count(*) from confirmaciones_correo where cuenta_id='{cuenta_id}' "
            "and usada_en is null and anulada_en is null;"
        )

    def uuid_e(n):
        return f"e0000000-0000-4000-8000-{n:012d}"

    comprobar(
        "crear_cuenta_con_confirmacion crea la cuenta sin confirmar y su enlace",
        valor(crear(cuenta, "conf@correo.com", uuid_e(1), "t1"), rol="service_role") == "t"
        and valor(f"select correo_confirmado from cuentas where id='{cuenta}';") == "f"
        and vigentes(cuenta) == "1",
    )
    comprobar(
        "con el correo repetido devuelve false y no crea ni la cuenta ni otro enlace",
        valor(crear("c0000000-0000-4000-8000-000000000002", "conf@correo.com", uuid_e(2), "t2"), rol="service_role")
        == "f"
        and valor("select count(*) from cuentas where correo='conf@correo.com';") == "1"
        and valor("select count(*) from confirmaciones_correo where token_hash='t2';") == "0",
    )
    comprobar(
        "renovar_confirmacion anula el enlace vigente y deja uno solo, el nuevo",
        valor(renovar("conf@correo.com", uuid_e(3), "t3"), rol="service_role") == "t"
        and vigentes(cuenta) == "1"
        and valor("select anulada_en is not null from confirmaciones_correo where token_hash='t1';") == "t",
    )
    comprobar(
        "un enlace anulado ya no confirma",
        valor(confirmar("t1"), rol="service_role") == "-"
        and valor(f"select correo_confirmado from cuentas where id='{cuenta}';") == "f",
    )
    comprobar("un enlace desconocido no confirma", valor(confirmar("no-existe"), rol="service_role") == "-")
    comprobar(
        "un enlace caducado no confirma",
        valor(confirmar("t3", ahora="2026-11-27T12:00:00+00:00"), rol="service_role") == "-"
        and valor("select usada_en is null from confirmaciones_correo where token_hash='t3';") == "t",
    )
    comprobar(
        "el enlace vigente confirma: devuelve el correo, lo marca usado y confirma la cuenta",
        valor(confirmar("t3"), rol="service_role") == "conf@correo.com"
        and valor("select usada_en is not null from confirmaciones_correo where token_hash='t3';") == "t"
        and valor(f"select correo_confirmado from cuentas where id='{cuenta}';") == "t",
    )
    comprobar("el mismo enlace no se usa dos veces", valor(confirmar("t3"), rol="service_role") == "-")
    comprobar(
        "renovar con la cuenta ya confirmada devuelve false y no crea nada",
        valor(renovar("conf@correo.com", uuid_e(4), "t4"), rol="service_role") == "f"
        and valor("select count(*) from confirmaciones_correo where token_hash='t4';") == "0",
    )
    comprobar(
        "renovar con un correo sin cuenta devuelve false",
        valor(renovar("nadie@correo.com", uuid_e(5), "t5"), rol="service_role") == "f",
    )
    comprobar(
        "la base rechaza un enlace usado y anulado a la vez (restricción)",
        "check" in psql(f"update confirmaciones_correo set anulada_en='{hoy}' where token_hash='t3';").stderr.lower(),
    )
    comprobar(
        "la base rechaza un enlace que caduca antes de nacer (restricción)",
        "check"
        in psql(
            "insert into confirmaciones_correo(id,cuenta_id,token_hash,expira_en,creada_en) values "
            f"('{uuid_e(6)}','{cuenta}','t6','{hoy}','{manana}');"
        ).stderr.lower(),
    )
    comprobar(
        "intentos_acceso acepta las acciones reenvio y confirmacion",
        psql(
            "insert into intentos_acceso(accion,huella,ocurrido_en) values "
            f"('reenvio','r1','{hoy}'),('confirmacion','c1','{hoy}');"
        ).returncode
        == 0
        and valor("select count(*) from intentos_acceso where huella in ('r1','c1');") == "2",
    )
    comprobar(
        "borrar la cuenta borra sus enlaces",
        psql(f"delete from cuentas where id='{cuenta}';").returncode == 0
        and valor(f"select count(*) from confirmaciones_correo where cuenta_id='{cuenta}';") == "0",
    )
    for nombre, llamada, rol in (
        (
            "crear_cuenta_con_confirmacion",
            crear("c0000000-0000-4000-8000-000000000009", "x@correo.com", uuid_e(9), "tx"),
            "anon",
        ),
        ("renovar_confirmacion", renovar("x@correo.com", uuid_e(10), "ty"), "authenticated"),
        ("confirmar_correo", confirmar("tz"), "anon"),
    ):
        comprobar(f"{rol} no puede llamar a {nombre}", denegado(llamada, rol))

    # Carreras: cada trabajo en su propia conexión
    otra = "c0000000-0000-4000-8000-000000000020"
    valor(crear(otra, "carrera2@correo.com", uuid_e(20), "k1"), rol="service_role")
    salidas = en_paralelo([(0.0, "begin; " + confirmar("k1") + " select pg_sleep(2); commit;"), (0.7, confirmar("k1"))])
    obtenidos = sorted(x for s_ in salidas for x in s_.split() if x in ("carrera2@correo.com", "-"))
    comprobar(
        "dos clics a la vez en el mismo enlace: exactamente uno confirma",
        obtenidos == ["-", "carrera2@correo.com"],
        str(salidas),
    )
    tercera = "c0000000-0000-4000-8000-000000000030"
    valor(crear(tercera, "carrera3@correo.com", uuid_e(30), "m1"), rol="service_role")
    salidas = en_paralelo(
        [
            (0.0, "begin; " + renovar("carrera3@correo.com", uuid_e(31), "m2") + " select pg_sleep(2); commit;"),
            (0.7, renovar("carrera3@correo.com", uuid_e(32), "m3")),
        ]
    )
    comprobar(
        "dos reenvíos a la vez: van uno detrás de otro y queda un solo enlace vigente, el último",
        sorted(x for s_ in salidas for x in s_.split() if x in ("t", "f")) == ["t", "t"]
        and vigentes(tercera) == "1"
        and valor(
            f"select token_hash from confirmaciones_correo where cuenta_id='{tercera}' "
            "and usada_en is null and anulada_en is null;"
        )
        == "m3",
        str(salidas),
    )


BASE_ANTIGUA = "nomadas_antigua"
FUNCIONES = (
    "'crear_cuenta','obtener_cuenta_por_correo','actualizar_clave_hash','rotar_sesion','revocar_sesion',"
    "'revocar_sesiones_de_cuenta','consumir_intento','crear_cuenta_con_confirmacion','renovar_confirmacion',"
    "'confirmar_correo'"
)


def actualizacion() -> None:
    """Una base que ya tiene las migraciones 1 a 3 y datos recibe la 4: lo que pasaría en un proyecto real."""
    print("\n[7] Actualización: una base con las migraciones 1 a 3 y datos recibe la 4")
    nueva = [m for m in MIGRACIONES if m.name.startswith("0004")]
    if not nueva:
        comprobar("existe la migración 0004", False, "no se encuentra")
        return
    docker("exec", CONTENEDOR, "psql", "-U", "postgres", "-c", f"create database {BASE_ANTIGUA};", ok=False)
    for m in [m for m in MIGRACIONES if m.name < "0004"]:
        r = psql(m.read_text(encoding="utf-8"), parar=True, base=BASE_ANTIGUA)
        comprobar(f"se aplica {m.name} en la base antigua", r.returncode == 0, r.stderr.strip()[:300])
    cuenta = "cccccccc-0000-4000-8000-000000000001"
    psql(
        f"insert into cuentas(id,correo,clave_hash,politica_aceptada_en,politica_version,creada_en) values "
        f"('{cuenta}','vieja@correo.com','h','2026-11-01','v1','2026-11-01');"
        f"insert into sesiones(id,cuenta_id,token_hash,expira_en,creada_en,revocada_en) values "
        f"('cccccccc-0000-4000-8000-0000000000a1','{cuenta}','abierta','2026-12-01','2026-11-01',null),"
        f"('cccccccc-0000-4000-8000-0000000000a2','{cuenta}','revocada1','2026-12-01','2026-11-01','2026-11-02'),"
        f"('cccccccc-0000-4000-8000-0000000000a3','{cuenta}','revocada2','2026-12-01','2026-11-01','2026-11-03');",
        parar=True,
        base=BASE_ANTIGUA,
    )
    r = psql(nueva[0].read_text(encoding="utf-8"), parar=True, base=BASE_ANTIGUA)
    comprobar(f"se aplica {nueva[0].name} sobre esos datos", r.returncode == 0, r.stderr.strip()[:300])

    def v(sql: str) -> str:
        return valor(sql, base=BASE_ANTIGUA)

    comprobar(
        "las sesiones ya revocadas quedan con motivo cerrada (no cuentan como robo)",
        v(
            "select string_agg(token_hash || ':' || motivo_revocacion, ',' order by token_hash) from sesiones "
            "where revocada_en is not null;"
        )
        == "revocada1:cerrada,revocada2:cerrada",
    )
    comprobar(
        "la abierta sigue sin motivo",
        v("select motivo_revocacion is null from sesiones where token_hash='abierta';") == "t",
    )
    comprobar(
        "solo queda la función revocar_sesiones_de_cuenta con motivo (la antigua se eliminó)",
        v(
            "select string_agg(pg_get_function_identity_arguments(oid), ' | ') from pg_proc "
            "where proname = 'revocar_sesiones_de_cuenta';"
        )
        == "p_cuenta_id uuid, p_motivo text",
    )
    comprobar(
        "anon, authenticated y PUBLIC siguen sin poder ejecutar ninguna función",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and (has_function_privilege('anon', p.oid, 'execute') "
            "or has_function_privilege('authenticated', p.oid, 'execute') "
            "or exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a "
            "where a.grantee = 0 and a.privilege_type = 'EXECUTE'));"
        )
        == "0",
    )
    comprobar(
        "service_role puede ejecutar las 6",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and has_function_privilege('service_role', p.oid, 'execute');"
        )
        == "6",
    )
    comprobar(
        "las 3 tablas siguen con RLS y sin políticas",
        v(
            "select count(*) from pg_class where relnamespace='public'::regnamespace and relname in "
            "('cuentas','sesiones','intentos_acceso') and relrowsecurity;"
        )
        == "3"
        and v("select count(*) from pg_policies;") == "0",
    )
    comprobar(
        "la función rotar_sesion actualizada marca la anterior como rotada",
        valor(
            "select rotar_sesion('cccccccc-0000-4000-8000-0000000000a1','cccccccc-0000-4000-8000-0000000000a4',"
            f"'{cuenta}','nueva','2026-12-24','2026-11-24');",
            rol="service_role",
            base=BASE_ANTIGUA,
        )
        == "t"
        and v("select motivo_revocacion from sesiones where token_hash='abierta';") == "rotada",
    )
    convenciones(BASE_ANTIGUA)
    actualizacion_reloj()
    actualizacion_resto()


def actualizacion_reloj() -> None:
    """La 0005 se aplica sobre la base que ya tiene la 0004 y datos: las fechas de revocación pasan a la aplicación."""
    print("\n[8] Actualización: la 0005 (reloj de la aplicación) sobre esa misma base")
    nueva = [m for m in MIGRACIONES if m.name.startswith("0005")]
    if not nueva:
        comprobar("existe la migración 0005", False, "no se encuentra")
        return

    def v(sql: str) -> str:
        return valor(sql, base=BASE_ANTIGUA)

    antes = v(
        "select string_agg(token_hash || ':' || revocada_en::text || ':' || coalesce(motivo_revocacion, '-'), ',' "
        "order by token_hash) from sesiones;"
    )
    r = psql(nueva[0].read_text(encoding="utf-8"), parar=True, base=BASE_ANTIGUA)
    comprobar(f"se aplica {nueva[0].name} sobre esos datos", r.returncode == 0, r.stderr.strip()[:300])
    comprobar(
        "las sesiones que ya había conservan su fecha y su motivo",
        v(
            "select string_agg(token_hash || ':' || revocada_en::text || ':' || coalesce(motivo_revocacion, '-'), ',' "
            "order by token_hash) from sesiones;"
        )
        == antes,
    )
    comprobar(
        "solo queda cada función con la firma nueva (las antiguas se eliminaron)",
        v(
            "select string_agg(proname || '(' || pg_get_function_identity_arguments(oid) || ')', ' | ' "
            "order by proname) from pg_proc where pronamespace = 'public'::regnamespace "
            "and proname in ('revocar_sesion', 'revocar_sesiones_de_cuenta');"
        )
        == "revocar_sesion(p_sesion_id uuid, p_ahora timestamp with time zone) | "
        "revocar_sesiones_de_cuenta(p_cuenta_id uuid, p_motivo text, p_ahora timestamp with time zone)",
    )
    comprobar(
        "anon, authenticated y PUBLIC siguen sin poder ejecutar ninguna función",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and (has_function_privilege('anon', p.oid, 'execute') "
            "or has_function_privilege('authenticated', p.oid, 'execute') "
            "or exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a "
            "where a.grantee = 0 and a.privilege_type = 'EXECUTE'));"
        )
        == "0",
    )
    comprobar(
        "service_role puede ejecutar las 6",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and has_function_privilege('service_role', p.oid, 'execute');"
        )
        == "6",
    )
    cuenta = "cccccccc-0000-4000-8000-000000000001"
    psql(
        "insert into sesiones(id,cuenta_id,token_hash,expira_en,creada_en) values "
        f"('cccccccc-0000-4000-8000-0000000000b1','{cuenta}','n1','2030-01-01','2026-11-01'),"
        f"('cccccccc-0000-4000-8000-0000000000b2','{cuenta}','n2','2030-01-01','2026-11-01'),"
        f"('cccccccc-0000-4000-8000-0000000000b3','{cuenta}','n3','2030-01-01','2026-11-01');",
        parar=True,
        base=BASE_ANTIGUA,
    )
    valor(
        "select revocar_sesion('cccccccc-0000-4000-8000-0000000000b1', '2019-01-02T03:04:05+00:00');",
        rol="service_role",
        base=BASE_ANTIGUA,
    )
    valor(
        "select rotar_sesion('cccccccc-0000-4000-8000-0000000000b2','cccccccc-0000-4000-8000-0000000000b4',"
        f"'{cuenta}','n4','2030-01-01','2019-06-07T08:09:10+00:00');",
        rol="service_role",
        base=BASE_ANTIGUA,
    )
    valor(
        f"select revocar_sesiones_de_cuenta('{cuenta}', 'robo', '2018-11-12T13:14:15+00:00');",
        rol="service_role",
        base=BASE_ANTIGUA,
    )
    comprobar(
        "las tres funciones guardan la fecha de la aplicación (de 2018 y 2019, no la de hoy)",
        v(
            "select string_agg(token_hash || ':' || motivo_revocacion || ':' "
            "|| to_char(revocada_en at time zone 'utc', 'YYYY-MM-DD'), ',' order by token_hash) "
            "from sesiones where token_hash in ('n1', 'n2', 'n3', 'n4');"
        )
        == "n1:cerrada:2019-01-02,n2:rotada:2019-06-07,n3:robo:2018-11-12,n4:robo:2018-11-12",
    )
    convenciones(BASE_ANTIGUA)


# Formato de un identificador: español sin tildes ni ñ, snake_case, en minúsculas
FORMATO = "^[a-z][a-z0-9]*(_[a-z0-9]+)*$"
ESQUEMAS = "('public', 'nomadas')"

# Cada regla es una consulta al catálogo de Postgres que devuelve las infracciones: una lista vacía es que se cumple
REGLAS_DE_NOMBRES: list[tuple[str, str]] = [
    (
        "tablas, índices, columnas, funciones y restricciones en snake_case, sin tildes ni mayúsculas",
        f"""
        select 'tabla o indice ' || c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in {ESQUEMAS} and c.relkind in ('r', 'i') and c.relname !~ '{FORMATO}'
        union all
        select 'columna ' || c.relname || '.' || a.attname
          from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in {ESQUEMAS} and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
           and a.attname !~ '{FORMATO}'
        union all
        select 'funcion ' || p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname !~ '{FORMATO}'
        union all
        select 'restriccion ' || k.conname from pg_constraint k join pg_namespace n on n.oid = k.connamespace
         where n.nspname in {ESQUEMAS} and k.conname !~ '{FORMATO}'
        """,
    ),
    (
        "toda tabla de public tiene la clave primaria `id` llamada <tabla>_pkey",
        """
        select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind = 'r'
           and not exists (
             select 1 from pg_constraint k
              where k.conrelid = c.oid and k.contype = 'p' and k.conname = c.relname || '_pkey'
                and (select array_agg(a.attname::text) from pg_attribute a
                      where a.attrelid = c.oid and a.attnum = any (k.conkey)) = array['id'])
        """,
    ),
    (
        "restricciones llamadas <tabla>_pkey, <tabla>_<columnas>_key, _fkey o _check según su tipo",
        f"""
        select k.conname from pg_constraint k
          join pg_class c on c.oid = k.conrelid join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in {ESQUEMAS} and (
               (k.contype = 'p' and k.conname <> c.relname || '_pkey')
            or (k.contype = 'u' and k.conname !~ ('^' || c.relname || '_[a-z0-9_]+_key$'))
            or (k.contype = 'f' and k.conname !~ ('^' || c.relname || '_[a-z0-9_]+_fkey$'))
            or (k.contype = 'c' and k.conname !~ ('^' || c.relname || '_[a-z0-9_]+_check$')))
        """,
    ),
    (
        "las claves foráneas son columnas <entidad>_id",
        f"""
        select k.conname from pg_constraint k
          join pg_class c on c.oid = k.conrelid join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in {ESQUEMAS} and k.contype = 'f'
           and exists (select 1 from unnest(k.conkey) as cn(num)
                        join pg_attribute a on a.attrelid = k.conrelid and a.attnum = cn.num
                       where a.attname !~ '_id$')
        """,
    ),
    (
        "los índices se llaman <tabla>_<columnas>_idx (con las columnas en orden)",
        f"""
        select ic.relname from pg_index i
          join pg_class ic on ic.oid = i.indexrelid join pg_class t on t.oid = i.indrelid
          join pg_namespace n on n.oid = t.relnamespace
         where n.nspname in {ESQUEMAS}
           and not exists (select 1 from pg_constraint k where k.conindid = i.indexrelid)
           and ic.relname <> t.relname || '_' || (
                 select string_agg(a.attname, '_' order by x.orden)
                   from unnest(string_to_array(i.indkey::text, ' ')::int[]) with ordinality as x(num, orden)
                   join pg_attribute a on a.attrelid = t.oid and a.attnum = x.num) || '_idx'
        """,
    ),
    (
        "las columnas de fecha terminan en _en",
        f"""
        select c.relname || '.' || a.attname
          from pg_attribute a join pg_class c on c.oid = a.attrelid join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in {ESQUEMAS} and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
           and a.atttypid in ('timestamptz'::regtype, 'timestamp'::regtype, 'date'::regtype)
           and a.attname !~ '_en$'
        """,
    ),
    (
        "las funciones empiezan por un verbo en infinitivo y sus parámetros por p_",
        """
        select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname !~ '^[a-z]+(ar|er|ir)(_|$)'
        union all
        select p.proname || '(' || a.nombre || ')'
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
          cross join lateral unnest(coalesce(p.proargnames, '{}')) as a(nombre)
         where n.nspname = 'public' and a.nombre !~ '^p_'
        """,
    ),
]


def actualizacion_resto() -> None:
    """Las migraciones de la 0006 en adelante, sobre esa misma base con datos: lo que pasará en Supabase."""
    print("\n[10] Actualización: de la 0006 en adelante sobre esa misma base con datos")

    def v(sql: str) -> str:
        return valor(sql, base=BASE_ANTIGUA)

    cuenta = "cccccccc-0000-4000-8000-000000000001"
    psql(
        "insert into intentos_acceso(accion,huella,ocurrido_en) values "
        "('registro','viejo-r','2026-11-01'),('sesion','viejo-s','2026-11-01');",
        parar=True,
        base=BASE_ANTIGUA,
    )
    antes = v("select string_agg(accion || ':' || huella, ',' order by huella) from intentos_acceso;")
    for m in [m for m in MIGRACIONES if m.name >= "0006"]:
        r = psql(m.read_text(encoding="utf-8"), parar=True, base=BASE_ANTIGUA)
        comprobar(f"se aplica {m.name} sobre esos datos", r.returncode == 0, r.stderr.strip()[:300])
    comprobar(
        "los intentos que ya había siguen ahí y valen con la restricción nueva",
        v("select string_agg(accion || ':' || huella, ',' order by huella) from intentos_acceso;") == antes,
    )
    comprobar(
        "una cuenta vieja sin confirmar puede pedir su primer enlace",
        v(
            "select renovar_confirmacion('vieja@correo.com','cccccccc-0000-4000-8000-0000000000e1','vh1',"
            "'2026-11-26T12:00:00+00:00','2026-11-25T12:00:00+00:00');"
        )
        == "t"
        and v(f"select count(*) from confirmaciones_correo where cuenta_id='{cuenta}';") == "1",
    )
    comprobar(
        "anon, authenticated y PUBLIC no pueden ejecutar ninguna de las 10 funciones",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and (has_function_privilege('anon', p.oid, 'execute') "
            "or has_function_privilege('authenticated', p.oid, 'execute') "
            "or exists (select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a "
            "where a.grantee = 0 and a.privilege_type = 'EXECUTE'));"
        )
        == "0",
    )
    comprobar(
        "service_role puede ejecutar las 10",
        v(
            f"select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace "
            f"and p.proname in ({FUNCIONES}) "
            "and has_function_privilege('service_role', p.oid, 'execute');"
        )
        == "10",
    )
    convenciones(BASE_ANTIGUA)


def convenciones(base: str = "nomadas") -> None:
    sufijo = "" if base == "nomadas" else " (tras actualizar)"
    print(f"\n[6] Reglas de nombres{sufijo} (backend/CLAUDE.md, «Base de datos: nombres»)")
    for descripcion, consulta in REGLAS_DE_NOMBRES:
        infracciones = valor(consulta, base=base)
        comprobar(descripcion + sufijo, infracciones == "", infracciones.replace("\n", ", "))


try:
    principal()
    # Las reglas de nombres se comprueban siempre que las migraciones se hayan aplicado, aunque falle otra cosa
    if valor("select to_regclass('public.cuentas') is not null;") == "t":
        convenciones()
        actualizacion()
finally:
    docker("rm", "-f", CONTENEDOR, ok=False)
    print(f"\nContenedor {CONTENEDOR} borrado.")
total = len(resultados)
fallos = [n for ok, n in resultados if not ok]
print(f"\n{total - len(fallos)}/{total} comprobaciones correctas")
for n in fallos:
    print("  FALLA:", n)
sys.exit(1 if fallos else 0)
