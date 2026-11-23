import type { Idioma } from '@/shared/idiomas/idiomas'

/** "marzo de 2026" a partir de AAAA-MM-DD, sin que la zona horaria cambie el mes */
export function formatearMesAnio(fechaIso: string, idioma: Idioma): string {
  return new Intl.DateTimeFormat(idioma, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(fechaIso))
}
