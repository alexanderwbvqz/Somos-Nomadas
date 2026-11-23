import { analizarMaterial, type ResultadoAnalisis } from '../../application/analizarMaterial'
import type { AnalisisRepository } from '../../domain/AnalisisRepository'
import { LIMITES_MATERIAL, type DatosMaterial } from '../../domain/material'
import { crearLimitador } from '@/shared/lib/limitadorPeticiones'
import { leerMaterial } from '../mappers/materialSchema'

// Lo que hace el servidor al recibir el material: limita los intentos repetidos de un mismo cliente (cada análisis cuesta),
// comprueba la forma de lo recibido, revisa el archivo por dentro y llama al caso de uso. El repositorio lo pone quien
// llama (composition), y `clienteId` identifica a quien envía.
const limiteAnalisis = crearLimitador({ maximo: 5, ventanaMs: 10 * 60 * 1000 })

// Todo PDF empieza por «%PDF-». La extensión y el tipo que declara el navegador no bastan: se pueden falsear.
const FIRMA_PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]
const empiezaComoPdf = (bytes: Uint8Array) => FIRMA_PDF.every((byte, indice) => bytes[indice] === byte)

export async function recibirMaterial(repositorio: AnalisisRepository, entrada: unknown, clienteId: string): Promise<ResultadoAnalisis> {
  if (!limiteAnalisis.permitir(clienteId)) return { ok: false, errores: {}, motivo: 'limite' }

  const recibido = leerMaterial(entrada)
  if (!recibido) return { ok: false, errores: {}, motivo: 'fallo' }

  const { archivo, aceptaAnalisis, ...enlaces } = recibido
  const datos: DatosMaterial = { ...enlaces, aceptaAnalisis }

  let bytes: Uint8Array | undefined
  if (archivo) {
    // El tamaño se mira antes de leer el contenido, para no cargar en memoria algo que ya sobra
    if (archivo.size > LIMITES_MATERIAL.pdfBytes) return { ok: false, errores: { archivo: 'archivoGrande' } }
    bytes = new Uint8Array(await archivo.arrayBuffer())
    if (!empiezaComoPdf(bytes)) return { ok: false, errores: { archivo: 'archivoNoPdf' } }
    datos.archivo = { nombre: archivo.name, tamano: bytes.length, tipo: 'application/pdf' }
  }

  return await analizarMaterial(repositorio, { datos, bytes })
}
