import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResultadoAnalisis } from '../application/analizarMaterial'
import { LIMITES_MATERIAL } from '../domain/material'
import { es } from '../language/es'
import { EscritasView } from './EscritasView'

const t = es.escritas

const sugerencias: ResultadoAnalisis = {
  ok: true,
  sugerencias: [
    { tarea: 'interfacesWeb', nivel: 4, fuente: 'pdf' },
    { tarea: 'publicarProducto', nivel: 3, fuente: 'web' },
  ],
}

function montar(resultado: ResultadoAnalisis | Promise<ResultadoAnalisis> = sugerencias) {
  const alAnalizar = vi.fn<(entrada: FormData) => Promise<ResultadoAnalisis>>(async () => await resultado)
  render(
    <EscritasView
      textos={es}
      alAnalizar={alAnalizar}
      barra={<p>Barra de arriba</p>}
      hrefCambiarCamino="/es/habilidades"
      hrefInformacion="/es/politica-de-datos"
    />,
  )
  // La zona del archivo filtra por "accept": para probar un archivo que no es PDF hay que apagar ese filtro
  return { alAnalizar, usuario: userEvent.setup({ applyAccept: false }) }
}

type Usuario = ReturnType<typeof userEvent.setup>

const pdf = (nombre = 'cv.pdf') => new File(['%PDF-1.4 contenido'], nombre, { type: 'application/pdf' })
const analizar = () => screen.getByRole('button', { name: t.analizar })
const selector = () => screen.getByLabelText(new RegExp(t.archivo.titulo))
const permiso = () => screen.getByRole('checkbox', { name: new RegExp(t.permisoTexto.slice(0, 20)) })
const campoWeb = () => screen.getByLabelText(new RegExp(t.enlaces.web.etiqueta))

async function conPdfYPermiso(usuario: Usuario) {
  await usuario.upload(selector(), pdf())
  await usuario.click(permiso())
}

describe('EscritasView: subir o pegar', () => {
  it('muestra el título, la barra fuera del <main>, el enlace para cambiar de camino y el de más información', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Barra de arriba'))
    expect(screen.getByRole('link', { name: new RegExp(t.cambiarCamino) })).toHaveAttribute('href', '/es/habilidades')
    expect(screen.getByRole('link', { name: t.permisoEnlace })).toHaveAttribute('href', '/es/politica-de-datos')
  })

  it('el botón empieza apagado y no analiza nada', async () => {
    const { alAnalizar, usuario } = montar()
    expect(analizar()).toBeDisabled()
    await usuario.click(analizar())
    expect(alAnalizar).not.toHaveBeenCalled()
  })

  it('con material pero sin permiso sigue apagado; con las dos cosas se enciende', async () => {
    const { usuario } = montar()
    await usuario.type(campoWeb(), 'tuweb.com')
    expect(analizar()).toBeDisabled()
    await usuario.click(permiso())
    expect(analizar()).toBeEnabled()
  })

  it('con el permiso pero sin material sigue apagado', async () => {
    const { usuario } = montar()
    await usuario.click(permiso())
    expect(analizar()).toBeDisabled()
  })

  it('un PDF elegido se ve con su nombre y se puede quitar', async () => {
    const { usuario } = montar()
    await usuario.upload(selector(), pdf('mi-cv.pdf'))
    expect(screen.getByText(/mi-cv\.pdf/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: t.archivo.quitar }))
    expect(screen.queryByText(/mi-cv\.pdf/)).not.toBeInTheDocument()
  })

  it('un archivo que no es PDF no se queda y avisa donde se eligió', async () => {
    const { usuario } = montar()
    await usuario.upload(selector(), new File(['x'], 'foto.png', { type: 'image/png' }))
    expect(screen.getByText(t.errores.archivoNoPdf)).toBeInTheDocument()
    expect(screen.queryByText(/foto\.png/)).not.toBeInTheDocument()
  })

  it('un PDF demasiado grande no se queda y avisa con el máximo', async () => {
    const { usuario } = montar()
    const grande = pdf('grande.pdf')
    Object.defineProperty(grande, 'size', { value: LIMITES_MATERIAL.pdfBytes + 1 })
    await usuario.upload(selector(), grande)
    expect(screen.getByText('El PDF pesa demasiado. Máximo 5 MB.')).toBeInTheDocument()
    expect(screen.queryByText(/grande\.pdf/)).not.toBeInTheDocument()
  })

  it('el error de un archivo malo desaparece al elegir uno bueno', async () => {
    const { usuario } = montar()
    await usuario.upload(selector(), new File(['x'], 'foto.png', { type: 'image/png' }))
    await usuario.upload(selector(), pdf())
    expect(screen.queryByText(t.errores.archivoNoPdf)).not.toBeInTheDocument()
  })

  it('un enlace mal escrito avisa al analizar, lleva el foco a su campo y no manda nada', async () => {
    const { alAnalizar, usuario } = montar()
    await usuario.type(campoWeb(), 'esto no es un enlace')
    await usuario.click(permiso())
    await usuario.click(analizar())
    expect(alAnalizar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.enlaceInvalido)).toBeInTheDocument()
    expect(campoWeb()).toHaveFocus()
  })

  it('un enlace a una dirección interna también se rechaza', async () => {
    const { alAnalizar, usuario } = montar()
    await usuario.type(campoWeb(), 'http://127.0.0.1:8080')
    await usuario.click(permiso())
    await usuario.click(analizar())
    expect(alAnalizar).not.toHaveBeenCalled()
    expect(screen.getByText(t.errores.enlaceInvalido)).toBeInTheDocument()
  })

  it('el error de un enlace desaparece al corregirlo', async () => {
    const { usuario } = montar()
    await usuario.type(campoWeb(), 'esto no es un enlace')
    await usuario.click(permiso())
    await usuario.click(analizar())
    await usuario.clear(campoWeb())
    await usuario.type(campoWeb(), 'tuweb.com')
    expect(screen.queryByText(t.errores.enlaceInvalido)).not.toBeInTheDocument()
  })
})

