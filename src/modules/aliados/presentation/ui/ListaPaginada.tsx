'use client'

import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { useMostrarMas } from '@/shared/lib/useMostrarMas'
import { Boton } from '@/shared/ui/Boton'
import { TarjetaAliado, type AliadoVista } from './TarjetaAliado'

type Props = {
  textos: { vacio: string; leerMas: string; mostrando: string; verMas: string }
  aliados: AliadoVista[]
  porPagina: number
}

export function ListaPaginada({ textos, aliados, porPagina }: Props) {
  const { visibles, quedanPorMostrar, mostrarMas, refEstado, total } = useMostrarMas(aliados, porPagina)

  if (aliados.length === 0) return <p className="text-parrafo py-16 text-center">{textos.vacio}</p>

  return (
    <>
      <ul className="grid gap-x-10 sm:grid-cols-2 escritorio:grid-cols-3">
        {visibles.map((aliado) => (
          <li key={aliado.id} className="mt-11 flex flex-col">
            <TarjetaAliado aliado={aliado} textoLeerMas={textos.leerMas} nivelTitulo="h2" />
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
