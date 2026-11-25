from uuid import UUID

from supabase import Client

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.infrastructure.mappers.cuenta_mapper import COLUMNAS_CUENTA, cuenta_de_filas, parametros_de_cuenta
from shared.supabase.errores import ErrorDeBaseDeDatos, traducir_errores


class SupabaseCuentaRepository:
    """Cuentas en la tabla `cuentas`. Recibe el cliente ya hecho: no lee la clave ni el `.env`."""

    def __init__(self, cliente: Client) -> None:
        self._cliente = cliente

    def crear(self, cuenta: Cuenta) -> bool:
        # Una función SQL decide de forma atómica si el correo ya existía (insert ... on conflict do nothing)
        with traducir_errores():
            respuesta = self._cliente.rpc("crear_cuenta", parametros_de_cuenta(cuenta)).execute()
        if not isinstance(respuesta.data, bool):
            raise ErrorDeBaseDeDatos("respuesta_inesperada")
        return respuesta.data

    def obtener_por_correo(self, correo: str) -> Cuenta | None:
        # Una función SQL (POST con cuerpo) en vez de `.eq("correo", ...)`: así el correo no va en la URL
        with traducir_errores():
            respuesta = self._cliente.rpc("obtener_cuenta_por_correo", {"p_correo": correo}).execute()
        return cuenta_de_filas(respuesta.data)

    def obtener_por_id(self, cuenta_id: UUID) -> Cuenta | None:
        with traducir_errores():
            respuesta = (
                self._cliente.table("cuentas").select(*COLUMNAS_CUENTA).eq("id", str(cuenta_id)).limit(1).execute()
            )
        return cuenta_de_filas(respuesta.data)
