from typing import Protocol


class HasheadorClaves(Protocol):
    def hashear(self, clave: str) -> str: ...

    def verificar(self, clave: str, hash_guardado: str | None) -> bool:
        """Comprueba la clave contra su hash. Si no hay hash (el correo no existe) gasta el mismo tiempo que una
        comprobación real y devuelve False, para que no se note si el correo está registrado."""
        ...

    def necesita_recalcular(self, hash_guardado: str) -> bool:
        """True si el hash se hizo con parámetros más flojos que los actuales (o con otro algoritmo): conviene volver a
        hashear la clave la próxima vez que se tenga en claro, es decir, al iniciar sesión."""
        ...
