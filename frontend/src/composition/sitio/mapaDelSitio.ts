import { sonAliadosDeEjemplo } from '@/composition/aliados/fabricas/aliados'
import { sonEventosDeEjemplo } from '@/composition/eventos/fabricas/eventos'

/**
 * Las rutas públicas que se anuncian a los buscadores (sitemap.xml), sin el idioma. Las de aliados y eventos solo
 * cuando sus datos son reales: mientras sean de ejemplo no se publican datos inventados. Las fichas de cada aliado
 * entrarán cuando exista el adaptador real.
 */
export function rutasPublicas(): string[] {
  return [
    '',
    '/registro',
    '/iniciar-sesion',
    '/aliados/postular',
    ...(sonAliadosDeEjemplo() ? [] : ['/aliados']),
    ...(sonEventosDeEjemplo() ? [] : ['/eventos']),
  ]
}
