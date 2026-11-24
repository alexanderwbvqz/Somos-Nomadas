import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockPerfilRepository } from '@/modules/perfil/infrastructure/mock/MockPerfilRepository'
import { textosPerfil } from '@/modules/perfil/language'
import { idiomas } from '@/shared/idiomas/idiomas'
import { PerfilPublicoConectado } from './PerfilPublicoConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number]) {
  return render(await PerfilPublicoConectado({ idioma }))
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_PERFIL', 'true')
  MockPerfilRepository.restablecer()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('PerfilPublicoConectado', () => {
  it.each(idiomas)('en %s enseña el perfil con los textos de ese idioma y un enlace de vuelta a Mi perfil en ese idioma', async (idioma) => {
    await dibujar(idioma)
    const textos = textosPerfil(idioma)
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Torres' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: new RegExp(textos.publico.volver) })).toHaveAttribute('href', `/${idioma}/perfil`)
    expect(screen.getByText(textos.publico.aviso)).toBeInTheDocument()
  })

  it('enseña lo que lee otra persona: sin tareas y solo con las historias que tienen permiso', async () => {
    await dibujar('es')
    expect(screen.queryByText(/Tareas que has hecho/)).not.toBeInTheDocument()
    const historias = within(screen.getByRole('region', { name: 'Historias' }))
    expect(historias.getByText(/Armé con mi hermana una tienda/)).toBeInTheDocument()
    expect(historias.queryByText('El acceso a crédito para pequeños talleres.')).not.toBeInTheDocument()
  })

  it('refleja lo último que se guardó en Mi perfil', async () => {
    await new MockPerfilRepository().guardarSobreMi('Busco socio de ventas')
    await dibujar('es')
    expect(within(screen.getByRole('region', { name: 'Sobre mí' })).getByText('Busco socio de ventas')).toBeInTheDocument()
  })

  it('si el perfil no se puede leer, lo dice y no dibuja el resto', async () => {
    vi.spyOn(MockPerfilRepository.prototype, 'obtener').mockRejectedValueOnce(new Error('sin red'))
    await dibujar('es')
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu perfil.')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
