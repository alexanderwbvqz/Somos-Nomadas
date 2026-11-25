// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { cookiesABorrar, cookiesDeCredencial, nombresDeCookies, sesionDeCookies } from './cookiesDeSesion'

const credencial = { acceso: 'cabecera.cuerpo.firma', renovacion: 'renovacion_Secreta-123', expiraEnSegundos: 900 }

describe('nombresDeCookies', () => {
  it('en producción llevan el prefijo __Host-: solo valen si son seguras, de este dominio y de toda la web', () => {
    expect(nombresDeCookies(true)).toEqual({ acceso: '__Host-nomadas_acceso', renovacion: '__Host-nomadas_renovacion' })
  })

  it('en desarrollo no lo llevan (el prefijo exige https)', () => {
    expect(nombresDeCookies(false)).toEqual({ acceso: 'nomadas_acceso', renovacion: 'nomadas_renovacion' })
  })
})

describe('cookiesDeCredencial', () => {
  it('guarda el acceso y la renovación, cada una con su valor', () => {
    const cookies = cookiesDeCredencial(credencial, true)

    expect(cookies.map((c) => [c.nombre, c.valor])).toEqual([
      ['__Host-nomadas_acceso', 'cabecera.cuerpo.firma'],
      ['__Host-nomadas_renovacion', 'renovacion_Secreta-123'],
    ])
  })

  it.each([true, false])('todas son httpOnly, SameSite=Lax y de toda la web (producción: %s)', (produccion) => {
    for (const cookie of cookiesDeCredencial(credencial, produccion)) {
      expect(cookie.opciones).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
      // Una cookie con Domain se manda también a los subdominios: no se pone
      expect(cookie.opciones).not.toHaveProperty('domain')
    }
  })

  it('en producción son Secure; en desarrollo no, para poder usar http://localhost', () => {
    expect(cookiesDeCredencial(credencial, true).every((c) => c.opciones.secure)).toBe(true)
    expect(cookiesDeCredencial(credencial, false).every((c) => !c.opciones.secure)).toBe(true)
  })

  it('el acceso caduca poco antes que el token, para renovar a tiempo; la renovación dura 30 días', () => {
    const [acceso, renovacion] = cookiesDeCredencial(credencial, true)

    expect(acceso?.opciones.maxAge).toBe(870)
    expect(renovacion?.opciones.maxAge).toBe(30 * 24 * 60 * 60)
  })

  it('un acceso de muy poca duración no produce una cookie ya caducada', () => {
    const [acceso] = cookiesDeCredencial({ ...credencial, expiraEnSegundos: 10 }, true)

    expect(acceso?.opciones.maxAge).toBeGreaterThanOrEqual(1)
  })
})

describe('cookiesABorrar', () => {
  it('vacía las dos cookies con la misma configuración y duración cero', () => {
    const cookies = cookiesABorrar(true)

    expect(cookies.map((c) => c.nombre)).toEqual(['__Host-nomadas_acceso', '__Host-nomadas_renovacion'])
    for (const cookie of cookies) {
      expect(cookie.valor).toBe('')
      // Para que el navegador la borre, el path (y Secure en las __Host-) tienen que ser los mismos que al crearla
      expect(cookie.opciones).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 0 })
    }
  })
})

describe('sesionDeCookies', () => {
  const lector = (valores: Record<string, string>) => (nombre: string) => valores[nombre]

  it('lee el acceso y la renovación guardados', () => {
    const lee = lector({ '__Host-nomadas_acceso': 'a.b.c', '__Host-nomadas_renovacion': 'renovacion-1' })

    expect(sesionDeCookies(lee, true)).toEqual({ acceso: 'a.b.c', renovacion: 'renovacion-1' })
  })

  it('lo que falta queda sin definir: el acceso caduca antes que la renovación', () => {
    expect(sesionDeCookies(lector({ nomadas_renovacion: 'r1' }), false)).toEqual({ acceso: undefined, renovacion: 'r1' })
    expect(sesionDeCookies(lector({}), false)).toEqual({ acceso: undefined, renovacion: undefined })
  })

  it('ignora las cookies del otro entorno', () => {
    expect(sesionDeCookies(lector({ nomadas_acceso: 'a', nomadas_renovacion: 'r' }), true)).toEqual({
      acceso: undefined,
      renovacion: undefined,
    })
  })

  it.each([
    ['con un espacio', 'a b'],
    ['con un salto de línea (inyectaría otra cabecera)', 'a\r\nX-Evil: 1'],
    ['con comillas', '"abc"'],
    ['con punto y coma', 'a;b'],
    ['con tildes', 'clavé'],
    ['vacío', ''],
    ['demasiado largo', 'a'.repeat(2049)],
  ])('un valor %s se trata como si no estuviera', (_nombre, valor) => {
    const lee = lector({ nomadas_acceso: valor, nomadas_renovacion: valor })

    expect(sesionDeCookies(lee, false)).toEqual({ acceso: undefined, renovacion: undefined })
  })

  it('acepta los caracteres de un JWT y de un token opaco, hasta el máximo', () => {
    const largo = 'A'.repeat(2048)

    expect(sesionDeCookies(lector({ nomadas_acceso: largo }), false).acceso).toBe(largo)
    expect(sesionDeCookies(lector({ nomadas_acceso: 'aB3-_.~+/=' }), false).acceso).toBe('aB3-_.~+/=')
  })
})
