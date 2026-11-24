from datetime import datetime

from modules.acceso.domain.errores import LimiteExcedido
from modules.acceso.domain.intentos import PoliticaIntentos
from modules.acceso.domain.limitador_intentos import AccionLimitada, LimitadorIntentos


def exigir_limite(
    limitador: LimitadorIntentos, accion: AccionLimitada, clave: str, politica: PoliticaIntentos, ahora: datetime
) -> None:
    """Cuenta un intento y, si ya se superó el máximo de la ventana, lanza LimiteExcedido con la espera."""
    espera = limitador.consumir(accion, clave, politica.maximo, politica.ventana_segundos, ahora)
    if espera is not None:
        raise LimiteExcedido(espera)
