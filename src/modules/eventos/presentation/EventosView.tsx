import { HeroPagina } from '@/shared/ui/HeroPagina'
import { SeccionLlamado, type SeccionLlamadoProps } from '@/shared/ui/SeccionLlamado'
import { SeccionComoFunciona, type SeccionComoFuncionaProps } from './components/SeccionComoFunciona'
import { SeccionMasEventos, type SeccionMasEventosProps } from './components/SeccionMasEventos'
import { SeccionProximoEvento, type SeccionProximoEventoProps } from './components/SeccionProximoEvento'

export type EventosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  proximoEvento: SeccionProximoEventoProps
  comoFunciona: SeccionComoFuncionaProps
  masEventos: SeccionMasEventosProps
  llamado: SeccionLlamadoProps
}

// Vista pura de la página de eventos: recibe todo por props.
export function EventosView({ hero, proximoEvento, comoFunciona, masEventos, llamado }: EventosViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <SeccionProximoEvento {...proximoEvento} />
      <SeccionComoFunciona {...comoFunciona} />
      <SeccionMasEventos {...masEventos} />
      <SeccionLlamado {...llamado} />
    </>
  )
}
