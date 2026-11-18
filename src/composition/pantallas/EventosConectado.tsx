import { textosEventos } from '@/modules/eventos/language'
import { EventosView } from '@/modules/eventos/presentation/EventosView'
import type { Idioma } from '@/shared/idiomas/idiomas'

export function EventosConectado({ idioma }: { idioma: Idioma }) {
  const t = textosEventos(idioma)
  return <EventosView hero={t.hero} />
}
