import type { Evento } from '@/modules/eventos/domain/Evento'
import { diasHasta } from '@/modules/eventos/domain/eventos'
import type { TextosEventos } from '@/modules/eventos/language/tipos'
import type { ProximoEventoVista } from '@/modules/eventos/presentation/components/SeccionProximoEvento'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'

/** Enlace de WhatsApp con un mensaje ya escrito (el enlace base lo da quien llama) */
export type ConstruirEnlaceWhatsapp = (mensaje: string) => string

// Convierte un evento del dominio en lo que muestra la vista: fecha y hora en la zona del
// evento, formateadas según el idioma, y la cuenta regresiva en palabras.
export function vistaProximoEvento(
  evento: Evento,
  idioma: Idioma,
  textos: TextosEventos['proximo'],
  ahora: Date,
  enlaceWhatsapp: ConstruirEnlaceWhatsapp,
): ProximoEventoVista {
  const inicio = new Date(evento.inicio)
  const zona = evento.zonaHoraria
  const dias = diasHasta(evento.inicio, ahora, zona)

  const dia = new Intl.DateTimeFormat(idioma, { day: '2-digit', timeZone: zona }).format(inicio)
  const mes = new Intl.DateTimeFormat(idioma, { month: 'short', timeZone: zona }).format(inicio).replace('.', '')
  const anio = new Intl.DateTimeFormat(idioma, { year: 'numeric', timeZone: zona }).format(inicio)
  const hora = new Intl.DateTimeFormat(idioma, { hour: 'numeric', minute: '2-digit', timeZone: zona }).format(inicio)

  return {
    nombre: evento.nombre,
    dia,
    mesAnio: `${mes} · ${anio}`,
    cuenta: dias <= 0 ? textos.hoy : dias === 1 ? textos.manana : rellenarPlantilla(textos.enDias, { dias }),
    modalidad: textos.modalidades[evento.modalidad],
    lugar: evento.lugar,
    hora,
    descripcion: evento.descripcion,
    hrefConfirmar: enlaceWhatsapp(rellenarPlantilla(textos.mensajeConfirmar, { evento: evento.nombre })),
  }
}
