"""Forma de lo que entra y sale por HTTP. Los nombres de campo son los del contrato (contrato/autenticacion.md).

Aquí solo se comprueba la forma (tipos y tamaños máximos). Las reglas de correo y clave son del dominio, que las
aplica una sola vez; los tamaños de aquí son holgados y solo impiden que lleguen cuerpos enormes.
"""

from typing import Annotated, Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class _Entrada(BaseModel):
    # strict: «true» o 1 no valen como booleano; ignora los campos que no conoce (no se pueden colar como `id`)
    model_config = ConfigDict(strict=True, extra="ignore")


# La marca aleatoria que la web guarda en el navegador al pedir el enlace (cookie httpOnly). Su forma la comprueba el
# dominio: una marca sin forma cuenta como si no hubiera. Aquí solo el tipo y el tamaño
MarcaDelNavegador = Annotated[
    str | None,
    Field(
        max_length=500,
        description="Marca aleatoria del navegador que pide o abre el enlace: solo en ese navegador abre la sesión",
    ),
]


class RegistroEntrada(_Entrada):
    correo: str = Field(max_length=500)
    clave: str = Field(max_length=1000)
    acepta_politica: bool
    # Campo trampa (honeypot): una persona no lo ve; si trae algo, es un robot. Acepta cualquier valor y sin tope:
    # un 422 que señalara este campo le diría al robot que es una trampa. Decide la ruta, no pydantic.
    sitio_secundario: Any = ""
    # Idioma de la web desde la que se registra: en él se escribe el correo de confirmación
    idioma: Literal["es", "en", "pt"] = "es"
    navegador: MarcaDelNavegador = None


class SesionEntrada(_Entrada):
    correo: str = Field(max_length=500)
    clave: str = Field(max_length=1000)


class ConfirmacionEntrada(_Entrada):
    # El token del enlace del correo. Su forma la comprueba el dominio; aquí solo el tamaño
    token: str = Field(max_length=500)
    navegador: MarcaDelNavegador = None


class ReenvioEntrada(_Entrada):
    correo: str = Field(max_length=500)
    idioma: Literal["es", "en", "pt"] = "es"
    navegador: MarcaDelNavegador = None


class TokenRenovacionEntrada(_Entrada):
    token_renovacion: str = Field(max_length=500)


class SesionSalida(BaseModel):
    token_acceso: str
    expira_en: int = Field(description="Segundos que dura el token de acceso")
    token_renovacion: str
    correo: str


class TokensSalida(BaseModel):
    token_acceso: str
    expira_en: int = Field(description="Segundos que dura el token de acceso")
    token_renovacion: str


class ConfirmacionSalida(BaseModel):
    correo: str
    sesion: TokensSalida | None = Field(
        default=None,
        description="Solo si el enlace se abrió en el mismo navegador que lo pidió: la sesión ya abierta",
    )


class CuentaSalida(BaseModel):
    id: UUID
    correo: str
    correo_confirmado: bool


class ErrorSalida(BaseModel):
    codigo: str
    campos: dict[str, str] | None = Field(default=None, description="Solo en `datos_invalidos`: campo → código")
