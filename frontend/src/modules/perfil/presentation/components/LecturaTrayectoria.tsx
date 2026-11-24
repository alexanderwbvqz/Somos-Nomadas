import type { EntradaTrayectoria } from '../../domain/trayectoria'
import type { TextosPerfil } from '../../language/tipos'
import { rangoAnios } from '../mappers/rangoAnios'
import { TarjetaBloque } from '../ui/TarjetaBloque'

// «Trayectoria» tal como la lee otra persona: dónde ha trabajado, sin nada que editar.
export function LecturaTrayectoria({ textos, entradas }: { textos: TextosPerfil; entradas: EntradaTrayectoria[] }) {
  return (
    <TarjetaBloque titulo={textos.trayectoria.titulo}>
      <ul className="grid gap-2.5">
        {entradas.map((entrada) => (
          <li key={`${entrada.desde}-${entrada.rol}-${entrada.donde}`} className="grid grid-cols-1 items-start gap-x-[1.125rem] gap-y-1 rounded-2xl border-[1.5px] border-texto/20 px-4 py-3 escritorio:grid-cols-[9.5rem_1fr]">
            <span className="text-etiqueta-chica pt-0.5 text-texto-tenue">{rangoAnios(entrada, textos.trayectoria.hoy)}</span>
            <div>
              <p className="font-medium">
                {entrada.rol} <span className="font-normal text-texto-tenue">· {entrada.donde}</span>
              </p>
              {entrada.que && <p className="text-nota mt-1 text-texto-tenue">{entrada.que}</p>}
            </div>
          </li>
        ))}
      </ul>
    </TarjetaBloque>
  )
}
