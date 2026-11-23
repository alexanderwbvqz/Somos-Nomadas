import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { TextosHabilidades } from '../../language/tipos'

/** El saludo del inicio, con el nombre si se conoce y sin él si no */
export function textoSaludo(textos: TextosHabilidades['inicio'], nombre: string | undefined): string {
  const limpio = nombre?.trim()
  return limpio ? rellenarPlantilla(textos.saludo, { nombre: limpio }) : textos.saludoSinNombre
}
