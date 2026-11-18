// Datos de contacto de Nómadas. Reales, no son de ejemplo.

/** WhatsApp en formato internacional, sin "+" ni espacios (+51 973 356 545) */
export const numeroWhatsapp = '51973356545'

export function enlaceWhatsapp(numero: string = numeroWhatsapp): string {
  return `https://wa.me/${numero}`
}

export type TipoRedSocial = 'instagram' | 'linkedin'
export type RedSocial = { tipo: TipoRedSocial; href: string }

// Pendiente: agregar aquí los enlaces reales de Instagram y LinkedIn.
// Mientras la lista esté vacía, el pie no muestra iconos de redes.
export const redesSociales: RedSocial[] = []
