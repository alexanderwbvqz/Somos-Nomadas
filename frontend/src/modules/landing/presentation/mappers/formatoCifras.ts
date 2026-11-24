import type { Cifra } from '@/modules/landing/domain/cifras'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { formatearMesAnio } from '@/shared/lib/formatoFechas'

const ESPACIO_FIJO = ' '

// Una sola forma de mostrar las cifras, en la landing y en el pie
export function formatearCifra(cifra: Cifra, idioma: Idioma): string {
  const valor = new Intl.NumberFormat(idioma).format(cifra.valor)
  if (cifra.unidad === 'porcentaje') return `${valor}${ESPACIO_FIJO}%`
  if (cifra.unidad === 'veces') return `${valor}×`
  return `${valor}+`
}

export function formatearFuente(cifra: Cifra, idioma: Idioma): string {
  if (!cifra.fecha) return cifra.fuente
  return `${cifra.fuente}, ${formatearMesAnio(cifra.fecha, idioma)}`
}
