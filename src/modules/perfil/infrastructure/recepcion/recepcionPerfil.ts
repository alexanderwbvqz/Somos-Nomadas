import { guardarEvidencia } from '../../application/guardarEvidencia'
import { guardarSobreMi } from '../../application/guardarSobreMi'
import { guardarTrayectoria } from '../../application/guardarTrayectoria'
import type { ResultadoGuardar } from '../../application/resultado'
import type { ErroresEvidencia } from '../../domain/evidencia'
import type { PerfilRepository } from '../../domain/PerfilRepository'
import type { ErroresSobreMi } from '../../domain/sobreMi'
import type { ErroresTrayectoria } from '../../domain/trayectoria'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerEvidencia, leerSobreMi, leerTrayectoria } from '../mappers/perfilSchema'

// Lo que hace el servidor al recibir lo que la persona escribe en su perfil: limita los intentos repetidos de un mismo cliente,
// comprueba la forma de lo recibido y llama al caso de uso. El repositorio lo pone quien llama (composition), y `clienteId`
// identifica a quien envía. Se edita a menudo, por eso el límite es amplio.
const limitePerfil = crearLimitador({ maximo: 60, ventanaMs: 10 * 60 * 1000 })

export async function recibirSobreMi(repositorio: PerfilRepository, entrada: unknown, clienteId: string): Promise<ResultadoGuardar<ErroresSobreMi>> {
  if (!limitePerfil.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }
  const texto = leerSobreMi(entrada)
  return texto === undefined ? { ok: false, errores: {}, motivo: 'fallo' } : await guardarSobreMi(repositorio, texto)
}

export async function recibirTrayectoria(
  repositorio: PerfilRepository,
  entrada: unknown,
  clienteId: string,
  anioActual: number = new Date().getFullYear(),
): Promise<ResultadoGuardar<ErroresTrayectoria>> {
  if (!limitePerfil.permitir(clienteId)) return { ok: false, errores: { entradas: {} }, motivo: 'limite' }
  const entradas = leerTrayectoria(entrada)
  return entradas === undefined ? { ok: false, errores: { entradas: {} }, motivo: 'fallo' } : await guardarTrayectoria(repositorio, entradas, anioActual)
}

export async function recibirEvidencia(repositorio: PerfilRepository, entrada: unknown, clienteId: string): Promise<ResultadoGuardar<ErroresEvidencia>> {
  if (!limitePerfil.permitir(clienteId)) return { ok: false, errores: { enlaces: {} }, motivo: 'limite' }
  const enlaces = leerEvidencia(entrada)
  return enlaces === undefined ? { ok: false, errores: { enlaces: {} }, motivo: 'fallo' } : await guardarEvidencia(repositorio, enlaces)
}
