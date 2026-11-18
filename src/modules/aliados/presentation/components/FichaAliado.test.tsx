import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FichaAliado, type FichaAliadoProps } from './FichaAliado'

const textos = {
  tipo: 'Tipo',
  ciudad: 'Ciudad',
  sitioWeb: 'Sitio web',
  enLaRed: 'En la red desde',
  redes: 'Redes',
  agendar: 'Agendar una llamada',
  whatsapp: 'Escribir por WhatsApp',
  notaContacto: 'Contacto directo con el aliado: Nómadas no interviene en la conversación.',
}

const completa: FichaAliadoProps = {
  textos,
  etiquetaTipo: 'Mentor',
  ciudad: 'Lima, Perú',
  sitioWeb: { texto: 'ejemplo.example', href: 'https://ejemplo.example' },
  enLaRedDesde: 'marzo de 2026',
  redes: [
    { nombre: 'LinkedIn', href: 'https://www.linkedin.com/x', tipo: 'linkedin' },
    { nombre: 'Instagram', href: 'https://www.instagram.com/x', tipo: 'instagram' },
  ],
  hrefAgenda: 'https://agenda.example/a',
  hrefWhatsapp: 'https://wa.me/51000000001?text=Hola',
}

const minima: FichaAliadoProps = { textos, etiquetaTipo: 'Aliado estratégico', redes: [] }

describe('FichaAliado', () => {
  it('muestra los datos que tiene, cada uno con su etiqueta', () => {
    render(<FichaAliado {...completa} />)
    expect(screen.getByText('Mentor')).toBeInTheDocument()
    expect(screen.getByText('Lima, Perú')).toBeInTheDocument()
    expect(screen.getByText('marzo de 2026')).toBeInTheDocument()
    expect(screen.getByText('En la red desde')).toBeInTheDocument()
  })

  it('el sitio web y las redes se abren en pestaña nueva sin dar acceso a la página de origen', () => {
    render(<FichaAliado {...completa} />)
    const web = screen.getByRole('link', { name: /ejemplo\.example/ })
    expect(web).toHaveAttribute('href', 'https://ejemplo.example')
    expect(web).toHaveAttribute('target', '_blank')
    expect(web).toHaveAttribute('rel', 'noopener noreferrer')
    const redes = screen.getByRole('list')
    const linkedin = within(redes).getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/x')
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(redes).getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
  })

  it('con agenda y WhatsApp muestra los dos botones, en pestaña nueva, y la nota de contacto directo', () => {
    render(<FichaAliado {...completa} />)
    const agenda = screen.getByRole('link', { name: 'Agendar una llamada' })
    const whatsapp = screen.getByRole('link', { name: 'Escribir por WhatsApp' })
    expect(agenda).toHaveAttribute('href', 'https://agenda.example/a')
    expect(whatsapp).toHaveAttribute('href', 'https://wa.me/51000000001?text=Hola')
    for (const enlace of [agenda, whatsapp]) {
      expect(enlace).toHaveAttribute('target', '_blank')
      expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(screen.getByText(/Nómadas no interviene en la conversación/)).toBeInTheDocument()
  })

  it('con un solo medio de contacto muestra solo ese botón', () => {
    render(<FichaAliado {...completa} hrefWhatsapp={undefined} />)
    expect(screen.getByRole('link', { name: 'Agendar una llamada' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Escribir por WhatsApp' })).not.toBeInTheDocument()
  })

  it('sin ningún medio de contacto no hay botones ni nota', () => {
    render(<FichaAliado {...minima} />)
    expect(screen.queryByRole('link', { name: 'Agendar una llamada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Escribir por WhatsApp' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Nómadas no interviene/)).not.toBeInTheDocument()
  })

  it('los datos que no tiene no aparecen como filas vacías', () => {
    render(<FichaAliado {...minima} />)
    expect(screen.getByText('Aliado estratégico')).toBeInTheDocument()
    for (const etiqueta of ['Ciudad', 'Sitio web', 'En la red desde', 'Redes']) {
      expect(screen.queryByText(etiqueta)).not.toBeInTheDocument()
    }
  })
})
