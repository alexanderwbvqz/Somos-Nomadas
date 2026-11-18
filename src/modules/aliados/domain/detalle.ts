import type { Aliado } from './Aliado'

/** Rutas fijas bajo /aliados que un aliado no puede usar como identificador */
export const ID_RESERVADOS = ['postular'] as const

export function esIdReservado(id: string): boolean {
  return (ID_RESERVADOS as readonly string[]).includes(id)
}

/** Solo se aceptan enlaces http o https: lo demás (javascript:, data:…) no se muestra nunca */
export function urlSegura(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined
  }
}

/** Número internacional: solo dígitos, de 8 a 15 (sin "+" ni espacios) */
export function numeroWhatsappValido(numero: string | undefined): string | undefined {
  return numero && /^\d{8,15}$/.test(numero) ? numero : undefined
}

export type ContactoAliado = {
  agenda: string | undefined
  whatsapp: string | undefined
}

/** Las formas de contacto directo que el aliado ha dado y son válidas */
export function contactoDe(aliado: Aliado): ContactoAliado {
  return { agenda: urlSegura(aliado.enlaceAgenda), whatsapp: numeroWhatsappValido(aliado.whatsapp) }
}

export function tieneContacto(aliado: Aliado): boolean {
  const { agenda, whatsapp } = contactoDe(aliado)
  return agenda !== undefined || whatsapp !== undefined
}

/** Otros aliados del mismo tipo, en el orden del listado, hasta `maximo` */
export function aliadosSimilares(aliados: Aliado[], aliado: Aliado, maximo = 3): Aliado[] {
  return aliados.filter((otro) => otro.tipo === aliado.tipo && otro.id !== aliado.id).slice(0, maximo)
}
