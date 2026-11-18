import { SeccionMasEventos, type SeccionMasEventosProps } from './components/SeccionMasEventos'
import { SeccionProximoEvento, type SeccionProximoEventoProps } from './components/SeccionProximoEvento'
import { HeroPagina } from '@/shared/ui/HeroPagina'

export type EventosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  proximoEvento: SeccionProximoEventoProps
  masEventos: SeccionMasEventosProps
}

// Vista pura de la página de eventos: recibe todo por props.
export function EventosView({ hero, proximoEvento, masEventos }: EventosViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <SeccionProximoEvento {...proximoEvento} />
      <SeccionMasEventos {...masEventos} />
    </>
  )
}
