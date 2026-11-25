import hashlib
import secrets
from datetime import datetime
from typing import Final
from uuid import UUID

import jwt

from modules.acceso.domain.sesion import SEGUNDOS_TOKEN_ACCESO, TokenAcceso

ALGORITMO: Final = "HS256"
LARGO_MINIMO_SECRETO: Final = 32  # 256 bits, lo que pide la RFC 7518 para HS256


class JwtEmisor:
    """Tokens de acceso (JWT firmado con HS256) y tokens de renovación (opacos, aleatorios).

    El JWT solo lleva `sub` (id de la cuenta), `iat` y `exp`: se puede leer, así que no lleva datos personales.
    La caducidad se comprueba con el reloj que recibe el caso de uso, no con el del sistema.
    """

    def __init__(self, secreto: str) -> None:
        if len(secreto) < LARGO_MINIMO_SECRETO:
            raise ValueError(f"El secreto del JWT debe tener al menos {LARGO_MINIMO_SECRETO} caracteres")
        self._secreto = secreto

    def emitir_acceso(self, cuenta_id: UUID, ahora: datetime) -> TokenAcceso:
        emitido = int(ahora.timestamp())
        carga = {"sub": str(cuenta_id), "iat": emitido, "exp": emitido + SEGUNDOS_TOKEN_ACCESO}
        valor = jwt.encode(carga, self._secreto, algorithm=ALGORITMO)
        return TokenAcceso(valor=valor, expira_en_segundos=SEGUNDOS_TOKEN_ACCESO)

    def validar_acceso(self, token: str, ahora: datetime) -> UUID | None:
        try:
            carga = jwt.decode(
                token,
                self._secreto,
                algorithms=[ALGORITMO],  # nunca otro: ni «none» ni un algoritmo de clave pública
                # La caducidad se comprueba abajo con `ahora`; la librería usaría el reloj del sistema
                options={"require": ["sub", "iat", "exp"], "verify_exp": False, "verify_iat": False},
            )
            expira, emitido, sujeto = carga["exp"], carga["iat"], carga["sub"]
            if not _es_entero(expira) or not _es_entero(emitido) or not isinstance(sujeto, str):
                return None
            if ahora.timestamp() >= expira:
                return None
            return UUID(sujeto)
        except (jwt.PyJWTError, ValueError):
            return None

    def nuevo_token_renovacion(self) -> str:
        return secrets.token_urlsafe(32)

    def hash_de_token_renovacion(self, token: str) -> str:
        # SHA-256 basta: el token ya tiene 256 bits aleatorios, no hay nada que adivinar por fuerza bruta
        return hashlib.sha256(token.encode()).hexdigest()

    def nuevo_token_confirmacion(self) -> str:
        return secrets.token_urlsafe(32)

    def hash_de_token_confirmacion(self, token: str) -> str:
        # Igual que el de renovación: 256 bits aleatorios, SHA-256 basta
        return hashlib.sha256(token.encode()).hexdigest()


def _es_entero(valor: object) -> bool:
    return isinstance(valor, int) and not isinstance(valor, bool)
