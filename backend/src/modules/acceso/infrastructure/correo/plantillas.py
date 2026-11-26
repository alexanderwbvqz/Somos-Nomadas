"""El correo con el enlace de confirmación, en los idiomas de la web. Sin imágenes, sin seguimiento y sin recursos de
terceros: solo texto y un enlace a nuestra web. Spec: contrato/confirmacion-correo.md, sección 6."""

from dataclasses import dataclass
from html import escape
from typing import Final

from modules.acceso.domain.confirmacion import MINUTOS_ENLACE_CONFIRMACION, CorreoPendiente, Idioma


@dataclass(frozen=True)
class Mensaje:
    asunto: str
    html: str
    texto: str


_TEXTOS: Final[dict[Idioma, dict[str, str]]] = {
    "es": {
        "asunto": "Confirma tu correo en Somos Nómadas",
        "saludo": "Hola:",
        "cuerpo": "Para terminar de crear tu cuenta en Somos Nómadas, confirma que este correo es tuyo.",
        "boton": "Confirmar mi correo",
        "dura": "El enlace vale {minutos} minutos y solo se puede usar una vez.",
        "copiar": "Si el botón no funciona, copia y pega este enlace en tu navegador:",
        "ignorar": "Si no creaste una cuenta en Somos Nómadas, ignora este correo: sin confirmar, nadie puede usarla.",
    },
    "en": {
        "asunto": "Confirm your email for Somos Nómadas",
        "saludo": "Hi,",
        "cuerpo": "To finish creating your Somos Nómadas account, please confirm this email address is yours.",
        "boton": "Confirm my email",
        "dura": "The link is valid for {minutos} minutes and can only be used once.",
        "copiar": "If the button doesn't work, copy and paste this link into your browser:",
        "ignorar": "If you didn't create a Somos Nómadas account, ignore this email: unconfirmed, nobody can use it.",
    },
    "pt": {
        "asunto": "Confirme seu e-mail no Somos Nómadas",
        "saludo": "Olá,",
        "cuerpo": "Para terminar de criar sua conta no Somos Nómadas, confirme que este e-mail é seu.",
        "boton": "Confirmar meu e-mail",
        "dura": "O link vale por {minutos} minutos e só pode ser usado uma vez.",
        "copiar": "Se o botão não funcionar, copie e cole este link no seu navegador:",
        "ignorar": (
            "Se você não criou uma conta no Somos Nómadas, ignore este e-mail: sem confirmar, ninguém pode usá-la."
        ),
    },
}


def enlace_de_confirmacion(url_web: str, idioma: Idioma, token: str) -> str:
    # El token va tras «#»: el navegador no lo manda al servidor al pedir la página, así no queda en ningún registro
    return f"{url_web.rstrip('/')}/{idioma}/confirmar-correo#token={token}"


def mensaje_de_confirmacion(url_web: str, pendiente: CorreoPendiente) -> Mensaje:
    t = {clave: valor.format(minutos=MINUTOS_ENLACE_CONFIRMACION) for clave, valor in _TEXTOS[pendiente.idioma].items()}
    enlace = enlace_de_confirmacion(url_web, pendiente.idioma, pendiente.token)
    texto = "\n\n".join([t["saludo"], t["cuerpo"], enlace, t["dura"], t["ignorar"]]) + "\n"
    e = escape  # todo lo que se mete en el HTML se escapa, también el enlace (va en un atributo)
    html = (
        f'<!doctype html><html lang="{pendiente.idioma}"><head><meta charset="utf-8">'
        f"<title>{e(t['asunto'])}</title></head>"
        '<body style="margin:0;padding:24px;background:#f6f3ee;font-family:Arial,sans-serif;color:#1f2a2e;">'
        '<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">'
        '<p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;">SOMOS NÓMADAS</p>'
        f'<p style="font-size:16px;line-height:1.5;">{e(t["saludo"])}</p>'
        f'<p style="font-size:16px;line-height:1.5;">{e(t["cuerpo"])}</p>'
        f'<p style="margin:28px 0;"><a href="{e(enlace)}" style="display:inline-block;background:#1f2a2e;'
        'color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold;">'
        f"{e(t['boton'])}</a></p>"
        f'<p style="font-size:14px;line-height:1.5;">{e(t["dura"])}</p>'
        f'<p style="font-size:13px;line-height:1.5;color:#5b6468;">{e(t["copiar"])}<br>'
        f'<a href="{e(enlace)}" style="color:#5b6468;word-break:break-all;">{e(enlace)}</a></p>'
        f'<p style="font-size:13px;line-height:1.5;color:#5b6468;">{e(t["ignorar"])}</p>'
        "</div></body></html>"
    )
    return Mensaje(asunto=t["asunto"], html=html, texto=texto)
