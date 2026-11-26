from datetime import datetime, timedelta
from uuid import UUID, uuid4

from modules.acceso.domain.emisor_tokens import EmisorTokens
from modules.acceso.domain.sesion import DIAS_TOKEN_RENOVACION, ParDeTokens, Sesion
from modules.acceso.domain.sesion_repository import SesionRepository


def abrir_sesion(cuenta_id: UUID, *, sesiones: SesionRepository, emisor: EmisorTokens, ahora: datetime) -> ParDeTokens:
    """Abre una sesión para la cuenta: emite el token de acceso y guarda la sesión solo con el hash del de renovación.

    La usan iniciar sesión y confirmar el correo en el mismo navegador: las dos abren exactamente la misma sesión.
    """
    acceso = emisor.emitir_acceso(cuenta_id, ahora)
    token_renovacion = emisor.nuevo_token_renovacion()
    sesiones.guardar(
        Sesion(
            id=uuid4(),
            cuenta_id=cuenta_id,
            token_hash=emisor.hash_de_token_renovacion(token_renovacion),
            expira_en=ahora + timedelta(days=DIAS_TOKEN_RENOVACION),
            creada_en=ahora,
        )
    )
    return ParDeTokens(acceso.valor, acceso.expira_en_segundos, token_renovacion)
