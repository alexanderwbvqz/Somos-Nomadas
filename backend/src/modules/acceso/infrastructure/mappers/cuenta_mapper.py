"""Fila de la tabla `cuentas` ↔ entidad `Cuenta`. Es el único sitio que conoce los nombres de columna."""

from typing import Any
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, ValidationError

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.infrastructure.mappers.filas import lista_de_filas
from shared.supabase.errores import ErrorDeBaseDeDatos

COLUMNAS_CUENTA = (
    "id",
    "correo",
    "clave_hash",
    "correo_confirmado",
    "politica_aceptada_en",
    "politica_version",
    "creada_en",
)


class _FilaCuenta(BaseModel):
    model_config = ConfigDict(extra="ignore")  # una columna nueva en la tabla no rompe la lectura

    id: UUID
    correo: str
    clave_hash: str
    correo_confirmado: bool
    politica_aceptada_en: AwareDatetime
    politica_version: str
    creada_en: AwareDatetime


def cuenta_de_filas(datos: object) -> Cuenta | None:
    filas = lista_de_filas(datos)
    if not filas:
        return None
    try:
        # Una fila que no es un objeto (por ejemplo None) no es «no hay cuenta»: es una respuesta mal formada
        leida = _FilaCuenta.model_validate(filas[0])
    except ValidationError:
        # El mensaje de pydantic repite los valores recibidos (un correo, un hash): no se conserva
        raise ErrorDeBaseDeDatos("fila_invalida") from None
    return Cuenta(
        id=leida.id,
        correo=leida.correo,
        clave_hash=leida.clave_hash,
        correo_confirmado=leida.correo_confirmado,
        politica_aceptada_en=leida.politica_aceptada_en,
        politica_version=leida.politica_version,
        creada_en=leida.creada_en,
    )


def parametros_de_cuenta(cuenta: Cuenta) -> dict[str, Any]:
    """Los argumentos de la función SQL `crear_cuenta`."""
    return {
        "p_id": str(cuenta.id),
        "p_correo": cuenta.correo,
        "p_clave_hash": cuenta.clave_hash,
        "p_correo_confirmado": cuenta.correo_confirmado,
        "p_politica_aceptada_en": cuenta.politica_aceptada_en.isoformat(),
        "p_politica_version": cuenta.politica_version,
        "p_creada_en": cuenta.creada_en.isoformat(),
    }
