import { HeroPagina } from '@/shared/ui/HeroPagina'
import { SeccionListadoAliados, type SeccionListadoAliadosProps } from './components/SeccionListadoAliados'

export type AliadosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  listado: SeccionListadoAliadosProps
}

// Vista pura de la red de aliados: recibe todo por props.
// Falta el llamado final ("¿Quieres ser aliado?").
export function AliadosView({ hero, listado }: AliadosViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <SeccionListadoAliados {...listado} />
    </>
  )
}
