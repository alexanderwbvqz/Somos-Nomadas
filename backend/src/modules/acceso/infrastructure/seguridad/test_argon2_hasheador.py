from typing import Literal

from argon2 import PasswordHasher

from modules.acceso.domain.hasheador_claves import HasheadorClaves
from modules.acceso.infrastructure.seguridad.argon2_hasheador import Argon2Hasheador

CLAVE = "Clave-segura1"


class HasherEspia(PasswordHasher):
    """Cuenta las verificaciones para comprobar que no se omiten, sin medir tiempos (que serían frágiles)."""

    def __init__(self) -> None:
        super().__init__()
        self.verificaciones = 0
        self.hashes_verificados: list[str | bytes] = []

    def verify(self, hash: str | bytes, password: str | bytes) -> Literal[True]:  # noqa: A002
        self.verificaciones += 1
        self.hashes_verificados.append(hash)
        return super().verify(hash, password)


def test_cumple_el_puerto() -> None:
    hasheador: HasheadorClaves = Argon2Hasheador()
    assert hasheador.verificar(CLAVE, hasheador.hashear(CLAVE))


def test_el_hash_es_argon2id_y_no_contiene_la_clave() -> None:
    hash_guardado = Argon2Hasheador().hashear(CLAVE)

    assert hash_guardado.startswith("$argon2id$")
    assert CLAVE not in hash_guardado


def test_la_misma_clave_da_hashes_distintos_por_la_sal() -> None:
    hasheador = Argon2Hasheador()

    assert hasheador.hashear(CLAVE) != hasheador.hashear(CLAVE)


def test_verifica_la_clave_correcta_y_rechaza_las_demas() -> None:
    hasheador = Argon2Hasheador()
    hash_guardado = hasheador.hashear(CLAVE)

    assert hasheador.verificar(CLAVE, hash_guardado)
    assert not hasheador.verificar("Clave-segura2", hash_guardado)
    assert not hasheador.verificar(CLAVE.lower(), hash_guardado)
    assert not hasheador.verificar(CLAVE + " ", hash_guardado)  # los espacios cuentan
    assert not hasheador.verificar("", hash_guardado)


def test_funciona_con_tildes_enie_emojis_y_claves_largas() -> None:
    hasheador = Argon2Hasheador()
    for clave in ["Ñandú-año1", "Contraseña-🔐1", "Aa1!" + "x" * 124]:
        assert hasheador.verificar(clave, hasheador.hashear(clave))


def test_sin_hash_guardado_devuelve_false_pero_igual_gasta_una_verificacion() -> None:
    espia = HasherEspia()
    hasheador = Argon2Hasheador(hasher=espia)

    assert not hasheador.verificar(CLAVE, None)

    assert espia.verificaciones == 1
    # Y es una verificación de verdad, contra un hash argon2 válido: la que tarda lo mismo que una real
    (verificado,) = espia.hashes_verificados
    assert str(verificado).startswith("$argon2id$")


def test_la_clave_del_hash_falso_no_sirve_para_entrar_con_un_correo_inexistente() -> None:
    # Si se pudiera «acertar» la clave del hash de relleno, cualquiera entraría con un correo que no existe
    hasheador = Argon2Hasheador()

    assert not hasheador.verificar("clave-que-no-pertenece-a-nadie", None)


def test_con_hash_guardado_hace_una_sola_verificacion() -> None:
    espia = HasherEspia()
    hasheador = Argon2Hasheador(hasher=espia)
    hash_guardado = hasheador.hashear(CLAVE)

    assert hasheador.verificar(CLAVE, hash_guardado)

    assert espia.verificaciones == 1


def test_un_hash_corrupto_no_rompe_y_devuelve_false() -> None:
    hasheador = Argon2Hasheador()

    for roto in ["", "basura", "$argon2id$v=19$m=65536,t=3,p=4$corto$corto", "x" * 500]:
        assert not hasheador.verificar(CLAVE, roto)
