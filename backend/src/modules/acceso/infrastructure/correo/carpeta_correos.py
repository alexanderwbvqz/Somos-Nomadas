import json
import os
import time
from pathlib import Path
from uuid import uuid4

from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.infrastructure.correo.plantillas import enlace_de_confirmacion, mensaje_de_confirmacion


class CarpetaCorreos:
    """Solo desarrollo y pruebas (la configuración lo prohíbe en producción): en vez de enviar, escribe cada correo como
    un archivo JSON en `carpeta`. Ahí se puede abrir el enlace a mano, y el test de punta a punta lo lee de ahí.

    Los archivos llevan el correo de la persona y el token: la carpeta está fuera de Git y es solo de quien desarrolla.
    """

    def __init__(self, carpeta: Path, *, url_web: str, remitente: str) -> None:
        self._carpeta = carpeta
        self._url_web = url_web
        self._remitente = remitente

    def enviar_confirmacion(self, pendiente: CorreoPendiente) -> None:
        mensaje = mensaje_de_confirmacion(self._url_web, pendiente)
        contenido = {
            "de": self._remitente,
            "para": pendiente.destino,
            "asunto": mensaje.asunto,
            "enlace": enlace_de_confirmacion(self._url_web, pendiente.idioma, pendiente.token),
            "texto": mensaje.texto,
            "html": mensaje.html,
        }
        self._carpeta.mkdir(parents=True, exist_ok=True)
        # El nombre empieza por la hora en nanosegundos: ordenar los archivos por nombre es ordenarlos por envío
        nombre = f"{time.time_ns():020d}-{uuid4().hex[:8]}"
        temporal = self._carpeta / f"{nombre}.tmp"
        temporal.write_text(json.dumps(contenido, ensure_ascii=False, indent=2), encoding="utf-8")
        # Renombrar es atómico: quien lea la carpeta nunca ve un archivo a medio escribir
        os.replace(temporal, self._carpeta / f"{nombre}.json")
