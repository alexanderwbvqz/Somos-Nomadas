from datetime import datetime
from uuid import UUID

from supabase import Client

from modules.acceso.domain.sesion import MotivoRevocacion, Sesion
from modules.acceso.infrastructure.mappers.sesion_mapper import (
    COLUMNAS_SESION,
    fila_de_sesion,
    parametros_de_rotacion,
    sesion_de_filas,
)
from shared.supabase.errores import ErrorDeBaseDeDatos, traducir_errores


class SupabaseSesionRepository:
    """Sesiones en la tabla `sesiones`. Las operaciones que deben ser atómicas son funciones SQL."""

    def __init__(self, cliente: Client) -> None:
        self._cliente = cliente

    def guardar(self, sesion: Sesion) -> None:
        with traducir_errores():
            self._cliente.table("sesiones").insert(fila_de_sesion(sesion)).execute()

    def obtener_por_token_hash(self, token_hash: str) -> Sesion | None:
        with traducir_errores():
            respuesta = (
                self._cliente.table("sesiones").select(*COLUMNAS_SESION).eq("token_hash", token_hash).limit(1).execute()
            )
        return sesion_de_filas(respuesta.data)

    def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
        # Revocar la anterior y guardar la nueva ocurre en una sola transacción, dentro de la función SQL
        with traducir_errores():
            respuesta = self._cliente.rpc("rotar_sesion", parametros_de_rotacion(anterior, nueva)).execute()
        if not isinstance(respuesta.data, bool):
            raise ErrorDeBaseDeDatos("respuesta_inesperada")
        return respuesta.data

    def revocar(self, sesion_id: UUID, ahora: datetime) -> None:
        parametros = {"p_sesion_id": str(sesion_id), "p_ahora": ahora.isoformat()}
        with traducir_errores():
            self._cliente.rpc("revocar_sesion", parametros).execute()

    def revocar_todas_de_cuenta(self, cuenta_id: UUID, motivo: MotivoRevocacion, ahora: datetime) -> None:
        parametros = {"p_cuenta_id": str(cuenta_id), "p_motivo": motivo, "p_ahora": ahora.isoformat()}
        with traducir_errores():
            self._cliente.rpc("revocar_sesiones_de_cuenta", parametros).execute()
