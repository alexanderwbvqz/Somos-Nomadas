from datetime import datetime
from typing import Protocol

from modules.acceso.domain.confirmacion import EnlaceNuevo, EnlaceUsado
from modules.acceso.domain.cuenta import Cuenta


class ConfirmacionRepository(Protocol):
    """Los enlaces de confirmación del correo. Cada operación es atómica y hace un solo viaje a la base, exista o no
    la cuenta: así el tiempo de respuesta no delata qué correos están registrados."""

    def crear_cuenta_con_confirmacion(self, cuenta: Cuenta, enlace: EnlaceNuevo) -> bool:
        """Guarda la cuenta (sin confirmar) y su primer enlace. False, sin cambiar nada, si el correo ya tenía
        cuenta."""
        ...

    def renovar(self, correo: str, enlace: EnlaceNuevo) -> bool:
        """Si la cuenta de `correo` existe y no está confirmada, anula sus enlaces vigentes y guarda `enlace`: True.
        Si no existe o ya está confirmada, no cambia nada: False. El correo ya viene normalizado."""
        ...

    def confirmar(self, token_hash: str, ahora: datetime) -> EnlaceUsado | None:
        """Si el enlace existe, no se usó, no se anuló y no caducó, lo marca usado y confirma el correo de su cuenta.
        Devuelve la cuenta, su correo y la huella del navegador que pidió el enlace, o None si el enlace no vale (sin
        decir por qué)."""
        ...
