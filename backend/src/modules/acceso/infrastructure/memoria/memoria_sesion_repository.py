from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from modules.acceso.domain.sesion import Sesion


class MemoriaSesionRepository:
    """Guarda las sesiones en un diccionario. Sirve para probar los casos de uso sin base de datos."""

    def __init__(self) -> None:
        self._por_id: dict[UUID, Sesion] = {}

    def guardar(self, sesion: Sesion) -> None:
        self._por_id[sesion.id] = sesion

    def obtener_por_token_hash(self, token_hash: str) -> Sesion | None:
        return next((s for s in self._por_id.values() if s.token_hash == token_hash), None)

    def rotar(self, anterior: Sesion, nueva: Sesion) -> bool:
        # Se mira lo guardado, no el objeto recibido: dos peticiones pueden traer la misma copia vieja
        guardada = self._por_id.get(anterior.id)
        if guardada is None or guardada.revocada_en is not None:
            return False
        self._por_id[anterior.id] = replace(guardada, revocada_en=_ahora())
        self._por_id[nueva.id] = nueva
        return True

    def revocar(self, sesion_id: UUID) -> None:
        guardada = self._por_id.get(sesion_id)
        if guardada is not None and guardada.revocada_en is None:
            self._por_id[sesion_id] = replace(guardada, revocada_en=_ahora())

    def revocar_todas_de_cuenta(self, cuenta_id: UUID) -> None:
        for sesion in list(self._por_id.values()):
            if sesion.cuenta_id == cuenta_id:
                self.revocar(sesion.id)

    def de_cuenta(self, cuenta_id: UUID) -> list[Sesion]:
        return [s for s in self._por_id.values() if s.cuenta_id == cuenta_id]


def _ahora() -> datetime:
    return datetime.now(UTC)
