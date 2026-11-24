import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BarraCuentaConRuta } from './BarraCuentaConRuta'

// La ruta actual la da el router de Next, que no existe fuera de la app: se sustituye
let ruta = '/es/perfil'
vi.mock('next/navigation', () => ({ usePathname: () => ruta }))
beforeEach(() => {
  ruta = '/es/perfil'
})

const props = {
  logoSrc: '/logo/x.svg',
  logoAlt: 'Marca',
  hrefInicio: '/es',
  etiquetaNavegacion: 'Secciones',
  pronto: 'Pronto',
  enlaces: [
    { id: 'descubrir', etiqueta: 'Descubrir', href: '/es/descubrir' },
    { id: 'guardados', etiqueta: 'Guardados' },
  ],
  perfil: { etiqueta: 'Mi perfil', href: '/es/perfil', iniciales: 'AT' },
}

describe('BarraCuentaConRuta', () => {
  it('marca el perfil como activo cuando se está en su página', () => {
    render(<BarraCuentaConRuta {...props} />)
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Descubrir' })).not.toHaveAttribute('aria-current')
  })

  it('marca como activa la sección de la página en la que se está, también dentro de una subpágina', () => {
    ruta = '/es/descubrir/ana-torres'
    render(<BarraCuentaConRuta {...props} />)
    expect(screen.getByRole('link', { name: 'Descubrir' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).not.toHaveAttribute('aria-current')
  })

  it('una dirección que solo empieza igual no cuenta (descubrir-mas no es descubrir)', () => {
    ruta = '/es/descubrir-mas'
    render(<BarraCuentaConRuta {...props} />)
    expect(screen.getByRole('link', { name: 'Descubrir' })).not.toHaveAttribute('aria-current')
  })

  it('una sección sin dirección nunca queda activa', () => {
    ruta = '/es/guardados'
    render(<BarraCuentaConRuta {...props} />)
    expect(screen.getByText('Guardados').closest('[aria-current]')).toBeNull()
  })
})
