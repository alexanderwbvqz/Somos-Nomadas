from collections.abc import Mapping

from fastapi.responses import JSONResponse


def respuesta_de_error(
    estado: int, codigo: str, *, cabeceras: Mapping[str, str] | None = None, **extra: object
) -> JSONResponse:
    """El único formato de error de toda la API: `{"codigo": "...", ...}`.

    Los mensajes que ve la persona no vienen de aquí: son del frontend, que los elige según el `codigo`.
    """
    return JSONResponse(status_code=estado, content={"codigo": codigo, **extra}, headers=dict(cabeceras or {}))
