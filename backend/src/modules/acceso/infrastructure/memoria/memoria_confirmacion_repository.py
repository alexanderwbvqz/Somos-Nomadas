from dataclasses import dataclass, replace
from datetime import datetime
from uuid import UUID

from modules.acceso.domain.confirmacion import EnlaceNuevo
from modules.acceso.domain.cuenta import Cuenta
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository


@dataclass
class _Enlace:
    cuenta_id: UUID
    expira_en: datetime
    usada_en: datetime | None = None
    anulada_en: datetime | None = None


class MemoriaConfirmacionRepository:
    """Los enlaces en un diccionario, con las mismas reglas que las funciones SQL de la migración 0007. Comparte las
    cuentas con el repositorio de cuentas en memoria (en la base son tablas de la misma base)."""

    def __init__(self, cuentas: MemoriaCuentaRepository) -> None:
        self._cuentas = cuentas
        self._por_hash: dict[str, _Enlace] = {}

    def crear_cuenta_con_confirmacion(self, cuenta: Cuenta, enlace: EnlaceNuevo) -> bool:
        if not self._cuentas.crear(replace(cuenta, correo_confirmado=False)):
            return False
        self._por_hash[enlace.token_hash] = _Enlace(cuenta.id, enlace.expira_en)
        return True

    def renovar(self, correo: str, enlace: EnlaceNuevo) -> bool:
        cuenta = self._cuentas.obtener_por_correo(correo)
        if cuenta is None or cuenta.correo_confirmado:
            return False
        for guardado in self._por_hash.values():
            if guardado.cuenta_id == cuenta.id and guardado.usada_en is None and guardado.anulada_en is None:
                guardado.anulada_en = enlace.creada_en
        self._por_hash[enlace.token_hash] = _Enlace(cuenta.id, enlace.expira_en)
        return True

    def confirmar(self, token_hash: str, ahora: datetime) -> str | None:
        guardado = self._por_hash.get(token_hash)
        if guardado is None or guardado.usada_en or guardado.anulada_en or guardado.expira_en <= ahora:
            return None
        cuenta = self._cuentas.marcar_correo_confirmado(guardado.cuenta_id)
        if cuenta is None:
            return None
        guardado.usada_en = ahora
        return cuenta.correo

    def vigentes(self, cuenta_id: UUID) -> int:
        """Solo para pruebas: cuántos enlaces de la cuenta siguen valiendo (sin mirar si caducaron)."""
        return sum(
            1
            for e in self._por_hash.values()
            if e.cuenta_id == cuenta_id and e.usada_en is None and e.anulada_en is None
        )
