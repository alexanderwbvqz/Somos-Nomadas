from typing import Protocol

from modules.acceso.domain.confirmacion import CorreoPendiente


class CorreosDeAcceso(Protocol):
    def enviar_confirmacion(self, pendiente: CorreoPendiente) -> None:
        """Envía a `pendiente.destino` el correo con el enlace de confirmación, en su idioma.

        Falla con `CorreoNoEnviado` si no se pudo entregar al servicio de correo. Ni el error ni ningún registro
        llevan el correo de la persona ni el token.
        """
        ...
