import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { SeccionPlegable } from './SeccionPlegable'

function Prueba({ inicial = false, resumen }: { inicial?: boolean; resumen?: string }) {
  const [abierta, setAbierta] = useState(inicial)
  return (
    <SeccionPlegable id="uno" titulo="Construir" detalle="1 de 4" abierta={abierta} alAlternar={() => setAbierta((a) => !a)} resumen={resumen}>
      <p>Contenido</p>
    </SeccionPlegable>
  )
}

const boton = () => screen.getByRole('button', { name: /Construir/ })

describe('SeccionPlegable', () => {
  it('cerrada no enseña el contenido y lo dice con aria-expanded', () => {
    render(<Prueba />)
    expect(boton()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('abierta enseña el contenido, y el botón apunta a él', () => {
    render(<Prueba inicial />)
    expect(boton()).toHaveAttribute('aria-expanded', 'true')
    const contenido = screen.getByText('Contenido').parentElement
    expect(contenido).toHaveAttribute('id', boton().getAttribute('aria-controls'))
  })

  it('al pulsar el título se abre y al volver a pulsar se cierra', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    await usuario.click(boton())
    expect(screen.getByText('Contenido')).toBeInTheDocument()
    await usuario.click(boton())
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('se abre y cierra con el teclado', async () => {
    const usuario = userEvent.setup()
    render(<Prueba />)
    boton().focus()
    await usuario.keyboard('{Enter}')
    expect(screen.getByText('Contenido')).toBeInTheDocument()
    await usuario.keyboard(' ')
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('el detalle se ve siempre y el resumen solo mientras está cerrada', async () => {
    const usuario = userEvent.setup()
    render(<Prueba resumen="React, Node" />)
    expect(screen.getByText('1 de 4')).toBeInTheDocument()
    expect(screen.getByText('React, Node')).toBeInTheDocument()
    await usuario.click(boton())
    expect(screen.getByText('1 de 4')).toBeInTheDocument()
    expect(screen.queryByText('React, Node')).not.toBeInTheDocument()
  })

  it('el título es un encabezado de segundo nivel', () => {
    render(<Prueba />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
