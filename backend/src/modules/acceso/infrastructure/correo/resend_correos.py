import hashlib
from typing import Final

import httpx

from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.domain.errores import CorreoNoEnviado
from modules.acceso.infrastructure.correo.plantillas import mensaje_de_confirmacion

URL_RESEND: Final = "https://api.resend.com/emails"
ESPERA_MAXIMA_SEGUNDOS: Final = 10.0


class _Secreto:
    """Guarda la clave sin que salga al imprimir el objeto (ni en `repr` ni en `vars`)."""

    def __init__(self, valor: str) -> None:
        self._valor = valor

    def __repr__(self) -> str:
        return "_Secreto('**********')"

    def valor(self) -> str:
        return self._valor


class ResendCorreos:
    """Envía los correos con la API de Resend, por HTTPS (Render gratis bloquea SMTP). Recibe el cliente HTTP ya
    creado: no lee la configuración ni el `.env`; eso es de `composition/`."""

    def __init__(self, cliente: httpx.Client, *, clave: str, remitente: str, url_web: str) -> None:
        self._cliente = cliente
        self._clave = _Secreto(clave)
        self._remitente = remitente
        self._url_web = url_web

    def enviar_confirmacion(self, pendiente: CorreoPendiente) -> None:
        mensaje = mensaje_de_confirmacion(self._url_web, pendiente)
        # El mismo correo (mismo token) da la misma clave: si se reintentara, Resend lo entrega una sola vez. Se deriva
        # del token con un prefijo propio, así no coincide con el hash que se guarda en la base
        idempotencia = hashlib.sha256(f"nomadas-confirmacion:{pendiente.token}".encode()).hexdigest()
        try:
            respuesta = self._cliente.post(
                URL_RESEND,
                json={
                    "from": self._remitente,
                    "to": [pendiente.destino],
                    "subject": mensaje.asunto,
                    "html": mensaje.html,
                    "text": mensaje.texto,
                },
                headers={"Authorization": f"Bearer {self._clave.valor()}", "Idempotency-Key": idempotencia},
                timeout=ESPERA_MAXIMA_SEGUNDOS,
            )
        except httpx.HTTPError:
            # El error de httpx puede llevar la petición (con el correo y la clave en las cabeceras): no se encadena
            raise CorreoNoEnviado("sin_conexion") from None
        if not respuesta.is_success:
            raise CorreoNoEnviado(f"resend_{respuesta.status_code}")
