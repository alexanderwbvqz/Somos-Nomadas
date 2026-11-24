import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import type { CapaPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'

// Cuántas de las partes del perfil están hechas y cuáles faltan. La trayectoria no cuenta: es opcional.
export function AvancePerfil({ textos, capas }: { textos: TextosPerfil; capas: CapaPerfil[] }) {
  const hechas = capas.filter((capa) => capa.hecha).length
  return (
    <section className="rounded-3xl bg-tarjeta px-6 py-[1.375rem]">
      <h2 className="font-serif text-[1.375rem]">{rellenarPlantilla(textos.avance.titulo, { n: hechas, total: capas.length })}</h2>
      <p className="text-nota mt-1 text-texto-suave">{textos.avance.ayuda}</p>
      <ul className="mt-3.5 grid gap-2.5">
        {capas.map((capa) => (
          <li key={capa.id} data-hecha={capa.hecha} className="flex items-center gap-2.5">
            <span aria-hidden="true" className={`flex size-5 flex-none items-center justify-center rounded-full border-[1.5px] border-texto text-[0.6875rem] ${capa.hecha ? 'bg-texto text-fondo' : ''}`}>
              {capa.hecha ? '✓' : ''}
            </span>
            <span>
              {textos.avance.capas[capa.id]}{' '}
              <span className="sr-only">({capa.hecha ? '✓' : '—'})</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
