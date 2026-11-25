from collections.abc import Iterator
from contextlib import contextmanager

import httpx
from postgrest.exceptions import APIError


class ErrorDeBaseDeDatos(Exception):
    """Un fallo al hablar con la base de datos. Solo lleva un código, nunca el mensaje original.

    El mensaje de Postgres puede traer los datos de la fila (por ejemplo, el correo de una clave duplicada), y un
    error acaba en logs y trazas: por eso no se conserva. No es un error de dominio, así que llega a la API como un
    500 `fallo`.
    """

    def __init__(self, codigo: str | None = None) -> None:
        super().__init__("Fallo al hablar con la base de datos")
        self.codigo = codigo


@contextmanager
def traducir_errores() -> Iterator[None]:
    """Convierte los errores de Supabase (HTTP y de Postgres) en `ErrorDeBaseDeDatos`, sin su mensaje."""
    try:
        yield
    except APIError as exc:
        raise ErrorDeBaseDeDatos(exc.code) from None
    except httpx.HTTPError:
        raise ErrorDeBaseDeDatos("red") from None
