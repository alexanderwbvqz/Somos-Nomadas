import math
from datetime import datetime, timedelta

from modules.acceso.domain.limitador_intentos import AccionLimitada


class MemoriaLimitadorIntentos:
    """Cuenta los intentos en memoria. Sirve para probar los casos de uso sin base de datos."""

    def __init__(self) -> None:
        self._intentos: dict[tuple[AccionLimitada, str], list[datetime]] = {}

    def consumir(
        self, accion: AccionLimitada, clave: str, maximo: int, ventana_segundos: int, ahora: datetime
    ) -> int | None:
        ventana = timedelta(seconds=ventana_segundos)
        recientes = [t for t in self._intentos.get((accion, clave), []) if ahora - t < ventana]
        if len(recientes) >= maximo:
            self._intentos[(accion, clave)] = recientes
            faltan = (recientes[0] + ventana - ahora).total_seconds()
            return max(1, math.ceil(faltan))
        recientes.append(ahora)
        self._intentos[(accion, clave)] = recientes
        return None
