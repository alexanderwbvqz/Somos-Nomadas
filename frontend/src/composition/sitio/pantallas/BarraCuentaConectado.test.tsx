import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { idiomas } from '@/shared/idiomas/idiomas'
import { MockPerfilRepository } from '@/modules/perfil/infrastructure/mock/MockPerfilRepository'
import { BarraCuentaConectado } from './BarraCuentaConectado'

// La ruta actual la da el router de Next, que no existe fuera de la app: se sustituye
vi.mock('next/navigation', () => ({ usePathname: () => '/es/perfil' }))

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number]) {
  return render(await BarraCuentaConectado({ idioma }))
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_PERFIL', 'true')
  MockPerfilRepository.restablecer()
})
afterEach(() => vi.unstubAllEnvs())

describe('BarraCuentaConectado', () => {
  it.each([
    ['es', 'Mi perfil', 'Descubrir', 'Pronto'],
    ['en', 'My profile', 'Discover', 'Soon'],
    ['pt', 'Meu perfil', 'Descobrir', 'Em breve'],
  ] as const)('en %s muestra el perfil como "%s", la sección "%s" y la insignia "%s"', async (idioma, perfil, seccion, pronto) => {
    await dibujar(idioma)
    expect(screen.getByRole('link', { name: perfil })).toBeInTheDocument()
    expect(screen.getByText(seccion)).toBeInTheDocument()
    expect(screen.getAllByText(pronto)).toHaveLength(3)
  })

  it('el perfil enlaza a su página en el idioma, y el logo al inicio en el mismo idioma', async () => {
    await dibujar('en')
    expect(screen.getByRole('link', { name: 'My profile' })).toHaveAttribute('href', '/en/perfil')
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/en')
  })

  it('las iniciales salen del perfil', async () => {
    await dibujar('es')
    expect(screen.getByText('AT')).toBeInTheDocument()
  })

  it('si el perfil no se puede leer, la barra sigue funcionando sin iniciales', async () => {
    vi.spyOn(MockPerfilRepository.prototype, 'obtener').mockRejectedValueOnce(new Error('sin red'))
    await dibujar('es')
    expect(screen.queryByText('AT')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
  })

  it('el perfil se marca como la página actual cuando se está en /perfil', async () => {
    await dibujar('es')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('aria-current', 'page')
  })
})
