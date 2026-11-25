import logging
from collections.abc import Callable
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, Request, Response

from modules.acceso.api.esquemas import (
    ConfirmacionEntrada,
    ConfirmacionSalida,
    CuentaSalida,
    ErrorSalida,
    ReenvioEntrada,
    RegistroEntrada,
    SesionEntrada,
    SesionSalida,
    TokenRenovacionEntrada,
    TokensSalida,
)
from modules.acceso.application.cerrar_sesion import CerrarSesion
from modules.acceso.application.confirmar_correo import ConfirmarCorreo
from modules.acceso.application.iniciar_sesion import IniciarSesion
from modules.acceso.application.obtener_cuenta_actual import ObtenerCuentaActual
from modules.acceso.application.reenviar_confirmacion import ReenviarConfirmacion
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.application.renovar_sesion import RenovarSesion
from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.domain.correos_de_acceso import CorreosDeAcceso
from modules.acceso.domain.cuenta import DatosInicioSesion, DatosRegistro
from modules.acceso.domain.errores import CorreoNoEnviado, NoAutenticado

_log = logging.getLogger(__name__)

_DATOS_INVALIDOS: dict[int | str, dict[str, Any]] = {422: {"model": ErrorSalida, "description": "Datos inválidos"}}
_LIMITE: dict[int | str, dict[str, Any]] = {429: {"model": ErrorSalida, "description": "Demasiados intentos"}}
_NO_AUTENTICADO: dict[int | str, dict[str, Any]] = {401: {"model": ErrorSalida, "description": "No autenticado"}}
_ENLACE_INVALIDO: dict[int | str, dict[str, Any]] = {
    400: {"model": ErrorSalida, "description": "El enlace no existe, ya se usó, caducó o se anuló (no dice cuál)"}
}


def _texto_de_la_trampa(valor: object) -> str:
    """Lo que no sea texto (un número, una lista...) lo manda un robot: cuenta como relleno. Nulo o vacío, no."""
    if valor is None or valor == "":
        return ""
    return valor if isinstance(valor, str) else "no-es-texto"


def _token_bearer(peticion: Request) -> str:
    esquema, _, token = peticion.headers.get("authorization", "").partition(" ")
    if esquema.lower() != "bearer" or not token.strip():
        raise NoAutenticado("Falta el token")
    return token.strip()


def _enviar_en_segundo_plano(correos: CorreosDeAcceso, pendiente: CorreoPendiente) -> None:
    """Se ejecuta después de responder: la respuesta no espera al servicio de correo, así que tarda lo mismo haya envío
    o no (y no delata qué correos tienen cuenta). Si falla, la persona puede pedir otro enlace; el registro lleva solo
    un código corto, nunca el correo ni el token."""
    try:
        correos.enviar_confirmacion(pendiente)
    except CorreoNoEnviado as error:
        _log.warning("No se envió el correo de confirmación: %s", error.motivo)
    except Exception as error:  # noqa: BLE001 - lo inesperado tampoco puede repetir datos de la persona
        _log.error("Fallo inesperado al enviar el correo de confirmación: %s", type(error).__name__)


def crear_router(
    *,
    registrar_cuenta: RegistrarCuenta,
    iniciar_sesion: IniciarSesion,
    renovar_sesion: RenovarSesion,
    cerrar_sesion: CerrarSesion,
    obtener_cuenta_actual: ObtenerCuentaActual,
    confirmar_correo: ConfirmarCorreo,
    reenviar_confirmacion: ReenviarConfirmacion,
    correos: CorreosDeAcceso,
    origen_de: Callable[[Request], str],
) -> APIRouter:
    """Las rutas de `acceso`. Recibe los casos de uso ya armados: quien los arma es `composition/`.

    `origen_de` dice de dónde viene cada petición (para los límites de intentos): la IP real que reenvía Next o la de la
    conexión. Lo decide `shared/http/origen.py`; las rutas no saben cómo.
    """
    router = APIRouter(prefix="/acceso", tags=["acceso"])

    @router.post(
        "/registro",
        status_code=202,
        response_class=Response,
        responses={**_DATOS_INVALIDOS, **_LIMITE, 202: {"description": "Aceptado. No dice si el correo ya existía"}},
    )
    def registro(cuerpo: RegistroEntrada, peticion: Request, tareas: BackgroundTasks) -> Response:
        pendiente = registrar_cuenta.ejecutar(
            DatosRegistro(
                correo=cuerpo.correo,
                clave=cuerpo.clave,
                acepta_politica=cuerpo.acepta_politica,
                sitio_secundario=_texto_de_la_trampa(cuerpo.sitio_secundario),
            ),
            origen_de(peticion),
            cuerpo.idioma,
        )
        if pendiente is not None:
            tareas.add_task(_enviar_en_segundo_plano, correos, pendiente)
        return Response(status_code=202)

    @router.post(
        "/confirmacion",
        response_model=ConfirmacionSalida,
        responses={**_DATOS_INVALIDOS, **_LIMITE, **_ENLACE_INVALIDO},
    )
    def confirmacion(cuerpo: ConfirmacionEntrada, peticion: Request) -> ConfirmacionSalida:
        # Confirma el correo y nada más: no abre sesión
        return ConfirmacionSalida(correo=confirmar_correo.ejecutar(cuerpo.token, origen_de(peticion)))

    @router.post(
        "/confirmacion/reenvio",
        status_code=202,
        response_class=Response,
        responses={
            **_DATOS_INVALIDOS,
            **_LIMITE,
            202: {"description": "Aceptado. No dice si el correo tiene cuenta ni si ya está confirmado"},
        },
    )
    def reenvio(cuerpo: ReenvioEntrada, peticion: Request, tareas: BackgroundTasks) -> Response:
        pendiente = reenviar_confirmacion.ejecutar(cuerpo.correo, origen_de(peticion), cuerpo.idioma)
        if pendiente is not None:
            tareas.add_task(_enviar_en_segundo_plano, correos, pendiente)
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
        iniciada = iniciar_sesion.ejecutar(DatosInicioSesion(cuerpo.correo, cuerpo.clave), origen_de(peticion))
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
