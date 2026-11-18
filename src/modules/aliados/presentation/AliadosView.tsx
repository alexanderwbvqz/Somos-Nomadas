import { HeroPagina } from '@/shared/ui/HeroPagina'
import { SeccionLlamado, type SeccionLlamadoProps } from '@/shared/ui/SeccionLlamado'
import { SeccionListadoAliados, type SeccionListadoAliadosProps } from './components/SeccionListadoAliados'

export type AliadosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  listado: SeccionListadoAliadosProps
  llamado: SeccionLlamadoProps
}

// Vista pura de la red de aliados: recibe todo por props.
export function AliadosView({ hero, listado, llamado }: AliadosViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <SeccionListadoAliados {...listado} />
      <SeccionLlamado {...llamado} />
    </>
  )
}
