import { SeccionProximoEvento, type SeccionProximoEventoProps } from './components/SeccionProximoEvento'
import { HeroPagina } from '@/shared/ui/HeroPagina'

export type EventosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  proximoEvento: SeccionProximoEventoProps
}

// Vista pura de la página de eventos: recibe todo por props.
// Por ahora hero y próximo evento; el listado de más eventos llega después.
export function EventosView({ hero, proximoEvento }: EventosViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <SeccionProximoEvento {...proximoEvento} />
    </>
  )
}
