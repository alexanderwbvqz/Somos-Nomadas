import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PanelMatch } from './PanelMatch'

const textos = {
  titulo: 'Así se arma tu lista',
  insignia: 'Hasta {total} conexiones',
  etiquetaSelector: 'Elige tu área',
  etiquetaPropia: 'tu área',
  etiquetaCantidad: 'hasta {cantidad}',
  etiquetaConexion: 'Una conexión · {area}',
  afinidad: 'Afinidad alta',
  pregunta: '¿Qué problema resolverías?',
  notaEjemplo: 'Ejemplo para una persona del área de {area}.',
}
const nombresAreas = {
  tecnologia: 'Tecnología',
  marketing: 'Marketing & Ventas',
  operaciones: 'Operaciones',
  finanzas: 'Finanzas',
}

function fila(nombre: string) {
  return screen.getByText(nombre, { selector: 'p' }).closest('li') as HTMLElement
}

describe('PanelMatch', () => {
  it('empieza con Tecnología: 1 de su área y hasta 3 de cada una de las otras, sumando 10', () => {
    render(<PanelMatch textos={textos} nombresAreas={nombresAreas} />)
    expect(screen.getByRole('button', { name: 'Tecnología' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(fila('Tecnología')).getByText('tu área', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('1 + 3 + 3 + 3')).toBeInTheDocument()
    expect(screen.getByText('= 10')).toBeInTheDocument()
    expect(screen.getByText('Hasta 10 conexiones')).toBeInTheDocument()
  })

  it('al elegir Marketing & Ventas el 1 pasa a esa área', async () => {
    render(<PanelMatch textos={textos} nombresAreas={nombresAreas} />)
    await userEvent.click(screen.getByRole('button', { name: 'Marketing & Ventas' }))
    expect(screen.getByRole('button', { name: 'Marketing & Ventas' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Tecnología' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('3 + 1 + 3 + 3')).toBeInTheDocument()
    expect(within(fila('Marketing & Ventas')).getByText('tu área', { exact: false })).toBeInTheDocument()
    expect(within(fila('Tecnología')).queryByText('tu área', { exact: false })).not.toBeInTheDocument()
  })

  it('la conexión de ejemplo es de otra área y la nota nombra la propia', async () => {
    render(<PanelMatch textos={textos} nombresAreas={nombresAreas} />)
    expect(screen.getByText('Una conexión · Marketing & Ventas')).toBeInTheDocument()
    expect(screen.getByText('Ejemplo para una persona del área de Tecnología.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Finanzas' }))
    expect(screen.getByText('Una conexión · Tecnología')).toBeInTheDocument()
    expect(screen.getByText('3 + 3 + 3 + 1')).toBeInTheDocument()
  })
})
