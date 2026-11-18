import { HeroPagina } from '@/shared/ui/HeroPagina'

export type AliadosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
}

// Vista pura de la red de aliados: recibe todo por props.
// Por ahora solo el hero; el filtro, el listado y el llamado final llegan después.
export function AliadosView({ hero }: AliadosViewProps) {
  return <HeroPagina {...hero} />
}
