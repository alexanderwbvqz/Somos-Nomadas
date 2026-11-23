import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { CampoLista } from './CampoLista'

const opciones = [
  { valor: 'a', texto: 'Argentina' },
  { valor: 'b', texto: 'Bolivia' },
  { valor: 'c', texto: 'Chile' },
]

function Prueba({ error }: { error?: string }) {
  const [valor, setValor] = useState('')
  return <CampoLista clave="pais" etiqueta="Dónde estás" placeholder="Elige tu país" opciones={opciones} valor={valor} alCambiar={setValor} error={error} />
}

const campo = () => screen.getByRole('combobox', { name: 'Dónde estás' })

describe('CampoLista', () => {
  it('empieza cerrada y con el texto de ayuda', () => {
    render(<Prueba />)
    expect(campo()).toHaveTextContent('Elige tu país')
    expect(campo()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('con el ratón: se abre, se elige y se cierra dejando la opción y el foco en el botón', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    await usuario.click(campo())
    expect(screen.getAllByRole('option')).toHaveLength(3)
    await usuario.click(screen.getByRole('option', { name: 'Bolivia' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(campo()).toHaveTextContent('Bolivia')
    expect(campo()).toHaveFocus()
  })

  it('con el teclado: flechas para moverse, Enter para elegir', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    campo().focus()
    await usuario.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(campo()).toHaveTextContent('Bolivia')
  })

  it('Escape cierra sin cambiar lo elegido', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    campo().focus()
    await usuario.keyboard('{ArrowDown}{ArrowDown}{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(campo()).toHaveTextContent('Elige tu país')
  })

  it('escribir una letra salta a la opción que empieza por ella', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    campo().focus()
    await usuario.keyboard('{ArrowDown}c{Enter}')
    expect(campo()).toHaveTextContent('Chile')
  })

  it('la opción elegida queda marcada como seleccionada al volver a abrir', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    await usuario.click(campo())
    await usuario.click(screen.getByRole('option', { name: 'Chile' }))
    await usuario.click(campo())
    expect(screen.getByRole('option', { name: /Chile/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Argentina' })).toHaveAttribute('aria-selected', 'false')
  })

  it('muestra el error y lo enlaza con el campo', () => {
    render(<Prueba error="Elige tu país." />)
    expect(campo()).toHaveAttribute('aria-invalid', 'true')
    expect(campo()).toHaveAccessibleDescription('Elige tu país.')
  })
})
