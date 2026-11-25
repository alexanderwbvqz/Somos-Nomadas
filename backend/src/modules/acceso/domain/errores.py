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


class EnlaceInvalido(ErrorDeAcceso):
    """El enlace de confirmación no existe, ya se usó, caducó o se anuló al pedir otro. Nunca dice cuál."""


class CorreoNoEnviado(ErrorDeAcceso):
    """El servicio de correo no aceptó el envío. `motivo` es un código corto, sin datos de la persona."""

    def __init__(self, motivo: str) -> None:
        super().__init__(f"No se pudo enviar el correo: {motivo}")
        self.motivo = motivo


class LimiteExcedido(ErrorDeAcceso):
    def __init__(self, reintentar_en_segundos: int) -> None:
        super().__init__("Demasiados intentos")
        self.reintentar_en_segundos = reintentar_en_segundos
