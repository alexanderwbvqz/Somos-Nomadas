"""Traduce los errores de dominio de `acceso` a respuestas HTTP con el formato de error común."""

from typing import cast

from fastapi import FastAPI, Request, Response

from modules.acceso.domain.errores import (
    CorreoSinConfirmar,
    CredencialesInvalidas,
    DatosInvalidos,
    EnlaceInvalido,
    LimiteExcedido,
    NoAutenticado,
)
from shared.http.errores import respuesta_de_error


async def _datos_invalidos(_peticion: Request, exc: Exception) -> Response:
    return respuesta_de_error(422, "datos_invalidos", campos=cast(DatosInvalidos, exc).campos)


async def _credenciales_invalidas(_peticion: Request, _exc: Exception) -> Response:
    # Sin ningún detalle: no se dice si falló el correo o la clave
    return respuesta_de_error(401, "credenciales_invalidas")


async def _correo_sin_confirmar(_peticion: Request, _exc: Exception) -> Response:
    return respuesta_de_error(403, "correo_sin_confirmar")


async def _no_autenticado(_peticion: Request, _exc: Exception) -> Response:
    return respuesta_de_error(401, "no_autenticado", cabeceras={"WWW-Authenticate": "Bearer"})


async def _enlace_invalido(_peticion: Request, _exc: Exception) -> Response:
    # Siempre igual: no se dice si el enlace no existe, ya se usó, caducó o se anuló
    return respuesta_de_error(400, "enlace_invalido")


async def _limite_excedido(_peticion: Request, exc: Exception) -> Response:
    espera = cast(LimiteExcedido, exc).reintentar_en_segundos
    return respuesta_de_error(429, "limite_excedido", cabeceras={"Retry-After": str(espera)})


def registrar_manejadores_acceso(app: FastAPI) -> None:
    app.add_exception_handler(DatosInvalidos, _datos_invalidos)
    app.add_exception_handler(CredencialesInvalidas, _credenciales_invalidas)
    app.add_exception_handler(CorreoSinConfirmar, _correo_sin_confirmar)
    app.add_exception_handler(NoAutenticado, _no_autenticado)
    app.add_exception_handler(EnlaceInvalido, _enlace_invalido)
    app.add_exception_handler(LimiteExcedido, _limite_excedido)
