import { NextResponse, type NextRequest } from 'next/server'
import { esIdioma, idiomaPorDefecto } from '@/shared/idiomas/idiomas'

// Si la ruta no empieza por un idioma válido, redirige al idioma por defecto
export function proxy(solicitud: NextRequest) {
  const primerTramo = solicitud.nextUrl.pathname.split('/')[1] ?? ''
  if (esIdioma(primerTramo)) return NextResponse.next()

  const destino = solicitud.nextUrl.clone()
  const resto = solicitud.nextUrl.pathname === '/' ? '' : solicitud.nextUrl.pathname
  destino.pathname = `/${idiomaPorDefecto}${resto}`
  return NextResponse.redirect(destino)
}

export const config = { matcher: ['/((?!_next|logo|banderas|.*\\..*).*)'] }
