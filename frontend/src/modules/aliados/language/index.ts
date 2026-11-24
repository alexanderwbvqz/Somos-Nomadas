import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosAliados } from './tipos'

const textos: Record<Idioma, TextosAliados> = { es, en, pt }

export function textosAliados(idioma: Idioma): TextosAliados {
  return textos[idioma]
}
