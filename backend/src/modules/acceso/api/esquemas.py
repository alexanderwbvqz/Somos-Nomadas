"""Forma de lo que entra y sale por HTTP. Los nombres de campo son los del contrato (contrato/autenticacion.md).

Aquí solo se comprueba la forma (tipos y tamaños máximos). Las reglas de correo y clave son del dominio, que las
aplica una sola vez; los tamaños de aquí son holgados y solo impiden que lleguen cuerpos enormes.
"""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class _Entrada(BaseModel):
    # strict: «true» o 1 no valen como booleano; ignora los campos que no conoce (no se pueden colar como `id`)
    model_config = ConfigDict(strict=True, extra="ignore")


class RegistroEntrada(_Entrada):
    correo: str = Field(max_length=500)
    clave: str = Field(max_length=1000)
    acepta_politica: bool
    # Campo trampa (honeypot): una persona no lo ve; si trae algo, es un robot
    sitio_secundario: str = Field(default="", max_length=500)


class SesionEntrada(_Entrada):
    correo: str = Field(max_length=500)
    clave: str = Field(max_length=1000)


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


class CuentaSalida(BaseModel):
    id: UUID
    correo: str
    correo_confirmado: bool


class ErrorSalida(BaseModel):
    codigo: str
    campos: dict[str, str] | None = Field(default=None, description="Solo en `datos_invalidos`: campo → código")
