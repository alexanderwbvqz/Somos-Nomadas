# Contrato

Cómo se conectan las piezas:

```
Navegador ──► frontend (Next) ──HTTP──► API del backend (Python) ──► Supabase (Postgres)
                        ◄──────────── respuesta JSON ◄───────────
```

- El frontend solo habla con la API. Nunca con la base de datos.
- La API es la única que toca Supabase, con la clave de servidor. Las tablas llevan RLS activado y sin políticas.
- Los campos de la API se mantienen tal cual en los adaptadores `Http...Repository` del frontend y se traducen en el mapper (zod).

Aquí irá `openapi.json`, la descripción exacta de la API. No se escribe a mano: un script de `backend/` lo exporta desde FastAPI. Si cambia la API, se vuelve a exportar.
