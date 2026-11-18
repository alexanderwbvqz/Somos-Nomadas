import { obtenerEventosProximos } from '@/modules/eventos/application/obtenerEventosProximos'
import { textosEventos } from '@/modules/eventos/language'
import { EventosView } from '@/modules/eventos/presentation/EventosView'
import { enlaceWhatsapp } from '@/modules/landing/domain/contacto'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { crearEventoRepository } from '../fabricas/eventos'
import { vistaEventoListado, vistaProximoEvento } from '../vistaProximoEvento'

const conMensaje = (mensaje: string) => `${enlaceWhatsapp()}?text=${encodeURIComponent(mensaje)}`

export async function EventosConectado({ idioma, ahora = new Date() }: { idioma: Idioma; ahora?: Date }) {
  const t = textosEventos(idioma)
  const { proximo, siguientes } = await obtenerEventosProximos(crearEventoRepository(), ahora)

  return (
    <EventosView
      hero={t.hero}
      proximoEvento={{
        textos: t.proximo,
        proximo: proximo ? vistaProximoEvento(proximo, idioma, t.proximo, ahora, conMensaje) : undefined,
        hrefAvisar: conMensaje(t.proximo.mensajeAvisar),
      }}
      masEventos={{
        textos: { ...t.masEventos, confirmar: t.proximo.confirmar },
        eventos: siguientes.map((evento) => vistaEventoListado(evento, idioma, t.proximo, conMensaje)),
      }}
    />
  )
}
