import { z } from 'zod'
import { busquedas, LIMITES_BIENVENIDA, paises, type DatosBienvenida } from '../../domain/bienvenida'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto
// (el control fino lo hace el dominio, que es el mismo que usa el formulario).
const holgura = 4

const bienvenidaSchema = z.object({
  nombre: z.string().max(LIMITES_BIENVENIDA.nombre * holgura),
  apellidos: z.string().max(LIMITES_BIENVENIDA.apellidos * holgura),
  pais: z.enum([...paises, '']),
  ciudad: z.string().max(LIMITES_BIENVENIDA.ciudad * holgura),
  busca: z.array(z.enum(busquedas)).max(busquedas.length),
})

export function leerDatosBienvenida(entrada: unknown): DatosBienvenida | undefined {
  const resultado = bienvenidaSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}
