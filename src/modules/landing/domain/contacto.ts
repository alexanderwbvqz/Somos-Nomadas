// Datos de contacto de Nómadas. Reales, no son de ejemplo.

/** WhatsApp en formato internacional, sin "+" ni espacios (+51 973 356 545) */
export const numeroWhatsapp = '51973356545'

export function enlaceWhatsapp(numero: string = numeroWhatsapp): string {
  return `https://wa.me/${numero}`
}

export type TipoRedSocial = 'instagram' | 'linkedin'
export type RedSocial = { tipo: TipoRedSocial; href: string }

// PENDIENTE: sustituir estos enlaces provisionales (la portada de cada red)
// por los de las cuentas reales de Nómadas. Si la lista queda vacía, el pie no muestra iconos.
export const redesSociales: RedSocial[] = [
  { tipo: 'instagram', href: 'https://www.instagram.com/' },
  { tipo: 'linkedin', href: 'https://www.linkedin.com/' },
]
