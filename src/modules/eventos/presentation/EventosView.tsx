import { HeroPagina } from '@/shared/ui/HeroPagina'

export type EventosViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
}

// Vista pura de la página de eventos: recibe todo por props.
// Por ahora solo el hero; el próximo evento y el listado llegan después.
export function EventosView({ hero }: EventosViewProps) {
  return <HeroPagina {...hero} />
}
