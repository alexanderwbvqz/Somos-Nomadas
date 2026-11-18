'use client'

import Image from 'next/image'
import { useState } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { useMostrarMas } from '@/shared/lib/useMostrarMas'
import { Boton } from '@/shared/ui/Boton'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import { tiposAliado, type Aliado } from '../../domain/Aliado'
import { contarPorTipo, filtrarAliados, type FiltroAliados } from '../../domain/aliados'
import { colorTipoAliado } from '../ui/coloresTipoAliado'

/** Un aliado listo para mostrar: el del dominio más su etiqueta de tipo y su enlace */
export type AliadoVista = Aliado & { etiquetaTipo: string; href: string }

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

function ListaPaginada({ textos, aliados, porPagina }: { textos: SeccionListadoAliadosProps['textos']; aliados: AliadoVista[]; porPagina: number }) {
  const { visibles, quedanPorMostrar, mostrarMas, refEstado, total } = useMostrarMas(aliados, porPagina)

  if (aliados.length === 0) return <p className="text-parrafo py-16 text-center">{textos.vacio}</p>

  return (
    <>
      <ul className="grid gap-x-10 sm:grid-cols-2 escritorio:grid-cols-3">
        {visibles.map((aliado) => (
          <li key={aliado.id} className="mt-11 flex flex-col">
            <div className={`flex h-36 items-center justify-center border-b-[1.5px] border-texto p-4 text-center ${colorTipoAliado[aliado.tipo]}`}>
              {aliado.logoSrc ? (
                <Image src={aliado.logoSrc} alt="" width={200} height={64} unoptimized className="h-16 w-auto" />
              ) : (
                <span aria-hidden="true" className="text-titulo-tarjeta texto-equilibrado">
                  {aliado.nombre}
                </span>
              )}
            </div>
            <h3 className="text-titulo-tarjeta-grande mt-5">{aliado.nombre}</h3>
            <p className="text-etiqueta-chica mt-3">{aliado.etiquetaTipo}</p>
            {/* Tope de cinco líneas: red de seguridad para textos largos o columnas estrechas; el texto completo irá en su página */}
            <p className="text-cuerpo mt-3 line-clamp-5 max-w-md">{aliado.descripcion}</p>
            <div className="mt-5">
              <EnlaceBoton href={aliado.href} variante="enlace">
                {textos.leerMas}
              </EnlaceBoton>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-col items-center gap-5">
        <p ref={refEstado} tabIndex={-1} aria-live="polite" className="text-etiqueta-chica outline-none">
          {rellenarPlantilla(textos.mostrando, { mostrados: visibles.length, total })}
        </p>
        {quedanPorMostrar && (
          <Boton flechaAbajo alPulsar={mostrarMas}>
            {textos.verMas}
          </Boton>
        )}
      </div>
    </>
  )
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
