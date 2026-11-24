import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Historia } from '../../domain/Historia'
import { SeccionHistorias, type SeccionHistoriasProps } from './SeccionHistorias'

function historia(clave: string, nombre: string, cambios: Partial<Historia> = {}): Historia {
  return {
    clave,
    nombre,
    anio: 1976,
    areaFondo: 'marketing',
    combinacion: `Combinación de ${nombre}`,
    frase: { inicio: `Frase de ${nombre} con`, resaltado: 'una parte', fin: ' resaltada.' },
    personas: [
      { iniciales: 'AA', nombre: `Ana de ${nombre}`, area: 'marketing', aporte: 'Ventas' },
      { iniciales: 'BB', nombre: `Beto de ${nombre}`, area: 'tecnologia', aporte: 'Ingeniería' },
    ],
    parrafos: [`Primer párrafo de ${nombre}.`, `Segundo párrafo de ${nombre}.`],
    fuentes: [{ texto: `Fuente de ${nombre}`, href: `https://example.com/${clave}` }],
    ...cambios,
  }
}

const props: SeccionHistoriasProps = {
  textos: {
    etiqueta: 'Historias',
    tituloInicio: 'Los grandes proyectos empezaron con',
    tituloResaltado: 'un encuentro.',
    etiquetaLista: 'Elige una historia',
    etiquetaPersonas: 'Quiénes son',
    leer: 'Leer la historia',
    cerrar: 'Cerrar la historia',
    fuente: 'Fuente',
    fuentes: 'Fuentes',
    fuenteNueva: 'se abre en otra pestaña',
    cierre: 'Tu historia también puede empezar así.',
  },
  historias: [historia('apple', 'Apple'), historia('airbnb', 'Airbnb', { areaFondo: 'tecnologia' }), historia('nike', 'Nike', { areaFondo: 'operaciones' })],
  textoBoton: 'Encuentra a tu equipo',
  hrefBoton: '/es/registro',
}

afterEach(() => vi.useRealTimers())

