from urllib.parse import urlparse

from supabase import Client, ClientOptions, create_client

_ANFITRIONES_LOCALES = {"localhost", "127.0.0.1"}


def crear_cliente(url: str, clave_de_servidor: str, *, segundos_de_espera: int = 10) -> Client:
    """Crea el cliente de Supabase con la clave de servidor (`service_role`).

    Es el único sitio que la usa: `composition/` lo llama una vez al arrancar y reparte el cliente. Los mensajes de
    error nunca incluyen la clave. Solo se admite `http` en localhost; con `http` la clave viajaría sin cifrar.
    """
    destino = urlparse(url.strip())
    es_local = destino.hostname in _ANFITRIONES_LOCALES
    if not destino.hostname or destino.scheme not in ("https", "http") or (destino.scheme == "http" and not es_local):
        raise ValueError("La URL de Supabase debe ser https (http solo en localhost)")
    if not clave_de_servidor.strip():
        raise ValueError("Falta la clave de servidor de Supabase")
    return create_client(
        url.strip(), clave_de_servidor.strip(), options=ClientOptions(postgrest_client_timeout=segundos_de_espera)
    )
