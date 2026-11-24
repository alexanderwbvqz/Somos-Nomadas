from collections.abc import Iterable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def instalar_cors(app: FastAPI, origenes_permitidos: Iterable[str]) -> None:
    """CORS restringido a los orígenes propios. Sin comodín y sin credenciales: la sesión no viaja en cookies.

    Recordatorio: CORS solo le dice al navegador qué web puede leer la respuesta. Quien llama con `curl` lo
    ignora; la protección real es la autenticación de cada ruta.

    Debe instalarse después de `instalar_manejadores_base`, para que las respuestas de error también lo lleven.
    """
    origenes = [o.strip() for o in origenes_permitidos if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origenes,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        max_age=600,
    )
