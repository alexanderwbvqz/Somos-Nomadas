import { z } from 'zod'
import { tiposAliado } from '../../domain/Aliado'
import { LIMITES, type DatosPostulacion } from '../../domain/postulacion'

// Frontera con lo que llega del navegador: se comprueba la forma y se ponen topes generosos a cada texto
// (el control fino de longitudes y formatos lo hace `validarPostulacion`, que es el mismo del formulario).
const texto = (maximo: number) => z.string().max(maximo)
const holgura = 4

const esquema = z.object({
  tipo: z.union([z.enum(tiposAliado), z.literal('')]),
  nombre: texto(LIMITES.nombre * holgura),
  personaContacto: texto(LIMITES.persona * holgura),
  correo: texto(LIMITES.correo * holgura),
  descripcionCorta: texto(LIMITES.descripcionLarga),
  descripcionLarga: texto(LIMITES.descripcionLarga * holgura),
  apoyos: z.array(texto(LIMITES.apoyo * holgura)).max(LIMITES.maxApoyos * 3),
  areas: z.array(texto(LIMITES.area * holgura)).max(LIMITES.maxAreas * 3),
  paraQuien: texto(LIMITES.paraQuien * holgura),
  datosClave: z
    .array(z.object({ valor: texto(LIMITES.datoValor * holgura), etiqueta: texto(LIMITES.datoEtiqueta * holgura) }))
    .max(LIMITES.maxDatosClave * 3),
  ciudad: texto(LIMITES.ciudad * holgura),
  sitioWeb: texto(LIMITES.url * holgura),
  linkedin: texto(LIMITES.url * holgura),
  instagram: texto(LIMITES.url * holgura),
  whatsapp: texto(60),
  enlaceAgenda: texto(LIMITES.url * holgura),
  consentimientoWhatsapp: z.boolean(),
  aceptaPolitica: z.boolean(),
  sitioSecundario: texto(500),
})

/** Convierte lo recibido en datos de postulación, o undefined si no tiene la forma esperada */
export function leerDatosPostulacion(entrada: unknown): DatosPostulacion | undefined {
  const resultado = esquema.safeParse(entrada)
  return resultado.success ? resultado.data : undefined
}
