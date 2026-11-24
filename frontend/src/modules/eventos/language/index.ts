import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosEventos } from './tipos'

const textos: Record<Idioma, TextosEventos> = { es, en, pt }

export function textosEventos(idioma: Idioma): TextosEventos {
  return textos[idioma]
}
