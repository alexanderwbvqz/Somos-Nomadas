import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Perfil } from '../domain/perfil'
import { perfilPublico } from '../domain/perfilPublico'
import { textosPerfil } from '../language'
import { PerfilPublicoView } from './PerfilPublicoView'

const textos = textosPerfil('es')

function perfilDePrueba(cambios: Partial<Perfil> = {}): Perfil {
  return {
    ficha: { nombre: 'Ana', apellidos: 'Torres', ciudad: 'Lima', pais: 'Perú', iniciales: 'AT', areas: ['Tecnología'], modalidad: 'Híbrida' },
    buscando: ['Un socio comercial'],
    habilidades: [
      {
        nombre: 'Desarrollo web',
        nivel: 5,
        estimado: false,
        resumen: 'Es mi trabajo · Más de 5 años',
        detalle: {
          respuestas: [{ pregunta: '¿Con qué tecnologías trabajas?', respuestas: ['React', 'Node.js'] }],
          texto: { pregunta: 'Cuéntanos algo que hayas construido', texto: 'Hice una tienda en línea.' },
        },
      },
      { nombre: 'Visualización', nivel: 1, estimado: true, resumen: 'Una vez · sin indicar tiempo' },
    ],
    tareas: { total: 40, grupos: [{ grupo: 'Construir con tecnología', tareas: [{ texto: 'Programar una página web', veces: 'Es mi trabajo' }] }] },
    historias: [
      { pregunta: 'Algo que lograste', texto: 'Armé una tienda.', aceptaMostrar: true },
      { pregunta: 'Un problema difícil', texto: 'Falló un proveedor.', aceptaMostrar: false },
    ],
    sectores: { pregunta: 'Sectores que te mueven', respuestas: ['Educación', 'Fintech'] },
    forma: [{ pregunta: '¿Cuándo quieres arrancar?', respuestas: ['Ya mismo'] }],
    buscaPerfil: { pregunta: '¿Qué perfil buscas para tu equipo?', respuestas: ['Ventas y Marketing'] },
    socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: 'Alguien que venda.' },
    sobreMi: 'Programo desde hace cuatro años.',
    trayectoria: [
      { desde: 2022, rol: 'Desarrolladora web', donde: 'Mi proyecto', que: 'Programé la tienda.' },
      { desde: 2020, hasta: 2022, rol: 'Desarrolladora', donde: 'Estudio digital', que: '' },
    ],
    evidencia: ['https://anatorres.example/tienda'],
    ...cambios,
  }
}

function montar(cambios: Partial<Perfil> = {}) {
  return render(<PerfilPublicoView textos={textos} perfil={perfilPublico(perfilDePrueba(cambios))} hrefVolver="/es/perfil" />)
}

const titulosDeBloques = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)