describe('EscritasView: leer y revisar', () => {
  it('manda el PDF, los enlaces y el permiso en un formulario', async () => {
    const { alAnalizar, usuario } = montar()
    await conPdfYPermiso(usuario)
    await usuario.type(campoWeb(), 'tuweb.com')
    await usuario.click(analizar())

    await waitFor(() => expect(alAnalizar).toHaveBeenCalledTimes(1))
    const enviado = alAnalizar.mock.calls[0]![0]
    expect(enviado.get('web')).toBe('tuweb.com')
    expect(enviado.get('aceptaAnalisis')).toBe('true')
    expect((enviado.get('pdf') as File).name).toBe('cv.pdf')
  })

  it('mientras el servidor responde muestra "Leyendo", y el foco va a su título', async () => {
    let terminar: (resultado: ResultadoAnalisis) => void = () => {}
    const { usuario } = montar(new Promise((resolver) => (terminar = resolver)))
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())

    const titulo = await screen.findByRole('heading', { level: 1, name: t.leyendo.titulo })
    expect(titulo).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(t.leyendo.texto)
    expect(screen.queryByRole('button', { name: t.analizar })).not.toBeInTheDocument()
    terminar(sugerencias)
    await screen.findByRole('heading', { level: 1, name: t.revision.titulo })
  })

  it('al terminar muestra lo entendido con su fuente, su nivel y todo confirmado, y el foco va al título', async () => {
    const { usuario } = montar()
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())

    const titulo = await screen.findByRole('heading', { level: 1, name: t.revision.titulo })
    expect(titulo).toHaveFocus()
    expect(screen.getByRole('checkbox', { name: /Crear interfaces web/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Lanzar un producto digital/ })).toBeChecked()
    expect(screen.getByText('Tu PDF')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Nivel estimado 4 de 5' })).toBeInTheDocument()
    expect(screen.getByText('2 de 2 tareas confirmadas.')).toBeInTheDocument()
  })

  it('quitar una tarea baja el contador y se puede volver a ponerla', async () => {
    const { usuario } = montar()
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())
    await screen.findByRole('heading', { level: 1, name: t.revision.titulo })

    await usuario.click(screen.getByRole('checkbox', { name: /Crear interfaces web/ }))
    expect(screen.getByRole('checkbox', { name: /Crear interfaces web/ })).not.toBeChecked()
    expect(screen.getByText('1 de 2 tareas confirmadas.')).toBeInTheDocument()
    await usuario.click(screen.getByRole('checkbox', { name: /Crear interfaces web/ }))
    expect(screen.getByText('2 de 2 tareas confirmadas.')).toBeInTheDocument()
  })

  it('"Confirmar y seguir" avisa de que el siguiente paso llega pronto', async () => {
    const { usuario } = montar()
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())
    await screen.findByRole('heading', { level: 1, name: t.revision.titulo })

    await usuario.click(screen.getByRole('button', { name: t.revision.confirmar }))
    expect(screen.getByText(es.comun.proximo)).toBeInTheDocument()
  })

  it('"Cambiar lo que subí" vuelve al formulario con lo ya elegido', async () => {
    const { usuario } = montar()
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())
    await screen.findByRole('heading', { level: 1, name: t.revision.titulo })

    await usuario.click(screen.getByRole('button', { name: t.revision.volver }))
    expect(await screen.findByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(/cv\.pdf/)).toBeInTheDocument()
    expect(permiso()).toBeChecked()
  })

  it('si no se encontró ninguna tarea lo dice y deja volver', async () => {
    const { usuario } = montar({ ok: true, sugerencias: [] })
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())

    expect(await screen.findByText(t.revision.vacio)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: t.revision.confirmar })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.revision.volver })).toBeInTheDocument()
  })

  it('si el servidor limita los intentos vuelve al formulario con el aviso y lo escrito', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'limite' })
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())

    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.limite)
    expect(screen.getByRole('heading', { level: 1, name: t.titulo })).toBeInTheDocument()
    expect(screen.getByText(/cv\.pdf/)).toBeInTheDocument()
  })

  it('si el análisis falla avisa y deja intentar de nuevo', async () => {
    const { usuario } = montar({ ok: false, errores: {}, motivo: 'fallo' })
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())
    expect(await screen.findByRole('alert')).toHaveTextContent(t.avisos.fallo)
    expect(analizar()).toBeEnabled()
  })

  it('si el servidor rechaza el archivo, el error se ve junto a él y el foco vuelve a esa zona', async () => {
    const { usuario } = montar({ ok: false, errores: { archivo: 'archivoNoPdf' } })
    await conPdfYPermiso(usuario)
    await usuario.click(analizar())

    expect(await screen.findByText(t.errores.archivoNoPdf)).toBeInTheDocument()
    expect(selector()).toHaveFocus()
  })
})
