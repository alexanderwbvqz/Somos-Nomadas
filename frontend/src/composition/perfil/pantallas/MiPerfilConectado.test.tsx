import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { textosFundadores } from '@/modules/fundadores/language'
import { textosHabilidades } from '@/modules/habilidades/language'
import { MockPerfilRepository } from '@/modules/perfil/infrastructure/mock/MockPerfilRepository'
import { textosPerfil } from '@/modules/perfil/language'
import { idiomas } from '@/shared/idiomas/idiomas'
import { MiPerfilConectado } from './MiPerfilConectado'

// Es un componente de servidor asíncrono: se resuelve y se dibuja su resultado
async function dibujar(idioma: (typeof idiomas)[number]) {
  return render(await MiPerfilConectado({ idioma }))
}

// Las pantallas de otros módulos que la vista no conoce: se comprueba que llegan con su nombre y su dirección
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_USAR_MOCKS_PERFIL', 'true')
  MockPerfilRepository.restablecer()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('MiPerfilConectado', () => {
  it.each(idiomas)('en %s muestra el título y los textos de la interfaz de ese idioma', async (idioma) => {
    await dibujar(idioma)
    const textos = textosPerfil(idioma)
    expect(screen.getByRole('heading', { level: 1, name: textos.titulo })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: textos.verComoMeVen })).toHaveAttribute('href', `/${idioma}/perfil/vista`)
    expect(screen.getByRole('heading', { level: 2, name: textos.completaTuPerfil })).toBeInTheDocument()
  })

  it.each(idiomas)('en %s los «Editar» llevan a los pasos de los otros módulos, con su nombre y su dirección en ese idioma', async (idioma) => {
    await dibujar(idioma)
    const habilidades = textosHabilidades(idioma)
    const editarEn = (paso: string) => `${textosPerfil(idioma).editar} ${textosPerfil(idioma).editarEn.replace('{paso}', paso)}`
    expect(screen.getByRole('link', { name: editarEn(textosFundadores(idioma).bienvenida.busca.titulo) })).toHaveAttribute('href', `/${idioma}/bienvenida`)
    expect(screen.getByRole('link', { name: editarEn(habilidades.tareas.titulo) })).toHaveAttribute('href', `/${idioma}/habilidades/tareas`)
    expect(screen.getByRole('link', { name: editarEn(habilidades.historias.titulo) })).toHaveAttribute('href', `/${idioma}/habilidades/historias`)
    expect(screen.getByRole('link', { name: editarEn(habilidades.forma.titulo) })).toHaveAttribute('href', `/${idioma}/habilidades/forma`)
  })

  it('muestra lo que trae el perfil: la ficha y lo escrito', async () => {
    await dibujar('es')
    expect(screen.getByRole('region', { name: 'Datos principales' })).toHaveTextContent('Ana Torres')
    expect(screen.getAllByText(/Programo desde hace cuatro años/).length).toBeGreaterThan(0)
  })

  it('si el perfil no se puede leer, lo dice y no dibuja el resto', async () => {
    vi.spyOn(MockPerfilRepository.prototype, 'obtener').mockRejectedValueOnce(new Error('sin red'))
    await dibujar('es')
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu perfil.')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
