import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ResultadoGuardar } from '../application/resultado'
import type { Perfil } from '../domain/perfil'
import { es } from '../language/es'
import { MiPerfilView, type MiPerfilViewProps } from './MiPerfilView'

// Un perfil de prueba, escrito aquí para que la vista no dependa de ningún adaptador
function perfilDePrueba(cambios: Partial<Perfil> = {}): Perfil {
  return {
    ficha: { nombre: 'Ana', apellidos: 'Torres', ciudad: 'Lima', pais: 'Perú', iniciales: 'AT', areas: ['Tecnología'], modalidad: 'Híbrida' },
    buscando: ['Un socio comercial', 'Todavía explorando'],
    habilidades: [
      {
        nombre: 'Desarrollo web',
        nivel: 5,
        estimado: false,
        resumen: 'Es mi trabajo · Más de 5 años',
        detalle: { respuestas: [{ pregunta: '¿Con qué tecnologías trabajas?', respuestas: ['React', 'Node.js'] }], texto: { pregunta: 'Cuéntanos algo que hayas construido', texto: 'Una tienda en línea.' } },
      },
      {
        nombre: 'Marketing digital',
        nivel: 3,
        estimado: false,
        resumen: 'Varias veces · 3 a 5 años',
        detalle: { respuestas: [{ pregunta: '¿En qué canales has trabajado?', respuestas: ['Redes orgánicas'] }] },
      },
      { nombre: 'Gestión de proyectos', nivel: 1, estimado: true, resumen: 'Una vez · sin indicar tiempo' },
    ],
    tareas: {
      total: 30,
      grupos: [
        { grupo: 'Construir con tecnología', tareas: [{ texto: 'Programar una página web', veces: 'Es mi trabajo' }] },
        { grupo: 'Darte a conocer', tareas: [{ texto: 'Lanzar campañas de anuncios en internet', veces: 'Varias veces' }, { texto: 'Manejar redes sociales o crear contenido', veces: 'Una vez' }] },
      ],
    },
    historias: [{ pregunta: 'Algo que lograste o construiste y de lo que estás orgulloso', texto: 'Armé una tienda en línea.', aceptaMostrar: true }],
    sectores: { pregunta: 'Sectores que te mueven', respuestas: ['Educación', 'Fintech'] },
    forma: [{ pregunta: '¿Cuándo quieres arrancar?', respuestas: ['Ya mismo'] }],
    buscaPerfil: { pregunta: '¿Qué perfil buscas para tu equipo?', respuestas: ['Ventas y Marketing'] },
    socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: 'Alguien que venda.' },
    sobreMi: 'Programo desde hace cuatro años.',
    trayectoria: [
      { desde: 2022, rol: 'Desarrolladora web', donde: 'Mi proyecto', que: 'Programé la tienda.' },
      { desde: 2020, hasta: 2022, rol: 'Desarrolladora', donde: 'Estudio digital', que: '' },
    ],
    evidencia: ['https://anatorres.example/tienda', 'https://github.com/anatorres'],
    ...cambios,
  }
}

const pasos: MiPerfilViewProps['pasos'] = {
  bienvenida: { nombre: 'Qué estás buscando', href: '/es/bienvenida' },
  tareas: { nombre: 'Qué has hecho', href: '/es/habilidades/tareas' },
  historias: { nombre: 'Tus historias', href: '/es/habilidades/historias' },
  forma: { nombre: 'Tu forma de emprender', href: '/es/habilidades/forma' },
}

const bien = async (): Promise<ResultadoGuardar<never>> => ({ ok: true })
let acciones: { sobreMi: ReturnType<typeof vi.fn>; trayectoria: ReturnType<typeof vi.fn>; evidencia: ReturnType<typeof vi.fn> }

function montar(perfil: Perfil = perfilDePrueba()) {
  render(<MiPerfilView textos={es} perfil={perfil} pasos={pasos} acciones={acciones as unknown as MiPerfilViewProps['acciones']} anioActual={2026} />)
  return userEvent.setup()
}

