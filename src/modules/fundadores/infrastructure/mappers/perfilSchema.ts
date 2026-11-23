import { z } from 'zod'
import { busquedas, LIMITES_PERFIL, paises, type DatosBienvenida } from '../../domain/perfil'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto
// (el control fino lo hace el dominio, que es el mismo que usa el formulario).
const holgura = 4

const bienvenidaSchema = z.object({
  nombre: z.string().max(LIMITES_PERFIL.nombre * holgura),
  apellidos: z.string().max(LIMITES_PERFIL.apellidos * holgura),
  pais: z.enum([...paises, '']),
  ciudad: z.string().max(LIMITES_PERFIL.ciudad * holgura),
  busca: z.array(z.enum(busquedas)).max(busquedas.length),
})

export function leerDatosBienvenida(entrada: unknown): DatosBienvenida | undefined {
  const resultado = bienvenidaSchema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}
