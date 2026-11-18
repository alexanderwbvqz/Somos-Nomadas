import { textosAliados } from '@/modules/aliados/language'
import { AliadosView } from '@/modules/aliados/presentation/AliadosView'
import type { Idioma } from '@/shared/idiomas/idiomas'

export function AliadosConectado({ idioma }: { idioma: Idioma }) {
  const t = textosAliados(idioma)
  return <AliadosView hero={t.hero} />
}
