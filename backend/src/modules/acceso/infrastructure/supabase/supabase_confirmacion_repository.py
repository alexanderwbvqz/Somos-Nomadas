from datetime import datetime

from supabase import Client

from modules.acceso.domain.confirmacion import EnlaceNuevo
from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.infrastructure.mappers.confirmacion_mapper import (
    booleano,
    correo_confirmado,
    parametros_de_cuenta_con_confirmacion,
    parametros_de_renovacion,
)
from shared.supabase.errores import traducir_errores


class SupabaseConfirmacionRepository:
    """Enlaces de confirmación en la tabla `confirmaciones_correo`, siempre por funciones SQL (POST con cuerpo): una
    sola llamada por operación, y ni el correo ni el hash del token van en la URL."""

    def __init__(self, cliente: Client) -> None:
        self._cliente = cliente

    def crear_cuenta_con_confirmacion(self, cuenta: Cuenta, enlace: EnlaceNuevo) -> bool:
        with traducir_errores():
            respuesta = self._cliente.rpc(
                "crear_cuenta_con_confirmacion", parametros_de_cuenta_con_confirmacion(cuenta, enlace)
            ).execute()
        return booleano(respuesta.data)

    def renovar(self, correo: str, enlace: EnlaceNuevo) -> bool:
        with traducir_errores():
            respuesta = self._cliente.rpc("renovar_confirmacion", parametros_de_renovacion(correo, enlace)).execute()
        return booleano(respuesta.data)

    def confirmar(self, token_hash: str, ahora: datetime) -> str | None:
        with traducir_errores():
            respuesta = self._cliente.rpc(
                "confirmar_correo", {"p_token_hash": token_hash, "p_ahora": ahora.isoformat()}
            ).execute()
        return correo_confirmado(respuesta.data)
