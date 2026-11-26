"""Enlace de confirmación ↔ argumentos y respuestas de las funciones SQL (migraciones 0007 y 0008). Único sitio con
esos nombres."""

from typing import Any
from uuid import UUID

from modules.acceso.domain.confirmacion import EnlaceNuevo, EnlaceUsado
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
        "p_navegador_hash": enlace.navegador_hash,
    }


def parametros_de_renovacion(correo: str, enlace: EnlaceNuevo) -> dict[str, Any]:
    """Los argumentos de `renovar_confirmacion`: los enlaces vigentes se anulan en el instante en que nace el nuevo."""
    return {
        "p_correo": correo,
        "p_confirmacion_id": str(enlace.id),
        "p_token_hash": enlace.token_hash,
        "p_expira_en": enlace.expira_en.isoformat(),
        "p_ahora": enlace.creada_en.isoformat(),
        "p_navegador_hash": enlace.navegador_hash,
    }


def booleano(datos: object) -> bool:
    if not isinstance(datos, bool):
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    return datos


def enlace_usado(datos: object) -> EnlaceUsado | None:
    """Lo que devuelve `confirmar_correo`: la cuenta, su correo y la huella del navegador, o nada si el enlace no vale.
    Cualquier otra forma es un error: nunca se toma por un enlace válido."""
    if datos is None:
        return None
    if not isinstance(datos, dict) or set(datos) != {"cuenta_id", "correo", "navegador_hash"}:
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    cuenta_id, correo, navegador_hash = datos["cuenta_id"], datos["correo"], datos["navegador_hash"]
    if not isinstance(correo, str) or correo == "":
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    if navegador_hash is not None and (not isinstance(navegador_hash, str) or navegador_hash == ""):
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    try:
        return EnlaceUsado(cuenta_id=UUID(str(cuenta_id)), correo=correo, navegador_hash=navegador_hash)
    except ValueError:
        raise ErrorDeBaseDeDatos("respuesta_inesperada") from None
