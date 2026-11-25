from dataclasses import replace
from datetime import datetime
from uuid import UUID

from modules.acceso.domain.sesion import MotivoRevocacion, Sesion


class MemoriaSesionRepository:
    """Guarda las sesiones en un diccionario. Sirve para probar los casos de uso sin base de datos.

    No tiene reloj: las fechas de revocación son las que se le pasan, igual que en el adaptador de Supabase.
    """

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
        self._por_id[anterior.id] = replace(guardada, revocada_en=nueva.creada_en, motivo_revocacion="rotada")
        self._por_id[nueva.id] = nueva
        return True

    def revocar(self, sesion_id: UUID, ahora: datetime) -> None:
        self._revocar(sesion_id, "cerrada", ahora)

    def revocar_todas_de_cuenta(self, cuenta_id: UUID, motivo: MotivoRevocacion, ahora: datetime) -> None:
        for sesion in list(self._por_id.values()):
            if sesion.cuenta_id == cuenta_id:
                self._revocar(sesion.id, motivo, ahora)

    def de_cuenta(self, cuenta_id: UUID) -> list[Sesion]:
        return [s for s in self._por_id.values() if s.cuenta_id == cuenta_id]

    def _revocar(self, sesion_id: UUID, motivo: MotivoRevocacion, ahora: datetime) -> None:
        guardada = self._por_id.get(sesion_id)
        if guardada is not None and guardada.revocada_en is None:
            self._por_id[sesion_id] = replace(guardada, revocada_en=ahora, motivo_revocacion=motivo)
