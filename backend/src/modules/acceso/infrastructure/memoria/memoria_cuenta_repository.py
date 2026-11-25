from dataclasses import replace
from uuid import UUID

from modules.acceso.domain.cuenta import Cuenta


class MemoriaCuentaRepository:
    """Guarda las cuentas en un diccionario. Sirve para probar los casos de uso sin base de datos."""

    def __init__(self) -> None:
        self._por_correo: dict[str, Cuenta] = {}

    def crear(self, cuenta: Cuenta) -> bool:
        if cuenta.correo in self._por_correo:
            return False
        self._por_correo[cuenta.correo] = cuenta
        return True

    def obtener_por_correo(self, correo: str) -> Cuenta | None:
        return self._por_correo.get(correo)

    def obtener_por_id(self, cuenta_id: UUID) -> Cuenta | None:
        return next((c for c in self._por_correo.values() if c.id == cuenta_id), None)

    def actualizar_clave_hash(self, cuenta_id: UUID, hash_anterior: str, hash_nuevo: str) -> bool:
        cuenta = self.obtener_por_id(cuenta_id)
        if cuenta is None or cuenta.clave_hash != hash_anterior:
            return False
        self._por_correo[cuenta.correo] = replace(cuenta, clave_hash=hash_nuevo)
        return True

    def marcar_correo_confirmado(self, cuenta_id: UUID) -> Cuenta | None:
        """Lo usa el repositorio de confirmaciones en memoria (en la base lo hace la función `confirmar_correo`)."""
        cuenta = self.obtener_por_id(cuenta_id)
        if cuenta is None:
            return None
        confirmada = replace(cuenta, correo_confirmado=True)
        self._por_correo[cuenta.correo] = confirmada
        return confirmada

    def cantidad(self) -> int:
        return len(self._por_correo)

    def borrar(self, cuenta_id: UUID) -> None:
        self._por_correo = {correo: c for correo, c in self._por_correo.items() if c.id != cuenta_id}
