class HasheadorFalso:
    """Doble de prueba: no es seguro, solo predecible. El real (argon2) vive en infrastructure/seguridad."""

    def __init__(self) -> None:
        self.hasheos = 0
        self.verificaciones_sin_hash = 0

    def hashear(self, clave: str) -> str:
        self.hasheos += 1
        return f"hash({clave})"

    def verificar(self, clave: str, hash_guardado: str | None) -> bool:
        if hash_guardado is None:
            self.verificaciones_sin_hash += 1
            return False
        return hash_guardado == f"hash({clave})"
