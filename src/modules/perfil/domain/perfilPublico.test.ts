import { describe, expect, it } from 'vitest'
import type { HabilidadPerfil, Perfil } from './perfil'
import { HABILIDADES_PUBLICAS, perfilPublico } from './perfilPublico'

function habilidad(nombre: string, nivel: number): HabilidadPerfil {
  return { nombre, nivel, estimado: false, resumen: 'Varias veces · 1 a 3 años' }
}

// Un perfil con de todo: cada prueba cambia solo lo que le importa
function perfil(cambios: Partial<Perfil> = {}): Perfil {
  return {
    ficha: { nombre: 'Ana', apellidos: 'Torres', ciudad: 'Lima', pais: 'Perú', iniciales: 'AT', areas: ['Tecnología'], modalidad: 'Híbrida' },
    buscando: ['Un socio comercial'],
    habilidades: [habilidad('Desarrollo web', 5), habilidad('Estrategia de producto', 3), habilidad('Marketing digital', 3), habilidad('Gestión de proyectos', 1)],
    tareas: { total: 40, grupos: [{ grupo: 'Construir con tecnología', tareas: [{ texto: 'Programar una página web', veces: 'Es mi trabajo' }] }] },
    historias: [
      { pregunta: 'Algo que lograste', texto: 'Armé una tienda.', aceptaMostrar: true },
      { pregunta: 'Un problema difícil', texto: 'Falló un proveedor.', aceptaMostrar: false },
    ],
    sectores: { pregunta: 'Sectores que te mueven', respuestas: ['Educación'] },
    forma: [{ pregunta: '¿Cuándo quieres arrancar?', respuestas: ['Ya mismo'] }],
    buscaPerfil: { pregunta: '¿Qué perfil buscas para tu equipo?', respuestas: ['Ventas y Marketing'] },
    socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: 'Alguien que venda.' },
    sobreMi: 'Programo desde hace cuatro años.',
    trayectoria: [{ desde: 2022, rol: 'Dev', donde: 'Mi proyecto', que: '' }],
    evidencia: ['https://anatorres.example/tienda'],
    ...cambios,
  }
}

describe('perfilPublico', () => {
  it('no muestra las tareas marcadas', () => {
    expect(perfilPublico(perfil())).not.toHaveProperty('tareas')
  })

  it('solo muestra las historias que la persona aceptó mostrar', () => {
    expect(perfilPublico(perfil()).historias).toEqual([{ pregunta: 'Algo que lograste', texto: 'Armé una tienda.' }])
  })

  it('sin permiso en ninguna historia, no sale ninguna', () => {
    const sinPermiso = perfil({ historias: [{ pregunta: 'Algo que lograste', texto: 'Armé una tienda.', aceptaMostrar: false }] })
    expect(perfilPublico(sinPermiso).historias).toEqual([])
  })

  it('una historia con permiso pero sin texto no sale', () => {
    const vacia = perfil({ historias: [{ pregunta: 'Algo que lograste', texto: '  \n ', aceptaMostrar: true }] })
    expect(perfilPublico(vacia).historias).toEqual([])
  })

  it('las historias que salen no llevan la marca de permiso', () => {
    expect(perfilPublico(perfil()).historias[0]).not.toHaveProperty('aceptaMostrar')
  })

  it('muestra como mucho las tres habilidades más fuertes, en su orden', () => {
    expect(HABILIDADES_PUBLICAS).toBe(3)
    expect(perfilPublico(perfil()).habilidades.map((h) => h.nombre)).toEqual(['Desarrollo web', 'Estrategia de producto', 'Marketing digital'])
  })

  it('con menos de tres habilidades, las que haya', () => {
    expect(perfilPublico(perfil({ habilidades: [habilidad('Desarrollo web', 5)] })).habilidades).toHaveLength(1)
  })

  it('conserva lo demás tal cual', () => {
    const original = perfil()
    const publico = perfilPublico(original)
    expect(publico.ficha).toEqual(original.ficha)
    expect(publico.sobreMi).toBe(original.sobreMi)
    expect(publico.trayectoria).toEqual(original.trayectoria)
    expect(publico.evidencia).toEqual(original.evidencia)
    expect(publico.buscando).toEqual(original.buscando)
    expect(publico.sectores).toEqual(original.sectores)
    expect(publico.forma).toEqual(original.forma)
    expect(publico.buscaPerfil).toEqual(original.buscaPerfil)
    expect(publico.socioIdeal).toEqual(original.socioIdeal)
  })

  it('no cambia el perfil original', () => {
    const original = perfil()
    const copia = structuredClone(original)
    perfilPublico(original)
    expect(original).toEqual(copia)
  })
})
