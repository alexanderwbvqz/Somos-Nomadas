import type { Idioma } from '@/shared/idiomas/idiomas'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { TextosPerfil } from './tipos'

const textos: Record<Idioma, TextosPerfil> = { es, en, pt }

export function textosPerfil(idioma: Idioma): TextosPerfil {
  return textos[idioma]
}
