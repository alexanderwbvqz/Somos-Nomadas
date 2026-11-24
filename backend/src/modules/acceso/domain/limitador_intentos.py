from datetime import datetime
from typing import Literal, Protocol

AccionLimitada = Literal["registro", "sesion"]


class LimitadorIntentos(Protocol):
    def consumir(
        self, accion: AccionLimitada, clave: str, maximo: int, ventana_segundos: int, ahora: datetime
    ) -> int | None:
        """Cuenta un intento de `clave` (un correo o un origen) en la ventana, de forma atómica.

        Devuelve None si el intento está permitido, o los segundos que faltan para poder reintentar si ya se
        superó el máximo. Quien lo implementa guarda un hash de `clave`, nunca el valor en claro.
        """
        ...
