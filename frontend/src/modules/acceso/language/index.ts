import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosAcceso } from './tipos'

const textos: Record<Idioma, TextosAcceso> = { es, en, pt }

export function textosAcceso(idioma: Idioma): TextosAcceso {
  return textos[idioma]
}
