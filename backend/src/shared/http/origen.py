"""De dónde viene de verdad una petición, para contar los intentos (límites por IP).

La API la llama el servidor de Next, no el navegador de la persona. Si el backend usara la IP de la conexión, todo
el sitio compartiría una sola IP (la de Next) y sus límites se agotarían entre las propias personas. Por eso Next
reenvía la IP real en una cabecera, junto con un secreto compartido.

La cabecera solo se acepta si el secreto es correcto: de lo contrario cualquiera podría elegir con qué IP lo cuentan
y saltarse los límites. Sin secreto, o con uno incorrecto, se ignora en silencio y se usa la IP de la conexión.
"""

import hmac
import ipaddress
from collections.abc import Callable
from typing import Final

from starlette.requests import Request

CABECERA_ORIGEN: Final = "x-origen-cliente"
CABECERA_SECRETO: Final = "x-secreto-interno"

_LONGITUD_DE_PREFIJO_IPV6: Final = 64


def _normalizar(texto: str) -> str | None:
    """La IP en su forma canónica, o None si no es una IP.

    Una IPv4 escrita como IPv6 vale como la IPv4. Las IPv6 se agrupan por su prefijo de 64 bits: una persona con IPv6
    controla un /64 entero (2^64 direcciones), y si se contara cada una por separado el límite no valdría nada.
    """
    try:
        ip = ipaddress.ip_address(texto)
    except ValueError:
        return None
    if isinstance(ip, ipaddress.IPv6Address):
        if ip.ipv4_mapped is not None:
            return str(ip.ipv4_mapped)
        return str(ipaddress.IPv6Network((ip.packed, _LONGITUD_DE_PREFIJO_IPV6), strict=False))
    return str(ip)


def _de_la_conexion(peticion: Request) -> str:
    if peticion.client is None:
        return "desconocido"
    return _normalizar(peticion.client.host) or peticion.client.host


def _reenviada(peticion: Request, secreto: bytes) -> str | None:
    if not secreto:
        return None  # sin secreto configurado (desarrollo) nunca se confía en la cabecera
    recibido = peticion.headers.get(CABECERA_SECRETO)
    if recibido is None:
        return None
    # Comparación en tiempo constante: no se puede averiguar el secreto midiendo cuánto tarda en responder
    if not hmac.compare_digest(recibido.encode("latin-1", "replace"), secreto):
        return None
    ip = peticion.headers.get(CABECERA_ORIGEN)
    return _normalizar(ip.strip()) if ip is not None else None


def crear_resolutor_de_origen(secreto_interno: str) -> Callable[[Request], str]:
    """La función que da el origen de una petición: la IP reenviada (con el secreto correcto) o la de la conexión."""
    secreto = secreto_interno.encode()

    def origen_de(peticion: Request) -> str:
        return _reenviada(peticion, secreto) or _de_la_conexion(peticion)

    return origen_de
