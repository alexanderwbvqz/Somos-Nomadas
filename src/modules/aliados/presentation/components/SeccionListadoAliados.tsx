'use client'

import { useState } from 'react'
import { tiposAliado } from '../../domain/Aliado'
import { contarPorTipo, filtrarAliados, type FiltroAliados } from '../../domain/aliados'
import type { AliadoVista } from '../ui/TarjetaAliado'
import { ListaPaginada } from '../ui/ListaPaginada'

export type { AliadoVista } from '../ui/TarjetaAliado'

export type SeccionListadoAliadosProps = {
  textos: {
    etiquetaFiltro: string
    todos: string
    tipos: Record<(typeof tiposAliado)[number], { plural: string; singular: string }>
    leerMas: string
    verMas: string
    mostrando: string
    vacio: string
  }
  aliados: AliadoVista[]
  /** Filtro con el que se abre la página (viene de ?tipo= en la URL) */
  filtroInicial?: FiltroAliados
  porPagina?: number
}

export function SeccionListadoAliados({ textos, aliados, filtroInicial = 'todos', porPagina = 9 }: SeccionListadoAliadosProps) {
  const [filtro, setFiltro] = useState<FiltroAliados>(filtroInicial)
  const cuenta = contarPorTipo(aliados)
  const filtrados = filtrarAliados(aliados, filtro)

  function elegir(nuevo: FiltroAliados) {
    setFiltro(nuevo)
    // La URL refleja el filtro para poder compartir o volver a la misma vista
    const ruta = window.location.pathname
    window.history.replaceState(window.history.state, '', nuevo === 'todos' ? ruta : `${ruta}?tipo=${nuevo}`)
  }

  const opciones: { filtro: FiltroAliados; texto: string; cantidad: number }[] = [
    { filtro: 'todos', texto: textos.todos, cantidad: aliados.length },
    ...tiposAliado.map((tipo) => ({ filtro: tipo, texto: textos.tipos[tipo].plural, cantidad: cuenta[tipo] })),
  ]

  return (
    <section aria-label={textos.etiquetaFiltro} className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16 escritorio:px-12 escritorio:pb-24 escritorio:pt-[4.5rem]">
      <div role="group" aria-label={textos.etiquetaFiltro} className="flex flex-wrap gap-2 border-b-[1.5px] border-texto pb-5">
        {opciones.map((opcion) => (
          <button
            key={opcion.filtro}
            type="button"
            aria-pressed={filtro === opcion.filtro}
            onClick={() => elegir(opcion.filtro)}
            className={`text-etiqueta-chica rounded-full border-2 border-texto px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${
              filtro === opcion.filtro ? 'bg-texto text-fondo' : 'text-texto hover:bg-suave'
            }`}
          >
            {opcion.texto} · {opcion.cantidad}
          </button>
        ))}
      </div>

      {/* Se remonta al cambiar de filtro para volver a mostrar los primeros */}
      <ListaPaginada key={filtro} textos={textos} aliados={filtrados} porPagina={porPagina} />
    </section>
  )
}
