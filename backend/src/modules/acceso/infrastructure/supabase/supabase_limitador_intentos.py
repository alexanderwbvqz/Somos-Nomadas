import hashlib
import hmac
from datetime import datetime

from supabase import Client

from modules.acceso.domain.limitador_intentos import AccionLimitada
from shared.supabase.errores import ErrorDeBaseDeDatos, traducir_errores

LARGO_MINIMO_SECRETO = 32


class SupabaseLimitadorIntentos:
    """Cuenta los intentos en la tabla `intentos_acceso` mediante la función SQL `consumir_intento`.

    Lo que se guarda es un HMAC de la clave (un correo o una IP), nunca el valor en claro. Una IP o un correo
    tienen pocos valores posibles: sin el secreto, un simple hash se revertiría probándolos todos.
    """

    def __init__(self, cliente: Client, secreto_de_huellas: str) -> None:
        if len(secreto_de_huellas) < LARGO_MINIMO_SECRETO:
            raise ValueError(f"El secreto de las huellas debe tener al menos {LARGO_MINIMO_SECRETO} caracteres")
        self._cliente = cliente
        self._secreto = secreto_de_huellas.encode()

    def consumir(
        self, accion: AccionLimitada, clave: str, maximo: int, ventana_segundos: int, ahora: datetime
    ) -> int | None:
        parametros = {
            "p_accion": accion,
            "p_huella": self._huella(accion, clave),
            "p_maximo": maximo,
            "p_ventana_segundos": ventana_segundos,
            "p_ahora": ahora.isoformat(),
        }
        with traducir_errores():
            respuesta = self._cliente.rpc("consumir_intento", parametros).execute()
        espera = respuesta.data
        if espera is None:
            return None
        if isinstance(espera, int) and not isinstance(espera, bool):
            return espera
        raise ErrorDeBaseDeDatos("respuesta_inesperada")

    def _huella(self, accion: AccionLimitada, clave: str) -> str:
        return hmac.new(self._secreto, f"{accion}:{clave}".encode(), hashlib.sha256).hexdigest()
