import { foco } from '@/shared/ui/EnlaceBoton'
import type { TextosPerfil } from '../../language/tipos'
import { TarjetaBloque } from '../ui/TarjetaBloque'

// «Evidencia» tal como la lee otra persona: los enlaces, que se abren en otra pestaña sin dar acceso a esta página.
export function LecturaEvidencia({ textos, enlaces }: { textos: TextosPerfil; enlaces: string[] }) {
  return (
    <TarjetaBloque titulo={textos.evidencia.titulo}>
      <ul className="grid gap-2">
        {enlaces.map((enlace) => (
          <li key={enlace} className="rounded-2xl border-[1.5px] border-texto/20 px-3.5 py-2.5 [overflow-wrap:anywhere]">
            <a href={enlace} target="_blank" rel="noopener noreferrer nofollow" className={`underline underline-offset-4 ${foco}`}>
              {enlace}
            </a>
          </li>
        ))}
      </ul>
    </TarjetaBloque>
  )
}
