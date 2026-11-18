import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingView, type LandingViewProps } from './LandingView'

const props: LandingViewProps = {
  hero: {
    textos: {
      tituloInicio: 'Los grandes proyectos nacen cuando encuentran a las',
      tituloResaltado: 'personas correctas.',
      parrafo: 'Texto de ejemplo del párrafo.',
      botonPrincipal: 'Encuentra a tu equipo',
      enlaceSecundario: 'Explorar directorio',
      etiquetaAliados: 'Empresas que nos apoyan',
      ventajas: ['100 % gratis', 'Match con IA'],
    },
    aliados: [],
    hrefPostular: '/es/registro',
    hrefDirectorio: '/es/directorio',
  },
  problemas: {
    textos: {
      tituloInicio: 'Las ideas están en todas partes.',
      tituloFin: 'Los equipos que las construyen, no.',
      subtitulo: 'Subtítulo.',
      etiquetaProblema: 'El problema común',
      etiquetaSolucion: 'La solución Nómadas',
      diagrama: {
        descripcion: 'Diagrama de áreas',
        pie: 'Pie',
        tecnologia: 'Tecnología',
        marketing: 'Marketing & Ventas',
        operaciones: 'Operaciones',
        finanzas: 'Finanzas',
        equipo: 'Equipo',
        roles: { tecnologia: 'a', marketing: 'b', operaciones: 'c', finanzas: 'd' },
      },
    },
    items: [{ clave: 'a', tema: 'Tema', titulo: 'Un problema', problema: 'P', solucion: 'S' }],
  },
  match: {
    textos: {
      etiqueta: 'Motor de match',
      tituloInicio: 'Pensado para formar equipos,',
      tituloResaltado: 'no para sumar contactos.',
      parrafo: 'Párrafo del match.',
      puntos: ['Primer punto', 'Segundo punto'],
      panel: {
        titulo: 'Así se arma tu lista',
        insignia: 'Hasta {total} conexiones',
        etiquetaSelector: 'Elige tu área',
        etiquetaPropia: 'tu área',
        etiquetaCantidad: 'hasta {cantidad}',
        etiquetaConexion: 'Una conexión · {area}',
        afinidad: 'Afinidad alta',
        pregunta: 'Pregunta de ejemplo',
        notaEjemplo: 'Ejemplo para {area}.',
      },
    },
    nombresAreas: { tecnologia: 'Tecnología', marketing: 'Marketing & Ventas', operaciones: 'Operaciones', finanzas: 'Finanzas' },
  },
  aliados: {
    textos: {
      etiqueta: 'Aliados',
      tituloInicio: 'Ningún equipo crece solo.',
      tituloResaltado: 'Los respalda una red.',
      parrafo: 'Párrafo.',
      botonAliado: 'Quiero ser aliado',
      enlaceRed: 'Ver la red de aliados',
      nota: 'Nota.',
      etiquetaActivos: 'Aliados activos',
    },
    tipos: [{ clave: 'mentores', numero: '01', nombre: 'Mentores', descripcion: 'D.', enlace: 'Ver mentores', href: '/es/aliados?tipo=mentores' }],
    activos: [],
    hrefAliado: '/es/aliados/postular',
    hrefRed: '/es/aliados',
  },
  pilares: {
    textos: {
      etiqueta: 'Los 4 pilares',
      tituloInicio: 'Todo equipo necesita las cuatro,',
      tituloResaltado: 'y hoy buscamos más de dos.',
      parrafo: 'Párrafo.',
      estado: 'Postulaciones abiertas',
      botonPostular: 'Postular',
      enlacePerfiles: 'Ver perfiles',
    },
    areas: [
      {
        clave: 'tecnologia',
        nombre: 'Tecnología',
        aporta: 'construye el producto',
        descripcion: 'Descripción',
        claves: ['Desarrollo'],
        hrefPostular: '/es/registro',
        hrefPerfiles: '/es/directorio?area=tecnologia',
      },
    ],
  },
  cifras: {
    textos: { titulo: 'Por qué importa el equipo', parrafo: 'Párrafo.', etiquetaLista: 'Cifras' },
    items: [{ clave: 'a', cifra: '23 %', texto: 'fracasan por no tener el equipo adecuado', fuente: 'CB Insights' }],
  },
}

describe('LandingView', () => {
  it('muestra el hero con su titular y los dos enlaces', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 1, name: /personas correctas/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Encuentra a tu equipo' })).toHaveAttribute('href', '/es/registro')
    expect(screen.getByRole('link', { name: 'Explorar directorio' })).toHaveAttribute('href', '/es/directorio')
  })

  it('muestra las secciones de problemas y de cifras', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Las ideas están en todas partes/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Un problema' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Por qué importa el equipo' })).toBeInTheDocument()
    expect(screen.getByText('CB Insights')).toBeInTheDocument()
  })

  it('muestra la sección del match con su selector de área', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Pensado para formar equipos/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Elige tu área' })).toBeInTheDocument()
  })

  it('muestra la sección de los pilares', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Todo equipo necesita las cuatro/ })).toBeInTheDocument()
  })

  it('muestra la sección de aliados', () => {
    render(<LandingView {...props} />)
    expect(screen.getByRole('heading', { level: 2, name: /Ningún equipo crece solo/ })).toBeInTheDocument()
  })

  it('no muestra la franja de aliados si no hay aliados', () => {
    render(<LandingView {...props} />)
    expect(screen.queryByRole('group', { name: 'Empresas que nos apoyan' })).not.toBeInTheDocument()
  })

  it('muestra la franja cuando hay aliados', () => {
    render(<LandingView {...props} hero={{ ...props.hero, aliados: [{ nombre: 'Aliado', tipo: 'mentores' }] }} />)
    expect(screen.getByRole('group', { name: 'Empresas que nos apoyan' })).toBeInTheDocument()
  })
})
