"""Enlace de confirmación ↔ argumentos de las funciones SQL de la migración 0007. Único sitio con esos nombres."""

from typing import Any

from modules.acceso.domain.confirmacion import EnlaceNuevo
from modules.acceso.domain.cuenta import Cuenta
from shared.supabase.errores import ErrorDeBaseDeDatos


def parametros_de_cuenta_con_confirmacion(cuenta: Cuenta, enlace: EnlaceNuevo) -> dict[str, Any]:
    """Los argumentos de `crear_cuenta_con_confirmacion`. La cuenta nace sin confirmar: la función no lo pregunta."""
    return {
        "p_id": str(cuenta.id),
        "p_correo": cuenta.correo,
        "p_clave_hash": cuenta.clave_hash,
        "p_politica_aceptada_en": cuenta.politica_aceptada_en.isoformat(),
        "p_politica_version": cuenta.politica_version,
        "p_creada_en": cuenta.creada_en.isoformat(),
        "p_confirmacion_id": str(enlace.id),
        "p_token_hash": enlace.token_hash,
        "p_expira_en": enlace.expira_en.isoformat(),
    }


def parametros_de_renovacion(correo: str, enlace: EnlaceNuevo) -> dict[str, Any]:
    """Los argumentos de `renovar_confirmacion`: los enlaces vigentes se anulan en el instante en que nace el nuevo."""
    return {
        "p_correo": correo,
        "p_confirmacion_id": str(enlace.id),
        "p_token_hash": enlace.token_hash,
        "p_expira_en": enlace.expira_en.isoformat(),
        "p_ahora": enlace.creada_en.isoformat(),
    }


def booleano(datos: object) -> bool:
    if not isinstance(datos, bool):
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    return datos


def correo_confirmado(datos: object) -> str | None:
    """Lo que devuelve `confirmar_correo`: el correo, o nada si el enlace no vale."""
    if datos is None:
        return None
    if not isinstance(datos, str) or datos == "":
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    return datos
