import { NextResponse, type NextRequest } from 'next/server'
import { renovarSesion, type ResultadoRenovacion } from '@/modules/acceso/application/renovarSesion'
import type { CuentaRepository } from '@/modules/acceso/domain/CuentaRepository'
import { cookiesABorrar, cookiesDeCredencial, sesionDeCookies, type CookieAEscribir } from '@/modules/acceso/infrastructure/cookies/cookiesDeSesion'
import { origenDeCabeceras } from '@/shared/lib/origenDeCabeceras'

// El acceso dura 15 minutos y su cookie desaparece un poco antes. Cuando alguien vuelve con la renovación viva pero
// sin acceso, aquí (antes de que la página se pinte) se cambia la renovación por una credencial nueva y se guarda,
// para que la persona no note que su sesión caducó.

// Dos peticiones a la vez con la misma renovación (la página y sus datos, o dos pestañas) no pueden renovar las dos:
// la renovación es de un solo uso. Mientras una renueva, las demás esperan su resultado.
const renovacionesEnCurso = new Map<string, Promise<ResultadoRenovacion>>()

function renovarUnaSolaVez(renovacion: string, renovar: () => Promise<ResultadoRenovacion>): Promise<ResultadoRenovacion> {
  const enCurso = renovacionesEnCurso.get(renovacion)
  if (enCurso) return enCurso
  const nueva = renovar().finally(() => renovacionesEnCurso.delete(renovacion))
  renovacionesEnCurso.set(renovacion, nueva)
  return nueva
}

function responderCon(solicitud: NextRequest, cookies: CookieAEscribir[]): NextResponse {
  // Las de la petición, para que la página que se va a pintar vea la sesión nueva; las de la respuesta, para el navegador
  for (const { nombre, valor, opciones } of cookies) {
    if (opciones.maxAge === 0) solicitud.cookies.delete(nombre)
    else solicitud.cookies.set(nombre, valor)
  }
  const respuesta = NextResponse.next({ request: solicitud })
  for (const { nombre, valor, opciones } of cookies) respuesta.cookies.set(nombre, valor, opciones)
  return respuesta
}

/**
 * Deja pasar la petición, renovando antes la sesión si el acceso caducó. `crearRepositorio` recibe la IP de quien
 * navega para reenviarla al backend, como en las acciones de servidor.
 */
export async function mantenerSesion(
  solicitud: NextRequest,
  crearRepositorio: (origen?: string) => CuentaRepository,
): Promise<NextResponse> {
  const produccion = process.env.NODE_ENV === 'production'
  const { acceso, renovacion } = sesionDeCookies((nombre) => solicitud.cookies.get(nombre)?.value, produccion)
  if (acceso !== undefined || renovacion === undefined) return NextResponse.next()

  let resultado: ResultadoRenovacion
  try {
    const repositorio = crearRepositorio(origenDeCabeceras(solicitud.headers))
    resultado = await renovarUnaSolaVez(renovacion, () => renovarSesion(repositorio, renovacion))
  } catch {
    // Falta configuración: es un problema del servidor, no de la persona. Que la página decida qué mostrar.
    return NextResponse.next()
  }

  if (resultado.estado === 'renovada') return responderCon(solicitud, cookiesDeCredencial(resultado.credencial, produccion))
  if (resultado.estado === 'rechazada') return responderCon(solicitud, cookiesABorrar(produccion))
  return NextResponse.next()
}
