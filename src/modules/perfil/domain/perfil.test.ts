import { describe, expect, it } from 'vitest'
import { capasDelPerfil, type Perfil } from './perfil'

// Un perfil mínimo con las tres capas hechas: cada prueba cambia solo lo que le importa
function perfil(cambios: Partial<Perfil> = {}): Perfil {
  return {
    ficha: { nombre: 'Ana', apellidos: 'Torres', ciudad: 'Lima', pais: 'Perú', iniciales: 'AT', areas: ['Tecnología'] },
    buscando: [],
    habilidades: [],
    tareas: { total: 30, grupos: [{ grupo: 'Construir con tecnología', tareas: [{ texto: 'Programar una página web', veces: 'Es mi trabajo' }] }] },
    historias: [],
    sectores: [],
    forma: [],
    buscaPerfil: [],
    socioIdeal: '',
    sobreMi: 'Programo desde hace cuatro años.',
    trayectoria: [{ desde: 2022, rol: 'Dev', donde: 'Mi proyecto', que: '' }],
    evidencia: ['https://anatorres.example/tienda'],
    ...cambios,
  }
}
const hechas = (p: Perfil) => capasDelPerfil(p).filter((capa) => capa.hecha).map((capa) => capa.id)

describe('capasDelPerfil', () => {
  it('con el recorrido contado, Sobre mí escrito y enlaces, están las tres', () => {
    expect(capasDelPerfil(perfil())).toEqual([
      { id: 'recorrido', hecha: true },
      { id: 'sobreMi', hecha: true },
      { id: 'evidencia', hecha: true },
    ])
  })

  it('sin Sobre mí ni enlaces solo cuenta el recorrido', () => {
    expect(hechas(perfil({ sobreMi: '', evidencia: [] }))).toEqual(['recorrido'])
  })

  it('un Sobre mí de solo espacios no cuenta', () => {
    expect(hechas(perfil({ sobreMi: '   \n ' }))).not.toContain('sobreMi')
  })

  it('sin tareas marcadas, el recorrido no está hecho', () => {
    expect(hechas(perfil({ tareas: { total: 30, grupos: [] } }))).not.toContain('recorrido')
    expect(hechas(perfil({ tareas: { total: 30, grupos: [{ grupo: 'Definir y organizar', tareas: [] }] } }))).not.toContain('recorrido')
  })

  it('la trayectoria no es una capa: tenerla o no no cambia lo que falta', () => {
    expect(capasDelPerfil(perfil({ trayectoria: [] }))).toEqual(capasDelPerfil(perfil()))
    expect(capasDelPerfil(perfil()).map((capa) => capa.id)).not.toContain('trayectoria')
  })
})
