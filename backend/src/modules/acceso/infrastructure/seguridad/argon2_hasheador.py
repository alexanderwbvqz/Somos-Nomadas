from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError


class Argon2Hasheador:
    """Hash de claves con argon2id y los parámetros por defecto de la librería (los recomendados por OWASP).

    Cada hash lleva su propia sal y sus parámetros: tras endurecerlos, los hashes viejos se siguen verificando, y
    `necesita_recalcular` avisa de cuáles conviene volver a hashear (lo hace el inicio de sesión, que es cuando se
    tiene la clave en claro).
    Si el servidor de Render resulta lento, se ajustan los parámetros midiendo, no a ojo.
    """

    def __init__(self, hasher: PasswordHasher | None = None) -> None:
        self._hasher = hasher or PasswordHasher()
        # Hash de una clave que nadie puede conocer: se verifica contra él cuando el correo no existe
        self._hash_falso = self._hasher.hash("clave-que-no-pertenece-a-nadie")

    def hashear(self, clave: str) -> str:
        return self._hasher.hash(clave)

    def necesita_recalcular(self, hash_guardado: str) -> bool:
        try:
            return self._hasher.check_needs_rehash(hash_guardado)
        except InvalidHashError:
            # Un hash ilegible no se puede «actualizar»: verificar ya lo rechaza, y aquí no se inventa nada
            return False

    def verificar(self, clave: str, hash_guardado: str | None) -> bool:
        # Sin hash (el correo no existe) se hace la misma verificación contra uno falso para que tarde lo mismo
        objetivo = self._hash_falso if hash_guardado is None else hash_guardado
        try:
            correcta = self._hasher.verify(objetivo, clave)
        except (VerificationError, InvalidHashError):
            return False
        return correcta and hash_guardado is not None
