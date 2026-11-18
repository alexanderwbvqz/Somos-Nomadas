import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es, type TextosLanding } from './es'
import { pt } from './pt'

const textos: Record<Idioma, TextosLanding> = { es, en, pt }

export function textosLanding(idioma: Idioma): TextosLanding {
  return textos[idioma]
}
