from collections.abc import Callable
from datetime import datetime, timedelta
from uuid import uuid4

from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import NoAutenticado
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, TOLERANCIA_REUSO_SEGUNDOS, ParDeTokens, Sesion
from modules.acceso.domain.sesion_repository import SesionRepository


class RenovarSesion:
    """Cambia un token de renovación por un par nuevo. El token usado queda revocado como `rotada`.

    Qué pasa si llega un token que ya estaba revocado depende de por qué lo estaba:
    - `rotada` y presentado pasada la tolerancia: se tomó por robo y se cierran todas las sesiones de la cuenta.
    - `rotada` dentro de la tolerancia: es una carrera legítima (dos peticiones casi a la vez); solo se rechaza.
    - `cerrada` (la persona cerró sesión) o `robo`: solo se rechaza. No desconecta los demás dispositivos.
    Un token caducado también solo se rechaza.
    """

    def __init__(self, *, sesiones: SesionRepository, emisor: EmisorTokens, ahora: Callable[[], datetime]) -> None:
        self._sesiones = sesiones
        self._emisor = emisor
        self._ahora = ahora

    def ejecutar(self, token_renovacion: str) -> ParDeTokens:
        ahora = self._ahora()
        actual = self._sesiones.obtener_por_token_hash(self._emisor.hash_de_token_renovacion(token_renovacion))
        if actual is None:
            raise NoAutenticado("Sesión no válida")
        if actual.revocada_en is not None:
            self._reaccionar_a_un_token_revocado(actual, ahora)
            raise NoAutenticado("Sesión no válida")
        if ahora >= actual.expira_en:
            raise NoAutenticado("Sesión no válida")

        nuevo_token = self._emisor.nuevo_token_renovacion()
        nueva = Sesion(
            id=uuid4(),
            cuenta_id=actual.cuenta_id,
            token_hash=self._emisor.hash_de_token_renovacion(nuevo_token),
            expira_en=ahora + timedelta(days=DIAS_TOKEN_RENOVACION),
            creada_en=ahora,
        )
        if not self._sesiones.rotar(actual, nueva):
            # Otra petición rotó este mismo token entre la lectura y la rotación: es una carrera, no un robo
            raise NoAutenticado("Sesión no válida")

        acceso = self._emisor.emitir_acceso(actual.cuenta_id, ahora)
        return ParDeTokens(acceso.valor, acceso.expira_en_segundos, nuevo_token)

    def _reaccionar_a_un_token_revocado(self, sesion: Sesion, ahora: datetime) -> None:
        if sesion.motivo_revocacion != "rotada" or sesion.revocada_en is None:
            return  # cerrada por la persona, ya cerrada por robo, o sin motivo: no es señal de robo
        if ahora - sesion.revocada_en <= timedelta(seconds=TOLERANCIA_REUSO_SEGUNDOS):
            return  # carrera legítima entre dos peticiones casi simultáneas
        self._sesiones.revocar_todas_de_cuenta(sesion.cuenta_id, "robo", ahora)
