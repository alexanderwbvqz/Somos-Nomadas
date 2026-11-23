import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DetalleAliadoConectado, metadatosDetalleAliado } from './DetalleAliadoConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: 'es' | 'en' | 'pt', id: string) {
  return render(await DetalleAliadoConectado({ idioma, id }))
}

describe('DetalleAliadoConectado', () => {
  it('un aliado con detalle completo muestra cabecera, contenido, ficha con contacto y más aliados', async () => {
    await dibujar('es', 'mentoria-producto')
    expect(screen.getByRole('heading', { level: 1, name: 'Mentoría en producto' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Quién es' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Datos clave' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo trabajar con este aliado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Agendar una llamada' })).toHaveAttribute('href', 'https://agenda.example/mentoria-producto')
    expect(screen.getByRole('link', { name: 'Escribir por WhatsApp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/51000000001\?text=/)
  })

  it('los más aliados son otros del mismo tipo, sin el propio, y enlazan a su página', async () => {
    await dibujar('es', 'mentoria-producto')
    const mas = screen.getByRole('region', { name: 'Más aliados de este tipo' })
    const nombres = Array.from(mas.querySelectorAll('h3')).map((h) => h.textContent)
    expect(nombres).toEqual(['Mentoría en ventas', 'Mentoría financiera', 'Mentoría en operaciones'])
    expect(within(mas).getAllByRole('link', { name: 'Leer más' })[0]).toHaveAttribute('href', '/es/aliados/mentoria-ventas')
  })

  it('un aliado con solo agenda muestra solo ese botón', async () => {
    await dibujar('es', 'mentoria-ventas')
    expect(screen.getByRole('link', { name: 'Agendar una llamada' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Escribir por WhatsApp' })).not.toBeInTheDocument()
  })

  it('un aliado con solo WhatsApp muestra solo ese botón', async () => {
    await dibujar('es', 'comunidad-brujula')
    expect(screen.getByRole('link', { name: 'Escribir por WhatsApp' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agendar una llamada' })).not.toBeInTheDocument()
  })

  it('un aliado con lo mínimo muestra su cabecera y su ficha, sin contenido ni botones', async () => {
    await dibujar('es', 'casa-emprende')
    expect(screen.getByRole('heading', { level: 1, name: 'Casa Emprende' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Quién es' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Cómo trabajar con este aliado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agendar una llamada' })).not.toBeInTheDocument()
    // El tipo sale en la cabecera y en la ficha (y también en las tarjetas de "más aliados")
    expect(within(screen.getByRole('region', { name: 'Casa Emprende' })).getByText('Organizador')).toBeInTheDocument()
    expect(within(screen.getByRole('complementary')).getByText('Organizador')).toBeInTheDocument()
  })

  it('en inglés y portugués las etiquetas salen en su idioma, con los textos del aliado tal cual', async () => {
    const { unmount } = await dibujar('en', 'mentoria-producto')
    expect(screen.getByRole('heading', { level: 2, name: 'Who they are' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Book a call' })).toBeInTheDocument()
    unmount()
    await dibujar('pt', 'mentoria-producto')
    expect(screen.getByRole('heading', { level: 2, name: 'Quem é' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escrever pelo WhatsApp' })).toBeInTheDocument()
  })

  it('un identificador que no existe no tiene página (404)', async () => {
    await expect(DetalleAliadoConectado({ idioma: 'es', id: 'no-existe' })).rejects.toThrow()
  })
})

describe('metadatosDetalleAliado', () => {
  it('el título lleva el nombre del aliado y la descripción es la suya', async () => {
    const metadatos = await metadatosDetalleAliado('es', 'cowork-plaza')
    expect(metadatos?.titulo).toBe('Cowork Plaza | Nómadas')
    expect(metadatos?.descripcion).toContain('Espacio de trabajo y eventos')
  })

  it('para un aliado inexistente no hay metadatos', async () => {
    expect(await metadatosDetalleAliado('es', 'no-existe')).toBeUndefined()
  })
})
