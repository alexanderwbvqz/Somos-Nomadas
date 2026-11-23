import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampoArchivo } from './CampoArchivo'

function montar(props: Partial<Parameters<typeof CampoArchivo>[0]> = {}) {
  const alElegir = vi.fn()
  const alQuitar = vi.fn()
  render(
    <CampoArchivo
      clave="pdf"
      titulo="Sube tu PDF"
      ayuda="Solo PDF, hasta 5 MB."
      accept="application/pdf,.pdf"
      alElegir={alElegir}
      alQuitar={alQuitar}
      textoQuitar="Quitar"
      {...props}
    />,
  )
  return { alElegir, alQuitar, usuario: userEvent.setup() }
}

const pdf = () => new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' })

describe('CampoArchivo', () => {
  it('el selector se llama como el título y solo admite lo que se le dijo', () => {
    montar()
    const campo = screen.getByLabelText(/Sube tu PDF/)
    expect(campo).toHaveAttribute('type', 'file')
    expect(campo).toHaveAttribute('accept', 'application/pdf,.pdf')
  })

  it('al elegir un archivo avisa con él', async () => {
    const { alElegir, usuario } = montar()
    await usuario.upload(screen.getByLabelText(/Sube tu PDF/), pdf())
    expect(alElegir).toHaveBeenCalledTimes(1)
    expect(alElegir.mock.calls[0]?.[0]).toMatchObject({ name: 'cv.pdf' })
  })

  it('al soltar un archivo encima también avisa con él', () => {
    const { alElegir } = montar()
    fireEvent.drop(screen.getByText('Sube tu PDF').closest('label')!, { dataTransfer: { files: [pdf()] } })
    expect(alElegir).toHaveBeenCalledTimes(1)
  })

  it('soltar sin archivos no avisa de nada', () => {
    const { alElegir } = montar()
    fireEvent.drop(screen.getByText('Sube tu PDF').closest('label')!, { dataTransfer: { files: [] } })
    expect(alElegir).not.toHaveBeenCalled()
  })

  it('muestra el archivo elegido con su tamaño y un botón para quitarlo', async () => {
    const { alQuitar, usuario } = montar({ archivo: { nombre: 'cv.pdf', tamano: 230 * 1024 } })
    expect(screen.getByText(/cv\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/230 KB/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Quitar' }))
    expect(alQuitar).toHaveBeenCalledTimes(1)
  })

  it('sin archivo elegido no hay botón de quitar', () => {
    montar()
    expect(screen.queryByRole('button', { name: 'Quitar' })).not.toBeInTheDocument()
  })

  it('muestra el error y lo enlaza con el campo', () => {
    montar({ error: 'El archivo tiene que ser un PDF.' })
    const campo = screen.getByLabelText(/Sube tu PDF/)
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription('El archivo tiene que ser un PDF.')
  })
})
