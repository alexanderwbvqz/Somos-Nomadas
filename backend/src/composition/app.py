"""Punto de entrada de la API: crea FastAPI, el cliente de Supabase y monta el router de cada módulo.

Se arranca con una fábrica, para que importar este archivo no lea la configuración ni abra nada:

    uvicorn composition.app:crear_app --factory --app-dir src
"""

from datetime import UTC, datetime

from fastapi import FastAPI
from supabase import Client

from composition.acceso.dependencias import armar_acceso
from modules.acceso.api.manejadores import registrar_manejadores_acceso
from modules.acceso.api.rutas import crear_router
from shared.config.config import Configuracion
from shared.http.cors import instalar_cors
from shared.http.manejadores import instalar_manejadores_base
from shared.http.origen import crear_resolutor_de_origen
from shared.logging.logging import configurar_logging
from shared.supabase.cliente import crear_cliente

VERSION = "0.1.0"


def _ahora() -> datetime:
    return datetime.now(UTC)


def crear_app(config: Configuracion | None = None) -> FastAPI:
    config = config or Configuracion()
    configurar_logging("INFO")

    # En producción la documentación de la API no se publica
    es_produccion = config.entorno == "produccion"
    app = FastAPI(
        title="Somos Nómadas API",
        version=VERSION,
        docs_url=None if es_produccion else "/docs",
        redoc_url=None if es_produccion else "/redoc",
        openapi_url=None if es_produccion else "/openapi.json",
    )

    # El cliente de Supabase se crea una sola vez y se reparte: aquí es donde se lee la clave de servidor
    cliente: Client | None = None
    if config.almacen_de_datos == "supabase":
        cliente = crear_cliente(config.supabase_url, config.supabase_service_role_key.get_secret_value())

    acceso = armar_acceso(config, cliente, _ahora)

    instalar_manejadores_base(app)
    registrar_manejadores_acceso(app)
    app.include_router(
        crear_router(
            registrar_cuenta=acceso.registrar_cuenta,
            iniciar_sesion=acceso.iniciar_sesion,
            renovar_sesion=acceso.renovar_sesion,
            cerrar_sesion=acceso.cerrar_sesion,
            obtener_cuenta_actual=acceso.obtener_cuenta_actual,
            confirmar_correo=acceso.confirmar_correo,
            reenviar_confirmacion=acceso.reenviar_confirmacion,
            correos=acceso.correos,
            origen_de=crear_resolutor_de_origen(config.secreto_interno.get_secret_value()),
        )
    )
    # Después de los manejadores, para que las respuestas de error también lleven las cabeceras de CORS
    instalar_cors(app, config.lista_de_origenes)
    return app
