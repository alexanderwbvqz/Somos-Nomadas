"""Reglas de la cuenta: crear una (registro) y entrar con ella (inicio de sesión).

Una cuenta es solo identidad: quién entra. El nombre, el país y lo demás son del perfil (otro módulo).
Las reglas son las de contrato/autenticacion.md y las mismas del dominio del frontend: el backend las vuelve a
validar porque no se fía del navegador.
"""

import unicodedata
from dataclasses import dataclass
from datetime import datetime
from typing import Final, Literal
from uuid import UUID


@dataclass(frozen=True)
class LimitesCuenta:
    correo: int = 120
    parte_local: int = 64
    clave_min: int = 8
    clave_max: int = 128


LIMITES_CUENTA: Final = LimitesCuenta()

CodigoErrorCuenta = Literal[
    "obligatorio",
    "correo_invalido",
    "clave_corta",
    "clave_larga",
    "clave_sin_minuscula",
    "clave_sin_mayuscula",
    "clave_sin_numero",
    "clave_sin_especial",
    "politica_requerida",
]

# Campo de la petición → código de error. Un campo sin problema no aparece.
ErroresCampos = dict[str, CodigoErrorCuenta]


@dataclass(frozen=True)
class DatosRegistro:
    correo: str
    clave: str
    acepta_politica: bool
    # Campo trampa (honeypot): una persona no lo ve ni lo rellena; si trae algo, es un robot
    sitio_secundario: str = ""


@dataclass(frozen=True)
class DatosInicioSesion:
    correo: str
    clave: str


@dataclass(frozen=True)
class Cuenta:
    id: UUID
    correo: str
    clave_hash: str
    correo_confirmado: bool
    politica_aceptada_en: datetime
    politica_version: str
    creada_en: datetime


def normalizar_correo(correo: str) -> str:
    return correo.strip().lower()


def _tiene_caracteres_de_control_o_espacios(texto: str) -> bool:
    return any(c.isspace() or unicodedata.category(c) == "Cc" for c in texto)


def _es_correo_bien_formado(correo: str) -> bool:
    if len(correo) > LIMITES_CUENTA.correo or _tiene_caracteres_de_control_o_espacios(correo):
        return False
    if correo.count("@") != 1:
        return False
    local, dominio = correo.split("@")
    if not local or len(local) > LIMITES_CUENTA.parte_local:
        return False
    if "." not in dominio or dominio.startswith(".") or dominio.endswith(".") or ".." in dominio:
        return False
    terminacion = dominio.rsplit(".", 1)[1]
    return len(terminacion) >= 2 and terminacion.isalpha()


def _error_de_correo(correo: str) -> CodigoErrorCuenta | None:
    # Se valida ya normalizado: es lo que se guarda, y pasar a minúsculas puede alargar el texto («İ» ocupa 2)
    limpio = normalizar_correo(correo)
    if limpio == "":
        return "obligatorio"
    return None if _es_correo_bien_formado(limpio) else "correo_invalido"


def _error_de_composicion(clave: str) -> CodigoErrorCuenta | None:
    """La primera regla de composición que incumple la clave, en este orden: minúscula, mayúscula, número, especial."""
    if not any(c.islower() for c in clave):
        return "clave_sin_minuscula"
    if not any(c.isupper() for c in clave):
        return "clave_sin_mayuscula"
    if not any(c.isdecimal() for c in clave):
        return "clave_sin_numero"
    # Especial es todo lo que no es letra ni número: la ñ y las tildes son letras; el espacio es especial
    if all(c.isalnum() for c in clave):
        return "clave_sin_especial"
    return None


def validar_registro(datos: DatosRegistro) -> ErroresCampos:
    errores: ErroresCampos = {}

    error_correo = _error_de_correo(datos.correo)
    if error_correo:
        errores["correo"] = error_correo

    # La clave no se recorta: los espacios cuentan
    if len(datos.clave) < LIMITES_CUENTA.clave_min:
        errores["clave"] = "clave_corta"
    elif len(datos.clave) > LIMITES_CUENTA.clave_max:
        errores["clave"] = "clave_larga"
    else:
        error_composicion = _error_de_composicion(datos.clave)
        if error_composicion:
            errores["clave"] = error_composicion

    if not datos.acepta_politica:
        errores["acepta_politica"] = "politica_requerida"
    return errores


def validar_inicio_sesion(datos: DatosInicioSesion) -> ErroresCampos:
    """No vuelve a exigir la composición de la clave: así no se bloquean cuentas viejas si las reglas cambian."""
    errores: ErroresCampos = {}

    error_correo = _error_de_correo(datos.correo)
    if error_correo:
        errores["correo"] = error_correo

    if datos.clave == "":
        errores["clave"] = "obligatorio"
    elif len(datos.clave) > LIMITES_CUENTA.clave_max:
        errores["clave"] = "clave_larga"
    return errores


def es_robot_registro(datos: DatosRegistro) -> bool:
    return datos.sitio_secundario.strip() != ""
