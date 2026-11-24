import { describe, expect, it } from 'vitest'
import { LIMITE_SOBRE_MI } from '../domain/sobreMi'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'

function claves(objeto: object, prefijo = ''): string[] {
  return Object.entries(objeto).flatMap(([clave, valor]) =>
    typeof valor === 'object' && valor !== null ? claves(valor, `${prefijo}${clave}.`) : [`${prefijo}${clave}`],
  )
}

describe('idiomas del perfil', () => {
  it('en y pt tienen exactamente las claves de es', () => {
    expect(claves(en)).toEqual(claves(es))
    expect(claves(pt)).toEqual(claves(es))
  })

  it('la página «Ver como me ven» tiene todos sus textos escritos en cada idioma', () => {
    for (const textos of [es, en, pt]) {
      for (const texto of claves(textos.publico).map((clave) => clave.split('.').reduce<unknown>((valor, parte) => (valor as Record<string, unknown>)[parte], textos.publico))) {
        expect((texto as string).trim()).not.toBe('')
      }
    }
  })

  it('los textos con variables las llevan en todos los idiomas', () => {
    for (const textos of [es, en, pt]) {
      expect(textos.editarEn).toContain('{paso}')
      expect(textos.sobreMi.ayuda).toContain('{max}')
      expect(textos.sobreMi.errorTextoLargo).toContain('{max}')
      expect(textos.trayectoria.contador).toContain('{n}')
      expect(textos.trayectoria.contador).toContain('{max}')
      expect(textos.trayectoria.errores.textoLargo).toContain('{max}')
      expect(textos.trayectoria.errores.demasiadas).toContain('{max}')
      expect(textos.evidencia.contador).toContain('{n}')
      expect(textos.evidencia.contador).toContain('{max}')
      expect(textos.evidencia.errores.enlaceLargo).toContain('{max}')
      expect(textos.evidencia.errores.demasiados).toContain('{max}')
      expect(textos.habilidades.nivel).toContain('{n}')
      expect(textos.tareas.titulo).toContain('{n}')
      expect(textos.tareas.titulo).toContain('{total}')
      expect(textos.avance.titulo).toContain('{n}')
      expect(textos.avance.titulo).toContain('{total}')
    }
  })

  it('el aviso de cuántos caracteres cabe en «Sobre mí» no inventa otro número', () => {
    for (const textos of [es, en, pt]) expect(textos.sobreMi.ayuda).not.toMatch(/\d/)
    expect(LIMITE_SOBRE_MI).toBe(600)
  })
})
