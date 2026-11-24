from typing import Any

from fastapi import APIRouter, Depends, Request, Response

from modules.acceso.api.esquemas import (
    CuentaSalida,
    ErrorSalida,
    RegistroEntrada,
    SesionEntrada,
    SesionSalida,
    TokenRenovacionEntrada,
    TokensSalida,
)
from modules.acceso.application.cerrar_sesion import CerrarSesion
from modules.acceso.application.iniciar_sesion import IniciarSesion
from modules.acceso.application.obtener_cuenta_actual import ObtenerCuentaActual
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.application.renovar_sesion import RenovarSesion
from modules.acceso.domain.cuenta import DatosInicioSesion, DatosRegistro
from modules.acceso.domain.errores import NoAutenticado

_DATOS_INVALIDOS: dict[int | str, dict[str, Any]] = {422: {"model": ErrorSalida, "description": "Datos inválidos"}}
_LIMITE: dict[int | str, dict[str, Any]] = {429: {"model": ErrorSalida, "description": "Demasiados intentos"}}
_NO_AUTENTICADO: dict[int | str, dict[str, Any]] = {401: {"model": ErrorSalida, "description": "No autenticado"}}


def _origen(peticion: Request) -> str:
    """La IP del cliente, para el límite de intentos.

    Detrás del proxy de Render, uvicorn debe arrancar con `--proxy-headers` y `--forwarded-allow-ips`; si no,
    esto sería la IP del proxy (ver «Pendientes» en backend/CLAUDE.md).
    """
    return peticion.client.host if peticion.client else "desconocido"


def _token_bearer(peticion: Request) -> str:
    esquema, _, token = peticion.headers.get("authorization", "").partition(" ")
    if esquema.lower() != "bearer" or not token.strip():
        raise NoAutenticado("Falta el token")
    return token.strip()


def crear_router(
    *,
    registrar_cuenta: RegistrarCuenta,
    iniciar_sesion: IniciarSesion,
    renovar_sesion: RenovarSesion,
    cerrar_sesion: CerrarSesion,
    obtener_cuenta_actual: ObtenerCuentaActual,
) -> APIRouter:
    """Las rutas de `acceso`. Recibe los casos de uso ya armados: quien los arma es `composition/`."""
    router = APIRouter(prefix="/acceso", tags=["acceso"])

    @router.post(
        "/registro",
        status_code=202,
        response_class=Response,
        responses={**_DATOS_INVALIDOS, **_LIMITE, 202: {"description": "Aceptado. No dice si el correo ya existía"}},
    )
    def registro(cuerpo: RegistroEntrada, peticion: Request) -> Response:
        registrar_cuenta.ejecutar(
            DatosRegistro(
                correo=cuerpo.correo,
                clave=cuerpo.clave,
                acepta_politica=cuerpo.acepta_politica,
                sitio_secundario=cuerpo.sitio_secundario,
            ),
            _origen(peticion),
        )
        return Response(status_code=202)

    @router.post(
        "/sesion",
        response_model=SesionSalida,
        responses={
            **_DATOS_INVALIDOS,
            **_LIMITE,
            401: {"model": ErrorSalida, "description": "Correo o contraseña incorrectos"},
            403: {"model": ErrorSalida, "description": "El correo aún no se confirmó"},
        },
    )
    def sesion(cuerpo: SesionEntrada, peticion: Request) -> SesionSalida:
        iniciada = iniciar_sesion.ejecutar(DatosInicioSesion(cuerpo.correo, cuerpo.clave), _origen(peticion))
        tokens = iniciada.tokens
        return SesionSalida(
            token_acceso=tokens.token_acceso,
            expira_en=tokens.expira_en_segundos,
            token_renovacion=tokens.token_renovacion,
            correo=iniciada.correo,
        )

    @router.post("/renovar", response_model=TokensSalida, responses={**_DATOS_INVALIDOS, **_NO_AUTENTICADO})
    def renovar(cuerpo: TokenRenovacionEntrada) -> TokensSalida:
        tokens = renovar_sesion.ejecutar(cuerpo.token_renovacion)
        return TokensSalida(
            token_acceso=tokens.token_acceso,
            expira_en=tokens.expira_en_segundos,
            token_renovacion=tokens.token_renovacion,
        )

    @router.post(
        "/cierre",
        status_code=204,
        response_class=Response,
        responses={**_DATOS_INVALIDOS, 204: {"description": "Cerrada. Tampoco falla si ya estaba cerrada"}},
    )
    def cierre(cuerpo: TokenRenovacionEntrada) -> Response:
        cerrar_sesion.ejecutar(cuerpo.token_renovacion)
        return Response(status_code=204)

    @router.get("/yo", response_model=CuentaSalida, responses=_NO_AUTENTICADO)
    def yo(token: str = Depends(_token_bearer)) -> CuentaSalida:
        cuenta = obtener_cuenta_actual.ejecutar(token)
        # Solo lo que la persona necesita ver: nunca la clave ni su hash ni la prueba del consentimiento
        return CuentaSalida(id=cuenta.id, correo=cuenta.correo, correo_confirmado=cuenta.correo_confirmado)

    return router
