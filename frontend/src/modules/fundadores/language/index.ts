import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosFundadores } from './tipos'

const textos: Record<Idioma, TextosFundadores> = { es, en, pt }

export function textosFundadores(idioma: Idioma): TextosFundadores {
  return textos[idioma]
}
