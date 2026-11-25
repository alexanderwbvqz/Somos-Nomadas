import json
from pathlib import Path

from modules.acceso.domain.confirmacion import CorreoPendiente
from modules.acceso.domain.correos_de_acceso import CorreosDeAcceso
from modules.acceso.infrastructure.correo.carpeta_correos import CarpetaCorreos
from modules.acceso.infrastructure.correo.plantillas import enlace_de_confirmacion

URL_WEB = "http://localhost:3000"
REMITENTE = "Somos Nómadas <hola@somosnomadas.app>"
TOKEN = "token-de-prueba-0123456789-abcdef"


def leer(carpeta: Path) -> list[dict[str, str]]:
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(carpeta.glob("*.json"))]


def test_cumple_el_puerto_y_escribe_un_archivo_por_correo_con_el_enlace(tmp_path: Path) -> None:
    carpeta = tmp_path / "correos"  # no existe todavía: se crea
    correos: CorreosDeAcceso = CarpetaCorreos(carpeta, url_web=URL_WEB, remitente=REMITENTE)

    correos.enviar_confirmacion(CorreoPendiente("ana@correo.com", TOKEN, "en"))
    correos.enviar_confirmacion(CorreoPendiente("luis@correo.com", TOKEN + "x", "es"))

    primero, segundo = leer(carpeta)
    assert primero["para"] == "ana@correo.com"
    assert primero["de"] == REMITENTE
    assert primero["enlace"] == enlace_de_confirmacion(URL_WEB, "en", TOKEN)
    assert primero["asunto"].startswith("Confirm")
    assert primero["enlace"] in primero["texto"] and primero["enlace"] in primero["html"]
    assert segundo["para"] == "luis@correo.com"


def test_los_archivos_se_ordenan_por_orden_de_envio(tmp_path: Path) -> None:
    correos = CarpetaCorreos(tmp_path, url_web=URL_WEB, remitente=REMITENTE)
    for i in range(20):
        correos.enviar_confirmacion(CorreoPendiente(f"p{i}@correo.com", f"{TOKEN}{i:02d}", "es"))

    assert [c["para"] for c in leer(tmp_path)] == [f"p{i}@correo.com" for i in range(20)]


def test_no_deja_archivos_a_medio_escribir(tmp_path: Path) -> None:
    CarpetaCorreos(tmp_path, url_web=URL_WEB, remitente=REMITENTE).enviar_confirmacion(
        CorreoPendiente("ana@correo.com", TOKEN, "es")
    )

    # Se escribe en un temporal y se renombra: quien lea la carpeta nunca ve un JSON a medias
    assert [p.suffix for p in tmp_path.iterdir()] == [".json"]
