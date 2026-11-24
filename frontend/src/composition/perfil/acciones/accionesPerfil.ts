'use server'

import type { ResultadoGuardar } from '@/modules/perfil/application/resultado'
import type { ErroresEvidencia } from '@/modules/perfil/domain/evidencia'
import type { ErroresSobreMi } from '@/modules/perfil/domain/sobreMi'
import type { ErroresTrayectoria } from '@/modules/perfil/domain/trayectoria'
import { recibirEvidencia, recibirSobreMi, recibirTrayectoria } from '@/modules/perfil/infrastructure/recepcion/recepcionPerfil'
import { identificarCliente } from '@/shared/lib/identificarCliente'
import { crearPerfilRepository } from '../fabricas/perfil'

// Acciones de servidor que llama la página «Mi perfil» al guardar lo que la persona escribe en ella.
// Aquí solo se juntan las piezas: el adaptador (fábrica), quién envía y lo que hace el módulo con lo recibido.
export async function guardarSobreMiAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresSobreMi>> {
  return await recibirSobreMi(crearPerfilRepository(), entrada, await identificarCliente())
}

export async function guardarTrayectoriaAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresTrayectoria>> {
  return await recibirTrayectoria(crearPerfilRepository(), entrada, await identificarCliente())
}

export async function guardarEvidenciaAccion(entrada: unknown): Promise<ResultadoGuardar<ErroresEvidencia>> {
  return await recibirEvidencia(crearPerfilRepository(), entrada, await identificarCliente())
}
