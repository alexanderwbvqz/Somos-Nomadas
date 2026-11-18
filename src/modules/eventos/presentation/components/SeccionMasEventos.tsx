'use client'

import { useEffect, useRef, useState } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Badge } from '@/shared/ui/Badge'
import { Boton } from '@/shared/ui/Boton'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'

export type EventoListadoVista = {
  id: string
  nombre: string
  /** Fecha ya formateada, por ejemplo "20 ene 2027" */
  fecha: string
  lugar: string
  modalidad: string
  hrefConfirmar: string
}

export type SeccionMasEventosProps = {
  textos: {
    etiquetaSeccion: string
    contador: string
    verMas: string
    mostrando: string
    confirmar: string
  }
  eventos: EventoListadoVista[]
  /** Cuántos eventos se muestran al principio y se añaden cada vez */
  porPagina?: number
}

export function SeccionMasEventos({ textos, eventos, porPagina = 9 }: SeccionMasEventosProps) {
  const [mostrados, setMostrados] = useState(porPagina)
  const estado = useRef<HTMLParagraphElement>(null)
  const yaSeAmplio = useRef(false)

  const visibles = eventos.slice(0, mostrados)
  const quedanPorMostrar = mostrados < eventos.length

  // Al mostrar el último grupo el botón desaparece: el foco pasa al estado para no perderse
  useEffect(() => {
    if (yaSeAmplio.current && !quedanPorMostrar) estado.current?.focus()
  }, [quedanPorMostrar])

  if (eventos.length === 0) return null

  return (
    <section aria-labelledby="titulo-mas-eventos" className="mx-auto w-full max-w-7xl px-6 pb-16 escritorio:px-12 escritorio:pb-24">
      <div className="flex items-baseline justify-between gap-5 border-b-[1.5px] border-texto pb-4">
        <h2 id="titulo-mas-eventos" className="text-etiqueta">
          {textos.etiquetaSeccion}
        </h2>
        <p className="text-etiqueta-chica">{rellenarPlantilla(textos.contador, { cantidad: eventos.length })}</p>
      </div>

      <ul className="grid gap-x-10 sm:grid-cols-2 escritorio:grid-cols-3">
        {visibles.map((evento) => (
          <li key={evento.id} className="fondo-fila mt-9 flex flex-col border-t-[1.5px] border-texto px-5 pb-9 pt-6">
            <div>
              <Badge>{evento.modalidad}</Badge>
            </div>
            <h3 className="text-titulo-tarjeta texto-equilibrado mt-4">{evento.nombre}</h3>
            <p className="text-etiqueta mt-4">{evento.fecha}</p>
            <p className="text-parrafo mt-1">{evento.lugar}</p>
            <div className="mt-5">
              <EnlaceBoton href={evento.hrefConfirmar} variante="enlace">
                {textos.confirmar}
              </EnlaceBoton>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-center gap-5">
        <p ref={estado} tabIndex={-1} aria-live="polite" className="text-etiqueta-chica outline-none">
          {rellenarPlantilla(textos.mostrando, { mostrados: visibles.length, total: eventos.length })}
        </p>
        {quedanPorMostrar && (
          <Boton
            flechaAbajo
            alPulsar={() => {
              yaSeAmplio.current = true
              setMostrados((actuales) => actuales + porPagina)
            }}
          >
            {textos.verMas}
          </Boton>
        )}
      </div>
    </section>
  )
}
