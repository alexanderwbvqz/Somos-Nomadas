import logging
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from shared.http.errores import respuesta_de_error

registro = logging.getLogger("nomadas")

_CODIGOS_HTTP = {404: "no_encontrado", 405: "metodo_no_permitido"}


async def _validacion(_peticion: Request, exc: Exception) -> Response:
    """Lo que pydantic rechaza antes de llegar al dominio. Nunca repite lo que se envió (podría ser una clave)."""
    assert isinstance(exc, RequestValidationError)
    campos: dict[str, str] = {}
    for error in exc.errors():
        ubicacion = error["loc"]
        if len(ubicacion) < 2 or not isinstance(ubicacion[1], str):
            continue  # el cuerpo entero (no es JSON, o falta): no hay un campo al que culpar
        campo = ubicacion[1]
        if error["type"] == "missing":
            campos[campo] = "obligatorio"
        else:
            campos.setdefault(campo, "invalido")
    return respuesta_de_error(422, "datos_invalidos", campos=campos)


async def _http(_peticion: Request, exc: Exception) -> Response:
    assert isinstance(exc, StarletteHTTPException)
    codigo = _CODIGOS_HTTP.get(exc.status_code, "fallo")
    return respuesta_de_error(exc.status_code, codigo, cabeceras=exc.headers)


class _CapturarErroresInesperados(BaseHTTPMiddleware):
    """Convierte cualquier fallo inesperado en un 500 sin detalles y lo registra sin el mensaje ni el traceback.

    Si el error subiera hasta el servidor, éste lo escribiría completo en el log, con lo que lleve dentro la
    excepción (un correo, una clave). Por eso se captura aquí y no se vuelve a lanzar.
    """

    async def dispatch(self, peticion: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        try:
            return await call_next(peticion)
        except Exception as exc:
            registro.error("Error inesperado %s en %s %s", type(exc).__name__, peticion.method, peticion.url.path)
            return respuesta_de_error(500, "fallo")


def instalar_manejadores_base(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, _validacion)
    app.add_exception_handler(StarletteHTTPException, _http)
    app.add_middleware(_CapturarErroresInesperados)
