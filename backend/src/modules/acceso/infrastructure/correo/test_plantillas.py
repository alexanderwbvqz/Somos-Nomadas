from typing import get_args

import pytest

from modules.acceso.domain.confirmacion import CorreoPendiente, Idioma
from modules.acceso.infrastructure.correo.plantillas import enlace_de_confirmacion, mensaje_de_confirmacion

URL_WEB = "https://somosnomadas.app"
TOKEN = "kVmM4x6ra2TdRrgU23duyfSBxrvhOwiN71QK2GzTuZ8"
IDIOMAS: tuple[Idioma, ...] = get_args(Idioma)


def pendiente(idioma: Idioma = "es", destino: str = "ana@correo.com") -> CorreoPendiente:
    return CorreoPendiente(destino=destino, token=TOKEN, idioma=idioma)


def test_el_enlace_lleva_el_idioma_y_el_token_despues_de_la_almohadilla() -> None:
    # Tras «#» el navegador no manda el token al servidor al pedir la página: no queda en ningún registro
    assert enlace_de_confirmacion(URL_WEB, "pt", TOKEN) == f"https://somosnomadas.app/pt/confirmar-correo#token={TOKEN}"


def test_la_barra_final_de_la_direccion_no_duplica_la_barra() -> None:
    assert enlace_de_confirmacion(URL_WEB + "/", "es", TOKEN).startswith("https://somosnomadas.app/es/")


@pytest.mark.parametrize("idioma", IDIOMAS)
def test_cada_idioma_tiene_asunto_html_y_texto_con_el_enlace(idioma: Idioma) -> None:
    mensaje = mensaje_de_confirmacion(URL_WEB, pendiente(idioma))
    enlace = enlace_de_confirmacion(URL_WEB, idioma, TOKEN)

    assert mensaje.asunto.strip() != ""
    assert enlace in mensaje.texto
    assert f'href="{enlace}"' in mensaje.html
    assert "24" in mensaje.texto and "24" in mensaje.html  # dice cuánto dura
    assert f'lang="{idioma}"' in mensaje.html


def test_los_tres_idiomas_dicen_cosas_distintas() -> None:
    asuntos = {mensaje_de_confirmacion(URL_WEB, pendiente(i)).asunto for i in IDIOMAS}

    assert len(asuntos) == 3


def test_en_espanol_explica_para_que_es_y_que_hacer_si_no_fuiste_tu() -> None:
    mensaje = mensaje_de_confirmacion(URL_WEB, pendiente("es"))

    assert "Confirma tu correo" in mensaje.asunto
    assert "Confirmar mi correo" in mensaje.html
    assert "ignora este correo" in mensaje.texto


def test_el_token_solo_aparece_dentro_del_enlace() -> None:
    mensaje = mensaje_de_confirmacion(URL_WEB, pendiente())
    enlace = enlace_de_confirmacion(URL_WEB, "es", TOKEN)

    assert TOKEN not in mensaje.asunto
    assert mensaje.texto.count(TOKEN) == mensaje.texto.count(enlace) >= 1
    assert mensaje.html.count(TOKEN) == mensaje.html.count(enlace) >= 1


def test_no_lleva_el_correo_de_la_persona_ni_seguimiento() -> None:
    mensaje = mensaje_de_confirmacion(URL_WEB, pendiente(destino="ana@correo.com"))

    assert "ana@correo.com" not in mensaje.asunto + mensaje.html + mensaje.texto
    # Sin imágenes (los píxeles de seguimiento son imágenes) ni recursos de terceros
    assert "<img" not in mensaje.html.lower()
    assert "http" not in mensaje.html.replace(enlace_de_confirmacion(URL_WEB, "es", TOKEN), "")


def test_la_direccion_de_la_web_se_escapa_en_el_html() -> None:
    mensaje = mensaje_de_confirmacion('https://somosnomadas.app/"><script>', pendiente())

    assert "<script>" not in mensaje.html
    # Las comillas no pueden cerrar el atributo href: llegan escapadas
    assert '"><script' not in mensaje.html
    assert "&quot;&gt;&lt;script&gt;" in mensaje.html
