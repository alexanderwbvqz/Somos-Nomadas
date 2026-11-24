import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosSitio } from './tipos'

const textos: Record<Idioma, TextosSitio> = { es, en, pt }

export function textosSitio(idioma: Idioma): TextosSitio {
  return textos[idioma]
}
