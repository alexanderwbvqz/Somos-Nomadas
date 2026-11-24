from datetime import datetime, timedelta
from uuid import UUID

from modules.acceso.domain.sesion import SEGUNDOS_TOKEN_ACCESO, TokenAcceso


class EmisorTokensFalso:
    """Doble de prueba: tokens predecibles y sin firma. El real (JWT) vive en infrastructure/seguridad."""

    def __init__(self) -> None:
        self._contador = 0

    def emitir_acceso(self, cuenta_id: UUID, ahora: datetime) -> TokenAcceso:
        valor = f"acceso|{cuenta_id}|{ahora.isoformat()}"
        return TokenAcceso(valor=valor, expira_en_segundos=SEGUNDOS_TOKEN_ACCESO)

    def validar_acceso(self, token: str, ahora: datetime) -> UUID | None:
        partes = token.split("|")
        if len(partes) != 3 or partes[0] != "acceso":
            return None
        try:
            cuenta_id = UUID(partes[1])
            emitido = datetime.fromisoformat(partes[2])
        except ValueError:
            return None
        if ahora >= emitido + timedelta(seconds=SEGUNDOS_TOKEN_ACCESO):
            return None
        return cuenta_id

    def nuevo_token_renovacion(self) -> str:
        self._contador += 1
        return f"renovacion-{self._contador}"

    def hash_de_token_renovacion(self, token: str) -> str:
        return f"hash({token})"
