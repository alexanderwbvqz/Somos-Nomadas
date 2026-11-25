from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.domain.errores import CorreoNoEnviado


class CorreosEnMemoria:
    """Doble de prueba: anota los correos en vez de enviarlos, y se le puede pedir que falle como lo haría Resend."""

    def __init__(self, *, fallar: bool = False) -> None:
        self.enviados: list[CorreoPendiente] = []
        self.fallar = fallar

    def enviar_confirmacion(self, pendiente: CorreoPendiente) -> None:
        if self.fallar:
            raise CorreoNoEnviado("resend_503")
        self.enviados.append(pendiente)