// jsdom no trae las ventanas modales nativas: se simulan abriendo y cerrando el atributo
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})
beforeEach(() => {
  acciones = { sobreMi: vi.fn(bien), trayectoria: vi.fn(bien), evidencia: vi.fn(bien) }
})

const bloque = (nombre: string | RegExp) => screen.getByRole('region', { name: nombre })

describe('MiPerfilView', () => {
  it('muestra el título, la ficha y los bloques en su orden', () => {
    montar()
    expect(screen.getByRole('heading', { level: 1, name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Datos principales' })).toHaveTextContent('Ana Torres')
    expect(screen.getByRole('region', { name: 'Datos principales' })).toHaveTextContent('Lima, Perú · Híbrida')
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    const posicion = (titulo: string) => titulos.findIndex((t) => t?.includes(titulo))
    const orden = ['Sobre mí', 'Trayectoria', 'Evidencia', 'Qué estás buscando', 'Tus historias', 'Habilidades', 'Tareas que has hecho', 'Tu forma de emprender'].map(posicion)
    expect(orden.every((lugar) => lugar >= 0)).toBe(true)
    expect([...orden].sort((a, b) => a - b)).toEqual(orden)
  })

  it('cada bloque del recorrido lleva «Editar» hacia el paso donde se corrige, con su nombre completo', () => {
    montar()
    expect(screen.getByRole('link', { name: 'Editar en el paso Qué estás buscando' })).toHaveAttribute('href', '/es/bienvenida')
    expect(screen.getByRole('link', { name: 'Editar en el paso Tus historias' })).toHaveAttribute('href', '/es/habilidades/historias')
    expect(screen.getByRole('link', { name: 'Editar en el paso Tu forma de emprender' })).toHaveAttribute('href', '/es/habilidades/forma')
    expect(screen.getByRole('link', { name: 'Editar en el paso Qué has hecho' })).toHaveAttribute('href', '/es/habilidades/tareas')
  })

  it('si empata entre dos áreas, las muestra las dos', () => {
    montar(perfilDePrueba({ ficha: { ...perfilDePrueba().ficha, areas: ['Tecnología', 'Ventas y Marketing'] } }))
    const ficha = screen.getByRole('region', { name: 'Datos principales' })
    expect(within(ficha).getByText('Tecnología')).toBeInTheDocument()
    expect(within(ficha).getByText('Ventas y Marketing')).toBeInTheDocument()
  })

  describe('Habilidades', () => {
    it('la primera de las fuertes empieza abierta y al abrir otra se cierra la anterior', async () => {
      const usuario = montar()
      const web = screen.getByRole('button', { name: /Desarrollo web/ })
      const marketing = screen.getByRole('button', { name: /Marketing digital/ })
      expect(web).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('¿Con qué tecnologías trabajas?')).toBeInTheDocument()
      await usuario.click(marketing)
      expect(marketing).toHaveAttribute('aria-expanded', 'true')
      expect(web).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('¿Con qué tecnologías trabajas?')).not.toBeInTheDocument()
      expect(screen.getByText('¿En qué canales has trabajado?')).toBeInTheDocument()
    })

    it('muestra el texto libre que la persona escribió de la habilidad', () => {
      montar()
      expect(screen.getByText('Cuéntanos algo que hayas construido')).toBeInTheDocument()
      expect(screen.getByText('Una tienda en línea.')).toBeInTheDocument()
    })

    it('las que no tienen detalle van solo con su nivel y «Estimado», y el nivel se dice con palabras', () => {
      montar()
      const habilidades = bloque('Habilidades')
      expect(within(habilidades).getByText('Las otras habilidades que marcaste, sin más detalle:')).toBeInTheDocument()
      expect(within(habilidades).getByText('Gestión de proyectos')).toBeInTheDocument()
      expect(within(habilidades).getAllByText('Estimado')).toHaveLength(1)
      expect(within(habilidades).getByRole('img', { name: 'Nivel 5 de 5' })).toBeInTheDocument()
      expect(within(habilidades).getByRole('img', { name: 'Nivel 1 de 5' })).toBeInTheDocument()
    })

    it('si no contó nada de una habilidad fuerte, lo dice', async () => {
      const usuario = montar(perfilDePrueba({ habilidades: [{ nombre: 'Ventas', nivel: 2, estimado: true, resumen: 'Una vez', detalle: { respuestas: [] } }] }))
      expect(screen.getByText('No contaste más sobre esta habilidad.')).toBeInTheDocument()
      await usuario.click(screen.getByRole('button', { name: /Ventas/ }))
      expect(screen.queryByText('No contaste más sobre esta habilidad.')).not.toBeInTheDocument()
    })
  })

  describe('Tareas', () => {
    it('empieza plegado con cuántas son; al abrirlo muestra solo las que marcó, por grupo y con cuántas veces', async () => {
      const usuario = montar()
      const boton = screen.getByRole('button', { name: 'Tareas que has hecho · 3 de 30' })
      expect(boton).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Programar una página web')).not.toBeInTheDocument()
      await usuario.click(boton)
      expect(boton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Construir con tecnología')).toBeInTheDocument()
      expect(screen.getByText('Programar una página web')).toBeInTheDocument()
      expect(screen.getByText('Es mi trabajo')).toBeInTheDocument()
      expect(screen.getAllByText('Una vez')).not.toHaveLength(0)
    })
  })

  describe('Sobre mí', () => {
    it('muestra lo escrito, o invita a escribir si está vacío', () => {
      montar()
      expect(within(bloque('Sobre mí')).getByText('Programo desde hace cuatro años.')).toBeInTheDocument()
      expect(within(bloque('Sobre mí')).getByRole('button', { name: 'Editar Sobre mí' })).toBeInTheDocument()
    })

    it('vacío dice que es lo primero que leen y ofrece «Escribir»', () => {
      montar(perfilDePrueba({ sobreMi: '' }))
      expect(screen.getByText('Todavía no escribiste nada. Es lo primero que leen.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Escribir Sobre mí' })).toBeInTheDocument()
    })

    it('al abrir lleva el foco al cuadro, con lo que ya había; al guardar llama a la acción y muestra el texto nuevo', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Sobre mí' }))
      const cuadro = screen.getByRole('textbox', { name: 'Sobre mí' })
      expect(cuadro).toHaveFocus()
      expect(cuadro).toHaveValue('Programo desde hace cuatro años.')
      await usuario.clear(cuadro)
      await usuario.type(cuadro, '  Soy de Lima.  ')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      await waitFor(() => expect(within(bloque('Sobre mí')).getByText('Soy de Lima.')).toBeInTheDocument())
      expect(acciones.sobreMi).toHaveBeenCalledWith({ texto: '  Soy de Lima.  ' })
      expect(screen.queryByRole('textbox', { name: 'Sobre mí' })).not.toBeInTheDocument()
      // El foco vuelve al botón que lo abrió
      expect(screen.getByRole('button', { name: 'Editar Sobre mí' })).toHaveFocus()
    })

    it('un texto demasiado largo avisa con el máximo y no llama a la acción', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Sobre mí' }))
      const cuadro = screen.getByRole('textbox', { name: 'Sobre mí' })
      await usuario.clear(cuadro)
      await usuario.click(cuadro)
      await usuario.paste('a'.repeat(601))
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByText('Es demasiado largo. Máximo 600 caracteres.')).toBeInTheDocument()
      expect(acciones.sobreMi).not.toHaveBeenCalled()
    })

    it('cancelar descarta lo escrito y devuelve el foco al botón', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Sobre mí' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Sobre mí' }), ' extra')
      await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
      expect(within(bloque('Sobre mí')).getByText('Programo desde hace cuatro años.')).toBeInTheDocument()
      expect(screen.queryByText(/extra/)).not.toBeInTheDocument()
      expect(acciones.sobreMi).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Editar Sobre mí' })).toHaveFocus()
    })

    it('si no se pudo guardar, avisa y se queda editando con lo escrito', async () => {
      acciones.sobreMi.mockResolvedValueOnce({ ok: false, errores: {}, motivo: 'fallo' })
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Sobre mí' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Sobre mí' }), ' más')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar lo que escribiste.')
      expect(screen.getByRole('textbox', { name: 'Sobre mí' })).toHaveValue('Programo desde hace cuatro años. más')
    })

    it('si el servidor rechaza el texto por largo, enseña ese error', async () => {
      acciones.sobreMi.mockResolvedValueOnce({ ok: false, errores: { texto: 'textoLargo' } })
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Sobre mí' }))
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByText('Es demasiado largo. Máximo 600 caracteres.')).toBeInTheDocument()
    })
  })

  describe('Trayectoria', () => {
    it('es opcional: lo dice, y vacía invita sin presionar', () => {
      montar(perfilDePrueba({ trayectoria: [] }))
      expect(within(bloque(/Trayectoria/)).getByText('Opcional')).toBeInTheDocument()
      expect(screen.getByText('Si has trabajado en algo, súmalo. Si no, no pasa nada: puedes dejarlo vacío.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sumar Trayectoria' })).toBeInTheDocument()
    })

    it('muestra las entradas con sus años, y «hoy» cuando siguen en curso', () => {
      montar()
      expect(screen.getByText('2022 – hoy')).toBeInTheDocument()
      expect(screen.getByText('2020 – 2022')).toBeInTheDocument()
      expect(screen.getByText('Programé la tienda.')).toBeInTheDocument()
    })

    it('rechaza una entrada sin el año de inicio, rol y dónde, y no llama a la acción', async () => {
      const usuario = montar(perfilDePrueba({ trayectoria: [] }))
      await usuario.click(screen.getByRole('button', { name: 'Sumar Trayectoria' }))
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByText('Escribe el año en que empezaste, con cuatro cifras.')).toBeInTheDocument()
      expect(screen.getByText('Escribe tu rol.')).toBeInTheDocument()
      expect(screen.getByText('Escribe dónde fue: una empresa o tu propio proyecto.')).toBeInTheDocument()
      expect(acciones.trayectoria).not.toHaveBeenCalled()
    })

    it('un término anterior al inicio o un año futuro se rechaza', async () => {
      const usuario = montar(perfilDePrueba({ trayectoria: [] }))
      await usuario.click(screen.getByRole('button', { name: 'Sumar Trayectoria' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Desde (año)' }), '2025')
      await usuario.type(screen.getByRole('textbox', { name: 'Hasta (vacío = hoy)' }), '2023')
      await usuario.type(screen.getByRole('textbox', { name: 'Rol' }), 'Dev')
      await usuario.type(screen.getByRole('textbox', { name: 'Dónde (empresa o proyecto)' }), 'Mi proyecto')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByText(/no puede ser anterior al de inicio/)).toBeInTheDocument()
      expect(acciones.trayectoria).not.toHaveBeenCalled()
    })

    it('al sumar una entrada válida guarda la lista entera y la muestra, ordenada con la más reciente primero', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Trayectoria' }))
      expect(screen.getByRole('textbox', { name: 'Desde (año)' })).toHaveFocus()
      await usuario.type(screen.getByRole('textbox', { name: 'Desde (año)' }), '2024')
      await usuario.type(screen.getByRole('textbox', { name: 'Rol' }), 'Líder')
      await usuario.type(screen.getByRole('textbox', { name: 'Dónde (empresa o proyecto)' }), 'Nuevo estudio')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      await waitFor(() => expect(screen.getByText('2024 – hoy')).toBeInTheDocument())
      expect(acciones.trayectoria).toHaveBeenCalledTimes(1)
      const enviada = acciones.trayectoria.mock.calls[0]![0].entradas
      expect(enviada).toHaveLength(3)
      expect(enviada[2]).toEqual({ desde: '2024', hasta: '', rol: 'Líder', donde: 'Nuevo estudio', que: '' })
      const lista = within(bloque(/Trayectoria/)).getAllByRole('listitem')
      expect(lista[0]).toHaveTextContent('2024 – hoy')
      // El formulario queda limpio para otra entrada
      expect(screen.getByRole('textbox', { name: 'Rol' })).toHaveValue('')
    })

    it('«Quitar» guarda la lista sin esa entrada', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Trayectoria' }))
      await usuario.click(screen.getByRole('button', { name: /Quitar Desarrolladora web/ }))
      await waitFor(() => expect(screen.queryByText('2022 – hoy')).not.toBeInTheDocument())
      expect(acciones.trayectoria.mock.calls[0]![0].entradas).toHaveLength(1)
      expect(screen.getByText('2020 – 2022')).toBeInTheDocument()
    })

    it('con cinco entradas no deja sumar otra y avisa', async () => {
      const cinco = Array.from({ length: 5 }, (_, i) => ({ desde: 2015 + i, rol: `Rol ${i}`, donde: 'Lugar', que: '' }))
      const usuario = montar(perfilDePrueba({ trayectoria: cinco }))
      await usuario.click(screen.getByRole('button', { name: 'Editar Trayectoria' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Desde (año)' }), '2024')
      await usuario.type(screen.getByRole('textbox', { name: 'Rol' }), 'Otro')
      await usuario.type(screen.getByRole('textbox', { name: 'Dónde (empresa o proyecto)' }), 'Sitio')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes 5 entradas. Quita una para sumar otra.')
      expect(acciones.trayectoria).not.toHaveBeenCalled()
    })

    it('si no se pudo guardar, avisa y la lista no cambia', async () => {
      acciones.trayectoria.mockResolvedValueOnce({ ok: false, errores: { entradas: {} }, motivo: 'limite' })
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Trayectoria' }))
      await usuario.click(screen.getByRole('button', { name: /Quitar Desarrolladora web/ }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Hiciste demasiados intentos seguidos.')
      expect(screen.getByText('2022 – hoy')).toBeInTheDocument()
    })

    it('«Listo» cierra la edición y el foco vuelve al botón', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Trayectoria' }))
      await usuario.click(screen.getByRole('button', { name: 'Listo' }))
      expect(screen.queryByRole('textbox', { name: 'Rol' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Editar Trayectoria' })).toHaveFocus()
    })
  })

  describe('Evidencia', () => {
    it('muestra los enlaces como enlaces que se abren en otra pestaña sin dar acceso a esta página', () => {
      montar()
      const enlace = screen.getByRole('link', { name: 'https://anatorres.example/tienda' })
      expect(enlace).toHaveAttribute('href', 'https://anatorres.example/tienda')
      expect(enlace).toHaveAttribute('target', '_blank')
      expect(enlace.getAttribute('rel')).toContain('noopener')
      expect(enlace.getAttribute('rel')).toContain('noreferrer')
      expect(enlace.getAttribute('rel')).toContain('nofollow')
      expect(screen.getByText('Evidencia · 2 de 5')).toBeInTheDocument()
    })

    it('vacía invita a sumar enlaces', () => {
      montar(perfilDePrueba({ evidencia: [] }))
      expect(screen.getByText(/Suma enlaces a cosas que hiciste/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sumar Evidencia' })).toBeInTheDocument()
    })

    it('rechaza lo que no es https y no llama a la acción', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      expect(screen.getByRole('textbox', { name: 'Enlace' })).toHaveFocus()
      for (const mal of ['http://inseguro.example', 'javascript:alert(1)', 'https://banco.com@otro.example', 'solo texto']) {
        // Pegar es mucho más rápido que escribir letra por letra, y para esta prueba da igual
        await usuario.clear(screen.getByRole('textbox', { name: 'Enlace' }))
        await usuario.click(screen.getByRole('textbox', { name: 'Enlace' }))
        await usuario.paste(mal)
        await usuario.click(screen.getByRole('button', { name: 'Agregar' }))
        expect(await screen.findByText('Escribe un enlace completo que empiece con https://'), mal).toBeInTheDocument()
      }
      expect(acciones.evidencia).not.toHaveBeenCalled()
    })

    it('rechaza un enlace repetido', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      await usuario.click(screen.getByRole('textbox', { name: 'Enlace' }))
      await usuario.paste('https://GitHub.com/anatorres')
      await usuario.click(screen.getByRole('button', { name: 'Agregar' }))
      expect(await screen.findByText('Ese enlace ya está en la lista.')).toBeInTheDocument()
      expect(acciones.evidencia).not.toHaveBeenCalled()
    })

    it('al agregar uno válido guarda la lista entera, lo muestra normalizado y limpia el campo', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Enlace' }), 'https://nuevo.example')
      await usuario.click(screen.getByRole('button', { name: 'Agregar' }))
      await waitFor(() => expect(screen.getByRole('link', { name: 'https://nuevo.example/' })).toBeInTheDocument())
      expect(acciones.evidencia).toHaveBeenCalledWith({ enlaces: ['https://anatorres.example/tienda', 'https://github.com/anatorres', 'https://nuevo.example'] })
      expect(screen.getByRole('textbox', { name: 'Enlace' })).toHaveValue('')
      expect(screen.getByText('Evidencia · 3 de 5')).toBeInTheDocument()
    })

    it('«Quitar» guarda la lista sin ese enlace', async () => {
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      await usuario.click(screen.getByRole('button', { name: /Quitar https:\/\/github.com/ }))
      await waitFor(() => expect(screen.queryByRole('link', { name: 'https://github.com/anatorres' })).not.toBeInTheDocument())
      expect(acciones.evidencia).toHaveBeenCalledWith({ enlaces: ['https://anatorres.example/tienda'] })
    })

    it('con cinco enlaces el botón de agregar está apagado', async () => {
      const cinco = Array.from({ length: 5 }, (_, i) => `https://a.example/${i}`)
      const usuario = montar(perfilDePrueba({ evidencia: cinco }))
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled()
    })

    it('si el servidor rechaza el enlace aunque el navegador lo dio por bueno, enseña el error', async () => {
      acciones.evidencia.mockResolvedValueOnce({ ok: false, errores: { enlaces: { 2: 'enlaceInvalido' } } })
      const usuario = montar()
      await usuario.click(screen.getByRole('button', { name: 'Editar Evidencia' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Enlace' }), 'https://nuevo.example')
      await usuario.click(screen.getByRole('button', { name: 'Agregar' }))
      expect(await screen.findByText('Escribe un enlace completo que empiece con https://')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'https://nuevo.example/' })).not.toBeInTheDocument()
    })
  })

  describe('Avance y vista previa', () => {
    it('dice cuántas partes están hechas, y sube al completar Sobre mí', async () => {
      const usuario = montar(perfilDePrueba({ sobreMi: '' }))
      const avance = screen.getByRole('heading', { name: /Tu perfil, \d de 3/ })
      expect(avance).toHaveTextContent('Tu perfil, 2 de 3')
      await usuario.click(screen.getByRole('button', { name: 'Escribir Sobre mí' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Sobre mí' }), 'Hola')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      await waitFor(() => expect(screen.getByRole('heading', { name: /Tu perfil, \d de 3/ })).toHaveTextContent('Tu perfil, 3 de 3'))
    })

    it('la trayectoria no cuenta para el avance: sin ella sigue en 3 de 3', () => {
      montar(perfilDePrueba({ trayectoria: [] }))
      expect(screen.getByRole('heading', { name: /Tu perfil, \d de 3/ })).toHaveTextContent('Tu perfil, 3 de 3')
    })

    it('la tarjeta del directorio muestra el nombre, dos líneas de «Sobre mí», tres habilidades con su nivel y lo que busca', () => {
      montar()
      const tarjeta = screen.getByRole('article')
      expect(within(tarjeta).getByRole('heading', { name: 'Ana Torres' })).toBeInTheDocument()
      expect(tarjeta).toHaveTextContent('Programo desde hace cuatro años.')
      expect(within(tarjeta).getAllByRole('img', { name: /Nivel \d de 5/ })).toHaveLength(3)
      expect(tarjeta).toHaveTextContent('Busca: Un socio comercial · Todavía explorando')
    })

    it('sin «Sobre mí» la tarjeta no muestra esa línea ni deja un párrafo vacío en su lugar', () => {
      montar(perfilDePrueba({ sobreMi: '' }))
      const tarjeta = screen.getByRole('article')
      expect(tarjeta).not.toHaveTextContent('Programo desde hace cuatro años.')
      // Quedan solo dónde vive y lo que busca; con «Sobre mí» serían tres
      expect(tarjeta.querySelectorAll('p')).toHaveLength(2)
    })

    it('con «Sobre mí» la tarjeta tiene esa línea', () => {
      montar()
      expect(screen.getByRole('article').querySelectorAll('p')).toHaveLength(3)
    })

    it('la tarjeta sigue lo último que se guardó en el perfil', async () => {
      const usuario = montar(perfilDePrueba({ sobreMi: '' }))
      await usuario.click(screen.getByRole('button', { name: 'Escribir Sobre mí' }))
      await usuario.type(screen.getByRole('textbox', { name: 'Sobre mí' }), 'Busco socio de ventas')
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }))
      await waitFor(() => expect(screen.getByRole('article')).toHaveTextContent('Busco socio de ventas'))
    })

    it('«Ver como me ven» abre una ventana con la tarjeta y se puede cerrar', async () => {
      const usuario = montar()
      const ventana = document.querySelector('dialog') as HTMLDialogElement
      expect(ventana).not.toHaveAttribute('open')
      await usuario.click(screen.getByRole('button', { name: 'Ver como me ven' }))
      expect(ventana).toHaveAttribute('open')
      expect(within(ventana).getByRole('heading', { name: 'Así te ven en Descubrir' })).toBeInTheDocument()
      expect(within(ventana).getByRole('article')).toHaveTextContent('Ana Torres')
      expect(within(ventana).getByText('Así se vería tu tarjeta en el directorio.')).toBeInTheDocument()
      await usuario.click(within(ventana).getByRole('button', { name: 'Cerrar' }))
      expect(ventana).not.toHaveAttribute('open')
    })
  })

  describe('Qué buscas y forma de emprender', () => {
    it('muestra lo que buscó en la bienvenida', () => {
      montar()
      const buscando = bloque('Qué estás buscando')
      expect(within(buscando).getByText('Un socio comercial')).toBeInTheDocument()
      expect(within(buscando).getByText('Todavía explorando')).toBeInTheDocument()
    })

    it('muestra las respuestas de la forma de emprender con sus preguntas, el perfil que busca y el socio ideal', () => {
      montar()
      const forma = bloque('Tu forma de emprender')
      expect(within(forma).getByText('¿Cuándo quieres arrancar?')).toBeInTheDocument()
      expect(within(forma).getByText('Ya mismo')).toBeInTheDocument()
      expect(within(forma).getByText('¿Qué perfil buscas para tu equipo?')).toBeInTheDocument()
      expect(within(forma).getByText('Ventas y Marketing')).toBeInTheDocument()
      expect(within(forma).getByText('Alguien que venda.')).toBeInTheDocument()
    })

    it('si no escribió el socio ideal, lo dice', () => {
      montar(perfilDePrueba({ socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: '' } }))
      expect(within(bloque('Tu forma de emprender')).getByText('No escribiste nada.')).toBeInTheDocument()
    })

    it('«Tus historias» muestra lo escrito y los sectores, y si no escribió nada, lo dice', () => {
      montar()
      const historias = bloque('Tus historias')
      expect(within(historias).getByText('Armé una tienda en línea.')).toBeInTheDocument()
      expect(within(historias).getByText('Sectores que te mueven')).toBeInTheDocument()
      expect(within(historias).getByText('Educación')).toBeInTheDocument()
    })

    it('«Tus historias» sin nada escrito dice que no escribió nada en el paso', () => {
      montar(perfilDePrueba({ historias: [{ pregunta: 'Algo que lograste', texto: '  ', aceptaMostrar: true }], sectores: { pregunta: 'Sectores que te mueven', respuestas: [] } }))
      expect(within(bloque('Tus historias')).getByText('No escribiste nada en este paso.')).toBeInTheDocument()
    })
  })
})