describe('SeccionHistorias', () => {
  it('muestra la etiqueta, el título y la primera historia con su frase y sus personas', () => {
    render(<SeccionHistorias {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Los grandes proyectos empezaron con un encuentro.' })).toBeInTheDocument()
    expect(screen.getByText('Historias')).toBeInTheDocument()
    expect(screen.getByText(/Frase de Apple con/)).toBeInTheDocument()
    expect(screen.getByText('una parte').tagName).toBe('EM')
    expect(screen.getByRole('list', { name: 'Quiénes son' })).toHaveTextContent('Ana de Apple')
    expect(screen.getByText('1976')).toBeInTheDocument()
  })

  it('la sección se llama por su título, y el nombre enorme de fondo es adorno que no se anuncia', () => {
    render(<SeccionHistorias {...props} />)
    expect(screen.getByRole('region', { name: /Los grandes proyectos empezaron con/ })).toBeInTheDocument()
    const adorno = screen.getAllByText('Apple').find((nodo) => nodo.getAttribute('aria-hidden') === 'true')
    expect(adorno).toBeDefined()
  })

  it('el color de la sección es el del área de la historia que se ve, y cambia con ella', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    const seccion = screen.getByRole('region', { name: /Los grandes proyectos/ })
    expect(seccion).toHaveAttribute('data-area', 'marketing')
    expect(seccion.className).toContain('bg-degradado-azul')
    await usuario.click(screen.getByRole('tab', { name: /Airbnb/ }))
    expect(seccion).toHaveAttribute('data-area', 'tecnologia')
    expect(seccion.className).toContain('bg-degradado-amarillo')
    expect(seccion.className).toContain('transicion-color')
  })

  it('al elegir otra historia se ve la suya y la pestaña elegida queda seleccionada con el foco', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    await usuario.click(screen.getByRole('tab', { name: /Nike/ }))
    expect(screen.getByText(/Frase de Nike con/)).toBeInTheDocument()
    expect(screen.queryByText(/Frase de Apple con/)).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Nike/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Nike/ })).toHaveFocus()
  })

  it('el panel está asociado a la pestaña activa', () => {
    render(<SeccionHistorias {...props} />)
    const panel = screen.getByRole('tabpanel')
    const pestana = screen.getByRole('tab', { name: /Apple/ })
    expect(panel).toHaveAttribute('aria-labelledby', pestana.id)
    expect(pestana).toHaveAttribute('aria-controls', panel.id)
  })

  it('al cambiar de historia, el panel pasa a estar asociado a la pestaña elegida', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    await usuario.click(screen.getByRole('tab', { name: /Nike/ }))
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', screen.getByRole('tab', { name: /Nike/ }).id)
  })

  it('la frase se lee entera, con su parte resaltada en medio y lo que sigue después', () => {
    render(<SeccionHistorias {...props} />)
    const frase = screen.getByText('una parte').closest('p')!
    expect(frase).toHaveTextContent('Frase de Apple con una parte resaltada.')
  })

  it('«Leer la historia» abre el texto con las personas y la fuente, y «Cerrar la historia» lo cierra', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    const boton = screen.getByRole('button', { name: 'Leer la historia' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    const detalle = document.getElementById(boton.getAttribute('aria-controls')!)!
    expect(detalle).toHaveAttribute('data-abierto', 'false')
    expect(detalle.querySelector('[inert]')).not.toBeNull()

    await usuario.click(boton)
    expect(boton).toHaveTextContent('Cerrar la historia')
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(detalle).toHaveAttribute('data-abierto', 'true')
    expect(detalle.querySelector('[inert]')).toBeNull()
    expect(within(detalle).getByText('Primer párrafo de Apple.')).toBeInTheDocument()
    expect(within(detalle).getByText('Segundo párrafo de Apple.')).toBeInTheDocument()

    await usuario.click(boton)
    expect(boton).toHaveTextContent('Leer la historia')
    expect(detalle).toHaveAttribute('data-abierto', 'false')
  })

  it('el foco se queda en el botón al abrir y cerrar', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    const boton = screen.getByRole('button', { name: 'Leer la historia' })
    await usuario.click(boton)
    expect(boton).toHaveFocus()
    await usuario.click(boton)
    expect(boton).toHaveFocus()
  })

  it('cambiar de historia cierra el texto', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    await usuario.click(screen.getByRole('button', { name: 'Leer la historia' }))
    await usuario.click(screen.getByRole('tab', { name: /Airbnb/ }))
    expect(screen.getByRole('button', { name: 'Leer la historia' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('la fuente es un enlace seguro que se abre en otra pestaña y lo dice a quien usa lector de pantalla', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    await usuario.click(screen.getByRole('button', { name: 'Leer la historia' }))
    const lista = screen.getByRole('list', { name: 'Fuente' })
    const enlace = within(lista).getByRole('link', { name: /Fuente de Apple/ })
    expect(enlace).toHaveAttribute('href', 'https://example.com/apple')
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace.getAttribute('rel')).toContain('noopener')
    expect(enlace).toHaveAccessibleName(/se abre en otra pestaña/)
  })

  it('con varias fuentes el rótulo va en plural, cada una en su línea, y es un enlace seguro que se abre en otra pestaña', async () => {
    const usuario = userEvent.setup()
    const dos = historia('apple', 'Apple', {
      fuentes: [
        { texto: 'Primera fuente', href: 'https://example.com/uno' },
        { texto: 'Segunda fuente', href: 'https://example.com/dos' },
      ],
    })
    render(<SeccionHistorias {...props} historias={[dos]} />)
    await usuario.click(screen.getByRole('button', { name: 'Leer la historia' }))
    const lista = screen.getByRole('list', { name: 'Fuentes' })
    const primera = within(lista).getByRole('link', { name: /Primera fuente/ })
    const segunda = within(lista).getByRole('link', { name: /Segunda fuente/ })
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2)
    expect(primera.closest('li')).not.toBe(segunda.closest('li'))
    for (const [enlace, href] of [[primera, 'https://example.com/uno'], [segunda, 'https://example.com/dos']] as const) {
      expect(enlace).toHaveAttribute('href', href)
      expect(enlace).toHaveAttribute('target', '_blank')
      expect(enlace).toHaveAccessibleName(/se abre en otra pestaña/)
    }
  })

  it('al abrir la historia no se repiten las personas: su nombre y su aporte salen una sola vez, en los círculos', async () => {
    const usuario = userEvent.setup()
    render(<SeccionHistorias {...props} />)
    await usuario.click(screen.getByRole('button', { name: 'Leer la historia' }))
    expect(screen.getAllByText('Ana de Apple')).toHaveLength(1)
    expect(screen.getAllByText('Ventas')).toHaveLength(1)
    expect(within(screen.getByRole('list', { name: 'Quiénes son' })).getByText('Ana de Apple')).toBeInTheDocument()
  })

  it('cierra con la llamada a la acción, que lleva donde se le diga', () => {
    render(<SeccionHistorias {...props} />)
    expect(screen.getByText('Tu historia también puede empezar así.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Encuentra a tu equipo' })).toHaveAttribute('href', '/es/registro')
  })

  it('no cambia de historia sola: pasa el tiempo y sigue en la misma', () => {
    vi.useFakeTimers()
    render(<SeccionHistorias {...props} />)
    vi.advanceTimersByTime(120_000)
    expect(screen.getByRole('tab', { name: /Apple/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('sin historias no dibuja nada', () => {
    const { container } = render(<SeccionHistorias {...props} historias={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('con una sola historia no hay nada entre lo que elegir pero sí se lee', () => {
    render(<SeccionHistorias {...props} historias={[props.historias[0]!]} />)
    expect(screen.getByText(/Frase de Apple con/)).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(1)
  })
})
