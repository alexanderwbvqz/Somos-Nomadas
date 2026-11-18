import { describe, expect, it } from 'vitest'
import type { Aliado } from '@/modules/aliados/domain/Aliado'
import { vistaDetalleAliado } from './vistaDetalleAliado'

const base: Aliado = {
  id: 'a',
  nombre: 'Aliado Uno',
  tipo: 'mentores',
  descripcion: 'Descripción corta.',
  descripcionLarga: ['Primer párrafo.'],
  datosClave: [{ valor: '12 años', etiqueta: 'de experiencia' }],
  areas: ['Producto'],
  apoyos: ['Mentoría'],
  redes: [{ tipo: 'linkedin', href: 'https://www.linkedin.com/in/ejemplo' }],
  ciudad: 'Lima, Perú',
  sitioWeb: 'https://www.ejemplo.example/inicio',
  enLaRedDesde: '2026-03-01',
  whatsapp: '51000000001',
  enlaceAgenda: 'https://agenda.example/a',
}

const otro: Aliado = { ...base, id: 'b', nombre: 'Aliado Dos' }

describe('vistaDetalleAliado', () => {
  it('arma la cabecera con el tipo en singular y la vuelta a la red en el idioma', () => {
    const vista = vistaDetalleAliado({ aliado: base, similares: [] }, 'es')
    expect(vista.cabecera).toMatchObject({ nombre: 'Aliado Uno', etiquetaTipo: 'Mentor', textoVolver: 'Red de aliados', hrefVolver: '/es/aliados' })
    expect(vistaDetalleAliado({ aliado: base, similares: [] }, 'en').cabecera).toMatchObject({ etiquetaTipo: 'Mentor', textoVolver: 'Ally network', hrefVolver: '/en/aliados' })
  })

  it('la ficha lleva el sitio web sin "www", la fecha en palabras y las redes por su nombre', () => {
    const { ficha } = vistaDetalleAliado({ aliado: base, similares: [] }, 'es')
    expect(ficha.sitioWeb).toEqual({ texto: 'ejemplo.example', href: 'https://www.ejemplo.example/inicio' })
    expect(ficha.enLaRedDesde).toBe('marzo de 2026')
    expect(ficha.redes).toEqual([{ nombre: 'LinkedIn', href: 'https://www.linkedin.com/in/ejemplo', tipo: 'linkedin' }])
    expect(ficha.ciudad).toBe('Lima, Perú')
  })

  it('la fecha sale en el idioma de la página', () => {
    expect(vistaDetalleAliado({ aliado: base, similares: [] }, 'en').ficha.enLaRedDesde).toBe('March 2026')
  })

  it('con agenda y WhatsApp lleva los dos enlaces; el de WhatsApp es del aliado y trae el mensaje', () => {
    const { ficha, contenido } = vistaDetalleAliado({ aliado: base, similares: [] }, 'es')
    expect(ficha.hrefAgenda).toBe('https://agenda.example/a')
    expect(ficha.hrefWhatsapp).toMatch(/^https:\/\/wa\.me\/51000000001\?text=/)
    expect(decodeURIComponent(ficha.hrefWhatsapp ?? '')).toContain('red de aliados de Nómadas')
    expect(contenido.pasos).toHaveLength(3)
  })

  it('con un solo medio de contacto solo trae ese', () => {
    const soloAgenda = vistaDetalleAliado({ aliado: { ...base, whatsapp: undefined }, similares: [] }, 'es').ficha
    expect(soloAgenda.hrefAgenda).toBeDefined()
    expect(soloAgenda.hrefWhatsapp).toBeUndefined()
    const soloWhatsapp = vistaDetalleAliado({ aliado: { ...base, enlaceAgenda: undefined }, similares: [] }, 'es').ficha
    expect(soloWhatsapp.hrefAgenda).toBeUndefined()
    expect(soloWhatsapp.hrefWhatsapp).toBeDefined()
  })

  it('sin ningún contacto no hay botones ni pasos para trabajar con el aliado', () => {
    const vista = vistaDetalleAliado({ aliado: { ...base, whatsapp: undefined, enlaceAgenda: undefined }, similares: [] }, 'es')
    expect(vista.ficha.hrefAgenda).toBeUndefined()
    expect(vista.ficha.hrefWhatsapp).toBeUndefined()
    expect(vista.contenido.pasos).toBeUndefined()
  })

  it('descarta los enlaces inseguros y el número de WhatsApp inválido', () => {
    const vista = vistaDetalleAliado(
      {
        aliado: {
          ...base,
          sitioWeb: 'javascript:alert(1)',
          enlaceAgenda: 'data:text/html,x',
          whatsapp: '+51 973 356 545',
          redes: [
            { tipo: 'linkedin', href: 'javascript:alert(1)' },
            { tipo: 'instagram', href: 'https://www.instagram.com/ejemplo' },
          ],
        },
        similares: [],
      },
      'es',
    )
    expect(vista.ficha.sitioWeb).toBeUndefined()
    expect(vista.ficha.hrefAgenda).toBeUndefined()
    expect(vista.ficha.hrefWhatsapp).toBeUndefined()
    expect(vista.ficha.redes.map((red) => red.nombre)).toEqual(['Instagram'])
  })

  it('los similares se convierten en tarjetas con su tipo y su enlace en el idioma', () => {
    const vista = vistaDetalleAliado({ aliado: base, similares: [otro] }, 'pt')
    expect(vista.masAliados.aliados).toHaveLength(1)
    expect(vista.masAliados.aliados[0]).toMatchObject({ id: 'b', etiquetaTipo: 'Mentor', href: '/pt/aliados/b' })
    expect(vista.masAliados.textos).toEqual({ titulo: 'Mais aliados deste tipo', leerMas: 'Ler mais' })
  })
})
