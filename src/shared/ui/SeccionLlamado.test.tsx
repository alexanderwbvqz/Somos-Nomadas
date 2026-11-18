import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeccionLlamado } from './SeccionLlamado'

const textos = {
  tituloInicio: '¿Tu organización puede',
  tituloResaltado: 'impulsar equipos?',
  boton: 'Quiero ser aliado',
  nota: 'Revisamos cada postulación antes de publicarla.',
}

describe('SeccionLlamado', () => {
  it('el titular completo es el encabezado y el nombre de la sección', () => {
    render(<SeccionLlamado idTitulo="titulo-x" textos={textos} href="/es/aliados/postular" />)
    expect(screen.getByRole('heading', { level: 2, name: '¿Tu organización puede impulsar equipos?' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '¿Tu organización puede impulsar equipos?' })).toBeInTheDocument()
  })

  it('el botón lleva al enlace dado y la nota se muestra', () => {
    render(<SeccionLlamado idTitulo="titulo-x" textos={textos} href="/es/aliados/postular" />)
    expect(screen.getByRole('link', { name: 'Quiero ser aliado' })).toHaveAttribute('href', '/es/aliados/postular')
    expect(screen.getByText('Revisamos cada postulación antes de publicarla.')).toBeInTheDocument()
  })
})
