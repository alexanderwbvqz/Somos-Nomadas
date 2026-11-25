"""Política de límite de intentos: cuántos y en qué ventana. Los valores son una primera propuesta.

Lo que bloquea rápido no puede ser un límite solo por correo: cualquiera podría gastar los intentos con el correo
de otra persona y dejarla fuera. Por eso el bloqueo rápido es por PAREJA (correo, origen): quien ataca desde su
equipo solo se bloquea a sí mismo. Un techo por correo, mucho más holgado, impide probar claves contra una cuenta
repartiendo los intentos entre muchas IPs.
"""

from dataclasses import dataclass
from typing import Final


@dataclass(frozen=True)
class PoliticaIntentos:
    maximo: int
    ventana_segundos: int


REGISTRO_POR_ORIGEN: Final = PoliticaIntentos(maximo=5, ventana_segundos=60 * 60)

# Inicio de sesión: se aplican los tres en este orden; un intento bloqueado por uno no gasta el cupo de los siguientes
# Cualquier correo desde un origen
SESION_POR_ORIGEN: Final = PoliticaIntentos(maximo=20, ventana_segundos=15 * 60)
# Un correo desde un origen
SESION_POR_CORREO_Y_ORIGEN: Final = PoliticaIntentos(maximo=5, ventana_segundos=15 * 60)
# Un correo desde cualquier origen
SESION_POR_CORREO_TOTAL: Final = PoliticaIntentos(maximo=100, ventana_segundos=60 * 60)

# Reenviar el enlace de confirmación (decidido por el dueño). El límite por correo evita que alguien llene de correos
# el buzón de otra persona; el precio es que ese alguien puede gastar los 3 reenvíos de la hora de otra.
REENVIO_POR_ORIGEN: Final = PoliticaIntentos(maximo=10, ventana_segundos=60 * 60)
REENVIO_POR_CORREO: Final = PoliticaIntentos(maximo=3, ventana_segundos=60 * 60)

# Usar un enlace: con tokens de 256 bits adivinar es imposible, pero no se deja probar a ciegas sin freno
CONFIRMACION_POR_ORIGEN: Final = PoliticaIntentos(maximo=20, ventana_segundos=15 * 60)
