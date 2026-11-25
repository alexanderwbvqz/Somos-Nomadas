"""Configuración del backend: se lee una sola vez, de variables de entorno (o del `.env` local, que nunca se sube).

Los nombres de las variables están en `.env.example`. Los secretos son `SecretStr`: no salen en `repr`, en `str` ni en
los mensajes de error. Una configuración insegura para producción no arranca.
"""

from typing import Literal, Self

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

LARGO_MINIMO_SECRETO = 32


class Configuracion(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        # Si algo falla, el error de pydantic no repite los valores recibidos (podrían ser secretos)
        hide_input_in_errors=True,
    )

    entorno: Literal["desarrollo", "produccion"] = "desarrollo"
    # `memoria` solo sirve para desarrollo y pruebas: los datos se pierden al apagar. Por defecto, la base real.
    almacen_de_datos: Literal["memoria", "supabase"] = "supabase"

    supabase_url: str = ""
    supabase_service_role_key: SecretStr = SecretStr("")

    jwt_secreto: SecretStr = SecretStr("")
    huellas_secreto: SecretStr = SecretStr("")

    # Orígenes del frontend permitidos por CORS, separados por comas
    origenes_permitidos: str = "http://localhost:3000"

    # Confirmar el correo antes de poder iniciar sesión. Solo se desactiva en desarrollo.
    exigir_correo_confirmado: bool = True

    # inventado: versión de la política de datos que se guarda como prueba del consentimiento; poner la real
    politica_version: str = "v1"

    @property
    def lista_de_origenes(self) -> list[str]:
        return [origen.strip() for origen in self.origenes_permitidos.split(",") if origen.strip()]

    @model_validator(mode="after")
    def _validar(self) -> Self:
        if len(self.jwt_secreto.get_secret_value()) < LARGO_MINIMO_SECRETO:
            raise ValueError(f"JWT_SECRETO debe tener al menos {LARGO_MINIMO_SECRETO} caracteres")

        if "*" in self.lista_de_origenes:
            raise ValueError("ORIGENES_PERMITIDOS no admite el comodín *: hay que listar los orígenes uno por uno")

        if self.almacen_de_datos == "supabase":
            if not self.supabase_url.strip():
                raise ValueError("Falta SUPABASE_URL")
            if not self.supabase_service_role_key.get_secret_value().strip():
                raise ValueError("Falta SUPABASE_SERVICE_ROLE_KEY")
            if len(self.huellas_secreto.get_secret_value()) < LARGO_MINIMO_SECRETO:
                raise ValueError(f"HUELLAS_SECRETO debe tener al menos {LARGO_MINIMO_SECRETO} caracteres")

        if self.entorno == "produccion":
            if self.almacen_de_datos == "memoria":
                raise ValueError("En producción el almacén de datos no puede ser memoria: se perderían los datos")
            if not self.exigir_correo_confirmado:
                raise ValueError("En producción EXIGIR_CORREO_CONFIRMADO no puede ser false")
            origenes = self.lista_de_origenes
            if not origenes or not all(origen.startswith("https://") for origen in origenes):
                raise ValueError("En producción ORIGENES_PERMITIDOS debe tener solo orígenes https")
        return self
