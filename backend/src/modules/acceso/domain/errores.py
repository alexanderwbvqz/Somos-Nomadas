"""Errores de dominio de `acceso`. La capa de la API los traduce a códigos HTTP; el dominio no sabe de HTTP."""

from modules.acceso.domain.cuenta import ErroresCampos


class ErrorDeAcceso(Exception):
    """Base de los errores de este módulo."""


class DatosInvalidos(ErrorDeAcceso):
    def __init__(self, campos: ErroresCampos) -> None:
        super().__init__("Datos inválidos")
        self.campos = campos


class CredencialesInvalidas(ErrorDeAcceso):
    """Correo o clave no corresponden. Nunca dice cuál de los dos falla."""


class CorreoSinConfirmar(ErrorDeAcceso):
    """La clave es correcta, pero el correo aún no se confirmó y la confirmación es obligatoria."""


class NoAutenticado(ErrorDeAcceso):
    """Falta el token, o es inválido, caducado, revocado o ya usado."""


class LimiteExcedido(ErrorDeAcceso):
    def __init__(self, reintentar_en_segundos: int) -> None:
        super().__init__("Demasiados intentos")
        self.reintentar_en_segundos = reintentar_en_segundos
