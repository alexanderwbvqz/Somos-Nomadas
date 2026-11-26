from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime

from modules.acceso.application.abrir_sesion import abrir_sesion
from modules.acceso.application.exigir_limite import exigir_limite
from modules.acceso.application.registrar_cuenta import huella_del_navegador
from modules.acceso.domain.confirmacion import es_el_mismo_navegador, tiene_forma_de_token
from modules.acceso.domain.confirmacion_repository import ConfirmacionRepository
from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.errores import EnlaceInvalido
from modules.acceso.domain.intentos import CONFIRMACION_POR_ORIGEN
from modules.acceso.domain.limitador_intentos import LimitadorIntentos
from modules.acceso.domain.sesion import ParDeTokens
from modules.acceso.domain.sesion_repository import SesionRepository


@dataclass(frozen=True)
class CorreoConfirmado:
    correo: str
    # La sesión abierta, si el enlace se abrió en el mismo navegador que lo pidió; None si no
    tokens: ParDeTokens | None = field(repr=False)


class ConfirmarCorreo:
    """Usa el enlace del correo: si vale, confirma el correo de la cuenta y devuelve ese correo.

    Si además se abre en el mismo navegador que pidió el enlace (`navegador` es la marca que la web guardó allí),
    abre la sesión, igual que al iniciar sesión. En otro navegador, o con un enlace reenviado a otra persona, solo
    confirma: después se entra con el correo y la clave. Un enlace que no vale (desconocido, usado, caducado o anulado)
    da siempre el mismo error, sin decir por qué.
    """

    def __init__(
        self,
        *,
        confirmaciones: ConfirmacionRepository,
        sesiones: SesionRepository,
        emisor: EmisorTokens,
        limitador: LimitadorIntentos,
        ahora: Callable[[], datetime],
    ) -> None:
        self._confirmaciones = confirmaciones
        self._sesiones = sesiones
        self._emisor = emisor
        self._limitador = limitador
        self._ahora = ahora

    def ejecutar(self, token: str, origen: str, navegador: str | None = None) -> CorreoConfirmado:
        ahora = self._ahora()
        exigir_limite(self._limitador, "confirmacion", origen, CONFIRMACION_POR_ORIGEN, ahora)

        # Lo que no tiene forma de token no se busca: no puede ser un enlace nuestro
        if not tiene_forma_de_token(token):
            raise EnlaceInvalido("Enlace inválido")
        usado = self._confirmaciones.confirmar(self._emisor.hash_de_token_confirmacion(token), ahora)
        if usado is None:
            raise EnlaceInvalido("Enlace inválido")

        if not es_el_mismo_navegador(usado.navegador_hash, huella_del_navegador(self._emisor, navegador)):
            return CorreoConfirmado(correo=usado.correo, tokens=None)
        tokens = abrir_sesion(usado.cuenta_id, sesiones=self._sesiones, emisor=self._emisor, ahora=ahora)
        return CorreoConfirmado(correo=usado.correo, tokens=tokens)
