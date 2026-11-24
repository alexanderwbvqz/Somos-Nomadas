import pytest

from modules.acceso.domain.cuenta import (
    LIMITES_CUENTA,
    DatosInicioSesion,
    DatosRegistro,
    es_robot_registro,
    normalizar_correo,
    validar_inicio_sesion,
    validar_registro,
)

CLAVE_BUENA = "Clave-segura1"


def registro(**cambios: object) -> DatosRegistro:
    base = {"correo": "ana@correo.com", "clave": CLAVE_BUENA, "acepta_politica": True, "sitio_secundario": ""}
    return DatosRegistro(**{**base, **cambios})  # type: ignore[arg-type]


def test_un_registro_correcto_no_tiene_errores() -> None:
    assert validar_registro(registro()) == {}


# --- Correo ---


@pytest.mark.parametrize(
    "correo",
    [
        "ana@correo.com",
        "ana.perez+etiqueta@empresa.com.ar",
        "a@b.co",
        "  ana@correo.com  ",  # los espacios de los extremos se recortan
        "ana@dominio-raro.io",
        "ANA@CORREO.COM",
    ],
)
def test_correos_validos_de_cualquier_dominio(correo: str) -> None:
    assert "correo" not in validar_registro(registro(correo=correo))


@pytest.mark.parametrize("correo", ["", "   "])
def test_correo_vacio_es_obligatorio(correo: str) -> None:
    assert validar_registro(registro(correo=correo))["correo"] == "obligatorio"


@pytest.mark.parametrize(
    "correo",
    [
        "sin-arroba.com",
        "dos@@correo.com",
        "a@b@correo.com",
        "ana@",
        "@correo.com",
        "ana@correo",  # sin punto en el dominio
        "ana@correo.c",  # terminación de una sola letra
        "ana@correo.c0m",  # la terminación son letras
        "ana@.correo.com",
        "ana@correo.com.",
        "ana@correo..com",
        "ana perez@correo.com",
        "ana@cor reo.com",
        "ana\n@correo.com",
        "ana@correo.com\r\nBcc: otro@correo.com",
        "ana\x00@correo.com",
    ],
)
def test_correos_invalidos(correo: str) -> None:
    assert validar_registro(registro(correo=correo))["correo"] == "correo_invalido"


def test_la_parte_local_admite_64_caracteres_y_no_65() -> None:
    assert "correo" not in validar_registro(registro(correo="a" * 64 + "@correo.com"))
    assert validar_registro(registro(correo="a" * 65 + "@correo.com"))["correo"] == "correo_invalido"


def test_el_correo_admite_120_caracteres_y_no_121() -> None:
    exacto = "a" * 40 + "@" + "d" * (LIMITES_CUENTA.correo - 41 - 4) + ".com"
    assert len(exacto) == LIMITES_CUENTA.correo
    assert "correo" not in validar_registro(registro(correo=exacto))
    assert validar_registro(registro(correo=exacto + "m"))["correo"] == "correo_invalido"


def test_normalizar_correo_recorta_y_pasa_a_minusculas() -> None:
    assert normalizar_correo("  Ana@Correo.COM ") == "ana@correo.com"


# --- Contraseña ---


def test_clave_corta() -> None:
    assert validar_registro(registro(clave="Ab1!xyz"))["clave"] == "clave_corta"


def test_clave_de_8_caracteres_con_todo_es_valida() -> None:
    assert "clave" not in validar_registro(registro(clave="Ab1!xyzw"))


def test_clave_larga() -> None:
    clave = "Aa1!" + "x" * (LIMITES_CUENTA.clave_max - 4)
    assert "clave" not in validar_registro(registro(clave=clave))
    assert validar_registro(registro(clave=clave + "x"))["clave"] == "clave_larga"


@pytest.mark.parametrize(
    ("clave", "codigo"),
    [
        ("CLAVE-SEGURA1", "clave_sin_minuscula"),
        ("clave-segura1", "clave_sin_mayuscula"),
        ("Clave-segura-", "clave_sin_numero"),
        ("Clavesegura12", "clave_sin_especial"),
    ],
)
def test_cada_regla_de_composicion(clave: str, codigo: str) -> None:
    assert validar_registro(registro(clave=clave))["clave"] == codigo


def test_si_fallan_varias_reglas_se_informa_la_primera_en_orden() -> None:
    # Sin minúscula, sin número y sin especial: gana la minúscula
    assert validar_registro(registro(clave="CLAVESEGURA"))["clave"] == "clave_sin_minuscula"
    # Con minúscula pero sin mayúscula, número ni especial: gana la mayúscula
    assert validar_registro(registro(clave="clavesegura"))["clave"] == "clave_sin_mayuscula"


def test_la_enie_y_las_tildes_cuentan_como_letras_no_como_especiales() -> None:
    assert validar_registro(registro(clave="Ñandú1ñandú"))["clave"] == "clave_sin_especial"


def test_un_espacio_cuenta_como_caracter_especial_y_no_se_recorta() -> None:
    assert "clave" not in validar_registro(registro(clave="Clave segura1"))
    # 7 visibles + un espacio al final = 8: si se recortara, sería «clave_corta»
    assert "clave" not in validar_registro(registro(clave="Abcdef1 "))


def test_el_superindice_no_cuenta_como_numero() -> None:
    assert validar_registro(registro(clave="Clave-segura²"))["clave"] == "clave_sin_numero"


# --- Política y varios errores a la vez ---


def test_la_politica_es_obligatoria() -> None:
    assert validar_registro(registro(acepta_politica=False))["acepta_politica"] == "politica_requerida"


def test_se_informan_todos_los_campos_con_error() -> None:
    errores = validar_registro(registro(correo="", clave="x", acepta_politica=False))
    assert errores == {"correo": "obligatorio", "clave": "clave_corta", "acepta_politica": "politica_requerida"}


# --- Honeypot ---


def test_un_campo_trampa_relleno_delata_a_un_robot() -> None:
    assert es_robot_registro(registro(sitio_secundario="http://spam.com"))
    assert not es_robot_registro(registro(sitio_secundario=""))
    assert not es_robot_registro(registro(sitio_secundario="   "))


# --- Inicio de sesión: no vuelve a exigir la composición ---


def test_el_inicio_de_sesion_no_exige_la_composicion_de_la_clave() -> None:
    assert validar_inicio_sesion(DatosInicioSesion(correo="ana@correo.com", clave="corta")) == {}


def test_el_inicio_de_sesion_exige_correo_y_clave() -> None:
    errores = validar_inicio_sesion(DatosInicioSesion(correo="", clave=""))
    assert errores == {"correo": "obligatorio", "clave": "obligatorio"}


def test_el_inicio_de_sesion_rechaza_correo_mal_formado_y_clave_enorme() -> None:
    errores = validar_inicio_sesion(DatosInicioSesion(correo="nada", clave="x" * (LIMITES_CUENTA.clave_max + 1)))
    assert errores == {"correo": "correo_invalido", "clave": "clave_larga"}
