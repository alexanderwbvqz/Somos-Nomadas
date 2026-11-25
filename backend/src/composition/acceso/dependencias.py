"""Cablea el módulo `acceso`: elige el adaptador de cada puerto y arma los casos de uso con ellos.

Es de los pocos sitios que conoce los adaptadores concretos. El cliente de Supabase llega ya creado desde `app.py`.
"""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from supabase import Client

from modules.acceso.application.cerrar_sesion import CerrarSesion
from modules.acceso.application.iniciar_sesion import IniciarSesion
from modules.acceso.application.obtener_cuenta_actual import ObtenerCuentaActual
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.application.renovar_sesion import RenovarSesion
from modules.acceso.domain.cuenta_repository import CuentaRepository
from modules.acceso.domain.limitador_intentos import LimitadorIntentos
from modules.acceso.domain.sesion_repository import SesionRepository
from modules.acceso.infrastructure.memoria.memoria_cuenta_repository import MemoriaCuentaRepository
from modules.acceso.infrastructure.memoria.memoria_limitador_intentos import MemoriaLimitadorIntentos
from modules.acceso.infrastructure.memoria.memoria_sesion_repository import MemoriaSesionRepository
from modules.acceso.infrastructure.seguridad.argon2_hasheador import Argon2Hasheador
from modules.acceso.infrastructure.seguridad.jwt_emisor import JwtEmisor
from modules.acceso.infrastructure.supabase.supabase_cuenta_repository import SupabaseCuentaRepository
from modules.acceso.infrastructure.supabase.supabase_limitador_intentos import SupabaseLimitadorIntentos
from modules.acceso.infrastructure.supabase.supabase_sesion_repository import SupabaseSesionRepository
from shared.config.config import Configuracion


@dataclass(frozen=True)
class CasosDeUsoAcceso:
    registrar_cuenta: RegistrarCuenta
    iniciar_sesion: IniciarSesion
    renovar_sesion: RenovarSesion
    cerrar_sesion: CerrarSesion
    obtener_cuenta_actual: ObtenerCuentaActual


def armar_acceso(config: Configuracion, cliente: Client | None, ahora: Callable[[], datetime]) -> CasosDeUsoAcceso:
    cuentas: CuentaRepository
    sesiones: SesionRepository
    limitador: LimitadorIntentos
    if config.almacen_de_datos == "supabase":
        if cliente is None:
            raise ValueError("Con el almacén supabase hace falta el cliente de Supabase")
        cuentas = SupabaseCuentaRepository(cliente)
        sesiones = SupabaseSesionRepository(cliente)
        limitador = SupabaseLimitadorIntentos(cliente, config.huellas_secreto.get_secret_value())
    else:
        # Solo desarrollo y pruebas (la configuración lo prohíbe en producción): los datos viven en memoria
        cuentas = MemoriaCuentaRepository()
        sesiones = MemoriaSesionRepository()
        limitador = MemoriaLimitadorIntentos()

    # La criptografía es siempre la real, aunque los datos estén en memoria: nunca los dobles de prueba
    hasheador = Argon2Hasheador()
    emisor = JwtEmisor(config.jwt_secreto.get_secret_value())

    return CasosDeUsoAcceso(
        registrar_cuenta=RegistrarCuenta(
            cuentas=cuentas,
            hasheador=hasheador,
            limitador=limitador,
            ahora=ahora,
            politica_version=config.politica_version,
        ),
        iniciar_sesion=IniciarSesion(
            cuentas=cuentas,
            sesiones=sesiones,
            hasheador=hasheador,
            emisor=emisor,
            limitador=limitador,
            ahora=ahora,
            exigir_correo_confirmado=config.exigir_correo_confirmado,
        ),
        renovar_sesion=RenovarSesion(sesiones=sesiones, emisor=emisor, ahora=ahora),
        cerrar_sesion=CerrarSesion(sesiones=sesiones, emisor=emisor, ahora=ahora),
        obtener_cuenta_actual=ObtenerCuentaActual(cuentas=cuentas, emisor=emisor, ahora=ahora),
    )
