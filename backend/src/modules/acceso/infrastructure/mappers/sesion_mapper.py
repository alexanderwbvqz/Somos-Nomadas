"""Fila de la tabla `sesiones` ↔ entidad `Sesion`. Es el único sitio que conoce los nombres de columna."""

from typing import Any, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, ValidationError

from modules.acceso.domain.sesion import Sesion
from modules.acceso.infrastructure.mappers.filas import lista_de_filas
from shared.supabase.errores import ErrorDeBaseDeDatos

COLUMNAS_SESION = ("id", "cuenta_id", "token_hash", "expira_en", "creada_en", "revocada_en", "motivo_revocacion")


class _FilaSesion(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: UUID
    cuenta_id: UUID
    token_hash: str
    expira_en: AwareDatetime
    creada_en: AwareDatetime
    revocada_en: AwareDatetime | None
    motivo_revocacion: Literal["rotada", "cerrada", "robo"] | None


def sesion_de_filas(datos: object) -> Sesion | None:
    filas = lista_de_filas(datos)
    if not filas:
        return None
    try:
        # Una fila que no es un objeto (por ejemplo None) no es «no hay cuenta»: es una respuesta mal formada
        leida = _FilaSesion.model_validate(filas[0])
    except ValidationError:
        raise ErrorDeBaseDeDatos("fila_invalida") from None
    return Sesion(
        id=leida.id,
        cuenta_id=leida.cuenta_id,
        token_hash=leida.token_hash,
        expira_en=leida.expira_en,
        creada_en=leida.creada_en,
        revocada_en=leida.revocada_en,
        motivo_revocacion=leida.motivo_revocacion,
    )


def fila_de_sesion(sesion: Sesion) -> dict[str, Any]:
    """La fila a insertar. Una sesión nueva nace sin revocar: no se envía `revocada_en`."""
    return {
        "id": str(sesion.id),
        "cuenta_id": str(sesion.cuenta_id),
        "token_hash": sesion.token_hash,
        "expira_en": sesion.expira_en.isoformat(),
        "creada_en": sesion.creada_en.isoformat(),
    }


def parametros_de_rotacion(anterior: Sesion, nueva: Sesion) -> dict[str, Any]:
    """Los argumentos de la función SQL `rotar_sesion`."""
    return {
        "p_anterior_id": str(anterior.id),
        "p_nueva_id": str(nueva.id),
        "p_cuenta_id": str(nueva.cuenta_id),
        "p_token_hash": nueva.token_hash,
        "p_expira_en": nueva.expira_en.isoformat(),
        "p_creada_en": nueva.creada_en.isoformat(),
    }
