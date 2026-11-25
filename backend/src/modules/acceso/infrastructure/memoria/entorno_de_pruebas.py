"""Entorno de pruebas de `acceso`: repositorios en memoria y dobles, sin base de datos ni framework.

Lo usan los tests de los casos de uso y los de la API, para armar los mismos casos de uso de la misma manera.
"""

from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from modules.acceso.application.cerrar_sesion import CerrarSesion
from modules.acceso.application.confirmar_correo import ConfirmarCorreo
from modules.acceso.application.iniciar_sesion import IniciarSesion
from modules.acceso.application.obtener_cuenta_actual import ObtenerCuentaActual
from modules.acceso.application.reenviar_confirmacion import ReenviarConfirmacion
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.application.renovar_sesion import RenovarSesion
from modules.acceso.domain.cuenta import Cuenta, normalizar_correo
from modules.acceso.domain.sesion_repository import SesionRepository
from modules.acceso.infrastructure.memoria.correos_en_memoria import CorreosEnMemoria
from modules.acceso.infrastructure.memoria.emisor_tokens_falso import EmisorTokensFalso
from modules.acceso.infrastructure.memoria.hasheador_falso import HasheadorFalso
from modules.acceso.infrastructure.memoria.memoria_confirmacion_repository import MemoriaConfirmacionRepository
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository

INICIO = datetime(2026, 11, 24, 12, 0, tzinfo=UTC)
POLITICA = "2026-11"
CLAVE = "Clave-segura1"


class CuentasQue(MemoriaCuentaRepository):
    """Un repositorio de cuentas al que se le puede hacer fallar o contestar distinto al actualizar el hash."""

    def __init__(self, al_actualizar: Callable[[], bool]) -> None:
        super().__init__()
        self._al_actualizar = al_actualizar

    def actualizar_clave_hash(self, cuenta_id: UUID, hash_anterior: str, hash_nuevo: str) -> bool:
        return self._al_actualizar()


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
    correos: CorreosEnMemoria = field(default_factory=CorreosEnMemoria)
    # Comparte las cuentas con `cuentas`, como en la base
    confirmaciones: MemoriaConfirmacionRepository = field(init=False)

    def __post_init__(self) -> None:
        self.confirmaciones = MemoriaConfirmacionRepository(self.cuentas)

    def registrar_cuenta(self) -> RegistrarCuenta:
        return RegistrarCuenta(
            confirmaciones=self.confirmaciones,
            hasheador=self.hasheador,
            emisor=self.emisor,
            limitador=self.limitador,
            ahora=self.reloj,
            politica_version=POLITICA,
        )

    def confirmar_correo(self) -> ConfirmarCorreo:
        return ConfirmarCorreo(
            confirmaciones=self.confirmaciones, emisor=self.emisor, limitador=self.limitador, ahora=self.reloj
        )

    def reenviar_confirmacion(self) -> ReenviarConfirmacion:
        return ReenviarConfirmacion(
            confirmaciones=self.confirmaciones, emisor=self.emisor, limitador=self.limitador, ahora=self.reloj
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
        return CerrarSesion(sesiones=self.sesiones, emisor=self.emisor, ahora=self.reloj)

    def obtener_cuenta_actual(self) -> ObtenerCuentaActual:
        return ObtenerCuentaActual(cuentas=self.cuentas, emisor=self.emisor, ahora=self.reloj)

    def crear_cuenta(
        self,
        correo: str = "ana@correo.com",
        clave: str = CLAVE,
        *,
        confirmada: bool = True,
        hash_antiguo: bool = False,
    ) -> Cuenta:
        """Con `hash_antiguo` el hash se guarda como lo habría hecho una versión anterior, con parámetros más flojos."""
        cuenta = Cuenta(
            id=uuid4(),
            correo=normalizar_correo(correo),
            clave_hash=f"viejo({clave})" if hash_antiguo else self.hasheador.hashear(clave),
            correo_confirmado=confirmada,
            politica_aceptada_en=self.reloj(),
            politica_version=POLITICA,
            creada_en=self.reloj(),
        )
        assert self.cuentas.crear(cuenta)
        return cuenta
