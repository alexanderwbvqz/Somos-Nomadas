import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosHabilidades } from './tipos'

const textos: Record<Idioma, TextosHabilidades> = { es, en, pt }

export function textosHabilidades(idioma: Idioma): TextosHabilidades {
  return textos[idioma]
}
