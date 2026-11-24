"""Entorno de pruebas de los casos de uso: repositorios en memoria y dobles, sin base de datos ni framework."""

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from modules.acceso.application.cerrar_sesion import CerrarSesion
from modules.acceso.application.iniciar_sesion import IniciarSesion
from modules.acceso.application.obtener_cuenta_actual import ObtenerCuentaActual
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.application.renovar_sesion import RenovarSesion
from modules.acceso.domain.cuenta import Cuenta, normalizar_correo
from modules.acceso.domain.sesion_repository import SesionRepository
from modules.acceso.infrastructure.memoria.emisor_tokens_falso import EmisorTokensFalso
from modules.acceso.infrastructure.memoria.hasheador_falso import HasheadorFalso
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

INICIO = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)
POLITICA = "2026-11"
CLAVE = "Clave-segura1"


class RelojDePrueba:
    def __init__(self) -> None:
        self.ahora = INICIO

    def __call__(self) -> datetime:
        return self.ahora

    def avanzar(self, **tiempo: float) -> None:
        self.ahora += timedelta(**tiempo)


@dataclass
class Entorno:
    reloj: RelojDePrueba = field(default_factory=RelojDePrueba)
    cuentas: MemoriaCuentaRepository = field(default_factory=MemoriaCuentaRepository)
    sesiones: MemoriaSesionRepository = field(default_factory=MemoriaSesionRepository)
    limitador: MemoriaLimitadorIntentos = field(default_factory=MemoriaLimitadorIntentos)
    hasheador: HasheadorFalso = field(default_factory=HasheadorFalso)
    emisor: EmisorTokensFalso = field(default_factory=EmisorTokensFalso)

    def registrar_cuenta(self) -> RegistrarCuenta:
        return RegistrarCuenta(
            cuentas=self.cuentas,
            hasheador=self.hasheador,
            limitador=self.limitador,
            ahora=self.reloj,
            politica_version=POLITICA,
        )

    def iniciar_sesion(self, *, exigir_correo_confirmado: bool = True) -> IniciarSesion:
        return IniciarSesion(
            cuentas=self.cuentas,
            sesiones=self.sesiones,
            hasheador=self.hasheador,
            emisor=self.emisor,
            limitador=self.limitador,
            ahora=self.reloj,
            exigir_correo_confirmado=exigir_correo_confirmado,
        )

    def renovar_sesion(self, sesiones: SesionRepository | None = None) -> RenovarSesion:
        return RenovarSesion(sesiones=sesiones or self.sesiones, emisor=self.emisor, ahora=self.reloj)

    def cerrar_sesion(self) -> CerrarSesion:
        return CerrarSesion(sesiones=self.sesiones, emisor=self.emisor)

    def obtener_cuenta_actual(self) -> ObtenerCuentaActual:
        return ObtenerCuentaActual(cuentas=self.cuentas, emisor=self.emisor, ahora=self.reloj)

    def crear_cuenta(self, correo: str = "ana@correo.com", clave: str = CLAVE, *, confirmada: bool = True) -> Cuenta:
        cuenta = Cuenta(
            id=uuid4(),
            correo=normalizar_correo(correo),
            clave_hash=self.hasheador.hashear(clave),
            correo_confirmado=confirmada,
            politica_aceptada_en=self.reloj(),
            politica_version=POLITICA,
            creada_en=self.reloj(),
        )
        assert self.cuentas.crear(cuenta)
        return cuenta


@pytest.fixture
def entorno() -> Entorno:
    return Entorno()
