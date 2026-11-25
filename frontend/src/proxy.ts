import { NextResponse, type NextRequest } from 'next/server'
import { crearCuentaRepository } from '@/composition/acceso/fabricas/cuentas'
import { mantenerSesion } from '@/composition/acceso/sesion/mantenerSesion'
import { esIdioma, idiomaPorDefecto } from '@/shared/idiomas/idiomas'

// Si la ruta no empieza por un idioma válido, redirige al idioma por defecto. Si sí, renueva antes la sesión de quien
// vuelve con el acceso caducado (ver `mantenerSesion`).
export async function proxy(solicitud: NextRequest) {
  const primerTramo = solicitud.nextUrl.pathname.split('/')[1] ?? ''
  if (esIdioma(primerTramo)) return await mantenerSesion(solicitud, crearCuentaRepository)

  const destino = solicitud.nextUrl.clone()
  const resto = solicitud.nextUrl.pathname === '/' ? '' : solicitud.nextUrl.pathname
  destino.pathname = `/${idiomaPorDefecto}${resto}`
  return NextResponse.redirect(destino)
}

export const config = { matcher: ['/((?!_next|logo|banderas|.*\\..*).*)'] }
