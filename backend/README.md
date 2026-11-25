# Backend

La API de Somos Nómadas, en Python (FastAPI). Guarda en Supabase (Postgres) y es la única que lo toca. Las reglas y la arquitectura están en el `CLAUDE.md` de esta carpeta, que se queda en el disco y no se sube.

**Estado:** solo el módulo `acceso` (registro, inicio de sesión, renovar, cerrar sesión y «quién soy», con correo y contraseña). Cuentas y perfiles, el recorrido de habilidades, aliados y eventos se añaden después. El contrato con el frontend está en `../contrato/autenticacion.md` y `../contrato/openapi.json`.

## Preparar

Hace falta [uv](https://docs.astral.sh/uv/).

```
uv sync
```

Copia `.env.example` a `.env` y rellena los valores (el `.env` nunca se sube). Ojo: `ENTORNO` vale `produccion` si no se indica, así que en local hay que poner `ENTORNO=desarrollo`. Para generar un secreto largo y aleatorio:

```
uv run python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Arrancar

Con datos en memoria (se pierden al apagar; solo desarrollo). En el `.env`: `ALMACEN_DE_DATOS=memoria`, `JWT_SECRETO=<secreto>` y, mientras no exista el envío de correos, `EXIGIR_CORREO_CONFIRMADO=false` (si no, nadie puede iniciar sesión con una cuenta nueva). Nunca en producción: la configuración se niega a arrancar así.

```
uv run uvicorn composition.app:crear_app --factory --app-dir src --port 8100
```

El puerto 3000 es el del frontend. Con la app en marcha, la documentación está en `http://localhost:8100/docs` (solo en desarrollo).

Con Supabase (`ALMACEN_DE_DATOS=supabase`) hacen falta `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `HUELLAS_SECRETO`, y las migraciones de `migraciones/` aplicadas. Ver «Pendientes» en el `CLAUDE.md`: el SQL aún no se ha verificado contra una base real.

## Comprobar

```
uv run pytest            # tests (los de Supabase salen «skipped» sin una base de pruebas)
uv run ruff check .      # estilo
uv run ruff format --check .
uv run mypy src tests    # tipos
```

`pytest` también vigila las reglas de capas (`import-linter`) y que `../contrato/openapi.json` esté al día.

## Exportar el contrato

El `openapi.json` no se escribe a mano. Si cambia la API:

```
uv run python scripts/exportar_openapi.py
```
