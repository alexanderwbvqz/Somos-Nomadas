from modules.acceso.domain.confirmacion import CorreoPendiente


class CorreosEnMemoria:
    """Doble de prueba: anota los correos en vez de enviarlos."""

    def __init__(self) -> None:
        self.enviados: list[CorreoPendiente] = []

    def enviar_confirmacion(self, pendiente: CorreoPendiente) -> None:
        self.enviados.append(pendiente)