describe('PerfilPublicoView', () => {
  it('el nombre es el título de la página y dice dónde vive y en qué área cae', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Torres' })).toBeInTheDocument()
    expect(screen.getByText('Lima, Perú · Híbrida')).toBeInTheDocument()
    expect(screen.getByText('Tecnología')).toBeInTheDocument()
  })

  it('no anuncia las iniciales: ya está el nombre', () => {
    montar()
    expect(screen.queryByRole('img', { name: textos.ficha.avatar })).not.toBeInTheDocument()
  })

  it('tiene un enlace para volver a Mi perfil y avisa de que aquí no se edita', () => {
    montar()
    expect(screen.getByRole('link', { name: /Volver a Mi perfil/ })).toHaveAttribute('href', '/es/perfil')
    expect(screen.getByText(textos.publico.aviso)).toBeInTheDocument()
  })

  it('los bloques van en el mismo orden que en Mi perfil', () => {
    montar()
    expect(titulosDeBloques()).toEqual(['Sobre mí', 'Trayectoria', 'Evidencia', 'Qué busca', 'Historias', 'Habilidades', 'Forma de emprender'])
  })

  it('no hay nada que editar', () => {
    montar()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument()
  })

  it('no enseña las tareas marcadas', () => {
    montar()
    expect(screen.queryByText('Programar una página web')).not.toBeInTheDocument()
    expect(screen.queryByText(/Tareas que has hecho/)).not.toBeInTheDocument()
  })

  it('solo enseña las historias con permiso', () => {
    montar()
    expect(screen.getByText('Armé una tienda.')).toBeInTheDocument()
    expect(screen.queryByText('Falló un proveedor.')).not.toBeInTheDocument()
  })

  it('los rótulos de los sectores, del perfil que busca y del socio ideal están pensados para quien lee', () => {
    montar()
    expect(screen.getByText('Sectores que le mueven')).toBeInTheDocument()
    expect(screen.getByText('¿Qué perfil busca para su equipo?')).toBeInTheDocument()
    expect(screen.getByText('¿Cómo es su socio ideal?')).toBeInTheDocument()
    expect(screen.queryByText('Sectores que te mueven')).not.toBeInTheDocument()
    expect(screen.queryByText('¿Cómo es tu socio ideal?')).not.toBeInTheDocument()
  })

  it('las habilidades salen abiertas, con su nivel dicho en palabras, y la estimada lo dice', () => {
    montar()
    const habilidades = within(screen.getByRole('region', { name: 'Habilidades' }))
    expect(habilidades.getByRole('heading', { level: 3, name: /Desarrollo web/ })).toBeInTheDocument()
    expect(habilidades.getByRole('img', { name: 'Nivel 5 de 5' })).toBeInTheDocument()
    expect(habilidades.getByText('React')).toBeInTheDocument()
    expect(habilidades.getByText('Hice una tienda en línea.')).toBeInTheDocument()
    expect(habilidades.getByText('Estimado')).toBeInTheDocument()
    expect(habilidades.getByRole('img', { name: 'Nivel 1 de 5' })).toBeInTheDocument()
  })

  it('la trayectoria dice «hoy» donde falta el año de término', () => {
    montar()
    const trayectoria = within(screen.getByRole('region', { name: 'Trayectoria' }))
    expect(trayectoria.getByText('2022 – hoy')).toBeInTheDocument()
    expect(trayectoria.getByText('2020 – 2022')).toBeInTheDocument()
  })

  it('los enlaces de evidencia se abren en otra pestaña sin dar acceso a esta página', () => {
    montar()
    const enlace = screen.getByRole('link', { name: 'https://anatorres.example/tienda' })
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace.getAttribute('rel')).toContain('noopener')
    expect(enlace.getAttribute('rel')).toContain('nofollow')
  })

  it('un perfil con poco escrito deja fuera los bloques vacíos, sin invitar a completarlos', () => {
    montar({ sobreMi: '  ', trayectoria: [], evidencia: [], historias: [], sectores: { pregunta: 'Sectores que te mueven', respuestas: [] }, forma: [], buscaPerfil: { pregunta: '¿Qué perfil buscas para tu equipo?', respuestas: [] }, socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: '' } })
    expect(titulosDeBloques()).toEqual(['Qué busca', 'Habilidades'])
    expect(screen.queryByText(textos.sinEscribir)).not.toBeInTheDocument()
    expect(screen.queryByText(textos.sobreMi.vacio)).not.toBeInTheDocument()
  })

  it('si solo hay sectores, el bloque de historias los enseña sin separador', () => {
    montar({ historias: [{ pregunta: 'Algo que lograste', texto: 'Armé una tienda.', aceptaMostrar: false }] })
    const historias = screen.getByRole('region', { name: 'Historias' })
    expect(within(historias).getByText('Educación')).toBeInTheDocument()
    expect(within(historias).queryByText('Armé una tienda.')).not.toBeInTheDocument()
    expect(historias.querySelector('hr')).not.toBeInTheDocument()
  })

  it('en inglés usa los textos de ese idioma', () => {
    render(<PerfilPublicoView textos={textosPerfil('en')} perfil={perfilPublico(perfilDePrueba())} hrefVolver="/en/perfil" />)
    expect(screen.getByRole('link', { name: /Back to My profile/ })).toHaveAttribute('href', '/en/perfil')
    expect(screen.getByRole('heading', { level: 2, name: 'Stories' })).toBeInTheDocument()
  })
})
