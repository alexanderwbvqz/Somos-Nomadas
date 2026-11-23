import { describe, expect, it } from 'vitest'
import {
  datosMaterialVacios,
  errorDeArchivo,
  esEnlaceValido,
  LIMITES_MATERIAL,
  limpiarEnlaces,
  normalizarEnlace,
  validarMaterial,
  type DatosMaterial,
} from './material'

const pdf = { nombre: 'cv.pdf', tamano: 1000, tipo: 'application/pdf' }

function conWeb(): DatosMaterial {
  return { ...datosMaterialVacios(), web: 'https://tuweb.com', aceptaAnalisis: true }
}

describe('normalizarEnlace', () => {
  it('añade https si no trae esquema y respeta el que traiga', () => {
    expect(normalizarEnlace('tuweb.com')).toBe('https://tuweb.com')
    expect(normalizarEnlace('  http://tuweb.com ')).toBe('http://tuweb.com')
    expect(normalizarEnlace('   ')).toBe('')
  })
})

describe('esEnlaceValido', () => {
  it('acepta páginas públicas, con o sin esquema', () => {
    expect(esEnlaceValido('https://github.com/ana')).toBe(true)
    expect(esEnlaceValido('tuweb.com/portafolio')).toBe(true)
  })

  it('rechaza lo que no es una página web', () => {
    for (const malo of ['hola', 'javascript:alert(1)', 'ftp://tuweb.com', 'https://', 'mailto:ana@correo.com']) {
      expect(esEnlaceValido(malo), malo).toBe(false)
    }
  })

  it('rechaza direcciones internas: IP sueltas, localhost y nombres locales', () => {
    for (const interno of ['http://127.0.0.1', 'http://192.168.1.10/panel', 'http://[::1]/', 'http://localhost:3000', 'https://servidor.local', 'https://app.internal', 'https://metadata']) {
      expect(esEnlaceValido(interno), interno).toBe(false)
    }
  })

  it('rechaza enlaces con usuario y contraseña', () => {
    expect(esEnlaceValido('https://ana:clave@tuweb.com')).toBe(false)
  })
})

describe('errorDeArchivo', () => {
  it('acepta un PDF dentro del tamaño', () => {
    expect(errorDeArchivo(pdf)).toBeUndefined()
    expect(errorDeArchivo({ nombre: 'CV.PDF', tamano: 10, tipo: '' })).toBeUndefined()
  })

  it('rechaza lo que no es PDF o está vacío', () => {
    expect(errorDeArchivo({ nombre: 'foto.png', tamano: 10, tipo: 'image/png' })).toBe('archivoNoPdf')
    expect(errorDeArchivo({ nombre: 'cv.pdf', tamano: 0, tipo: 'application/pdf' })).toBe('archivoNoPdf')
  })

  it('rechaza un PDF que pasa del tamaño, y acepta uno justo en el límite', () => {
    expect(errorDeArchivo({ ...pdf, tamano: LIMITES_MATERIAL.pdfBytes + 1 })).toBe('archivoGrande')
    expect(errorDeArchivo({ ...pdf, tamano: LIMITES_MATERIAL.pdfBytes })).toBeUndefined()
  })
})

describe('validarMaterial', () => {
  it('acepta un enlace con el permiso', () => {
    expect(validarMaterial(conWeb())).toEqual({})
  })

  it('acepta solo un PDF con el permiso', () => {
    expect(validarMaterial({ ...datosMaterialVacios(), archivo: pdf, aceptaAnalisis: true })).toEqual({})
  })

  it('sin nada subido ni pegado pide material, y sin permiso pide el permiso', () => {
    expect(validarMaterial(datosMaterialVacios())).toEqual({ material: 'sinMaterial', aceptaAnalisis: 'faltaPermiso' })
  })

  it('con material pero sin permiso, solo falta el permiso', () => {
    expect(validarMaterial({ ...conWeb(), aceptaAnalisis: false })).toEqual({ aceptaAnalisis: 'faltaPermiso' })
  })

  it('señala el enlace que está mal y no los demás', () => {
    expect(validarMaterial({ ...conWeb(), github: 'esto no es un enlace' })).toEqual({ github: 'enlaceInvalido' })
  })

  it('un enlace demasiado largo es un error aparte', () => {
    const largo = `https://tuweb.com/${'a'.repeat(LIMITES_MATERIAL.enlaceLargo)}`
    expect(validarMaterial({ ...conWeb(), otro: largo })).toEqual({ otro: 'enlaceLargo' })
  })

  it('el error de un PDF malo no se tapa por haber enlaces', () => {
    expect(validarMaterial({ ...conWeb(), archivo: { ...pdf, tipo: 'image/png', nombre: 'foto.png' } })).toEqual({ archivo: 'archivoNoPdf' })
  })
})

describe('limpiarEnlaces', () => {
  it('normaliza, quita los vacíos y no repite', () => {
    const datos: DatosMaterial = { ...datosMaterialVacios(), web: 'tuweb.com', github: '  ', otro: 'https://tuweb.com' }
    expect(limpiarEnlaces(datos)).toEqual([{ campo: 'web', url: 'https://tuweb.com' }])
  })
})
