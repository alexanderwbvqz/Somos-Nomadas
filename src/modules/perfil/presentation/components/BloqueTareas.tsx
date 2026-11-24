'use client'

import { useId, useState } from 'react'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Badge } from '@/shared/ui/Badge'
import { foco } from '@/shared/ui/EnlaceBoton'
import type { Perfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'

// Los colores se reparten de tres en tres entre los grupos; solo adornan, no dicen nada del grupo
const coloresPastilla = ['bg-degradado-amarillo', 'bg-degradado-azul', 'bg-degradado-durazno'] as const

// «Tareas que has hecho»: se ve cuántas son y, al abrirlo, solo las que la persona marcó, en sus grupos y con cuántas veces las hizo.
export function BloqueTareas({ textos, tareas }: { textos: TextosPerfil; tareas: Perfil['tareas'] }) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const hechas = tareas.grupos.reduce((suma, grupo) => suma + grupo.tareas.length, 0)

  return (
    <section className="rounded-3xl bg-tarjeta px-6 py-7 escritorio:px-8">
      <h2>
        <button type="button" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(!abierto)} className={`flex w-full cursor-pointer items-center justify-between gap-3.5 text-left ${foco}`}>
          <span className="text-etiqueta-chica text-texto-tenue">{rellenarPlantilla(textos.tareas.titulo, { n: hechas, total: tareas.total })}</span>
          <span aria-hidden="true" className="flex size-[1.625rem] flex-none items-center justify-center rounded-full border-[1.5px] border-texto leading-none">
            {abierto ? '−' : '+'}
          </span>
        </button>
      </h2>
      {abierto && (
        <div id={id} className="mt-[1.125rem] grid gap-5">
          {tareas.grupos
            .filter((grupo) => grupo.tareas.length > 0)
            .map((grupo, lugar) => (
              <div key={grupo.grupo}>
                <h3 className="text-etiqueta-chica mb-2 flex items-center gap-2.5">
                  <span aria-hidden="true" className={`block h-2.5 w-[1.375rem] rounded ${coloresPastilla[lugar % coloresPastilla.length]}`} />
                  {grupo.grupo}
                </h3>
                <ul className="grid gap-2">
                  {grupo.tareas.map((tarea) => (
                    <li key={tarea.texto} className="flex flex-col justify-between gap-1.5 rounded-2xl border-[1.5px] border-texto/20 px-3.5 py-2.5 escritorio:flex-row escritorio:items-center escritorio:gap-3.5">
                      <span>{tarea.texto}</span>
                      <Badge formato="respuesta">{tarea.veces}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </section>
  )
}
