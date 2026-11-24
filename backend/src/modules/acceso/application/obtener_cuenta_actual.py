from collections.abc import Callable
from datetime import datetime

from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import NoAutenticado


class ObtenerCuentaActual:
    """La cuenta a la que pertenece un token de acceso, o NoAutenticado."""

    def __init__(self, *, cuentas: CuentaRepository, emisor: EmisorTokens, ahora: Callable[[], datetime]) -> None:
        self._cuentas = cuentas
        self._emisor = emisor
        self._ahora = ahora

    def ejecutar(self, token_acceso: str) -> Cuenta:
        cuenta_id = self._emisor.validar_acceso(token_acceso, self._ahora())
        cuenta = self._cuentas.obtener_por_id(cuenta_id) if cuenta_id is not None else None
        if cuenta is None:
            raise NoAutenticado("No autenticado")
        return cuenta
