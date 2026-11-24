import { Badge } from '@/shared/ui/Badge'
import type { HabilidadPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'

// El nombre de una habilidad, con la insignia «Estimado» si su nivel no se sabe del todo.
export function NombreHabilidad({ habilidad, textos }: { habilidad: HabilidadPerfil; textos: TextosPerfil }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[1.0625rem] font-medium">
      {habilidad.nombre}
      {habilidad.estimado && <Badge>{textos.habilidades.estimado}</Badge>}
    </span>
  )
}
