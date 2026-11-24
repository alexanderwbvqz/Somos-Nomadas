import type { TextosPerfil } from '../../language/tipos'
import { Respuestas } from '../ui/Respuestas'
import { TarjetaBloque } from '../ui/TarjetaBloque'

// «Qué busca» tal como lo lee otra persona: lo que se marcó en la bienvenida.
export function LecturaBuscando({ textos, buscando }: { textos: TextosPerfil; buscando: string[] }) {
  return (
    <TarjetaBloque titulo={textos.publico.busca}>
      <Respuestas respuestas={buscando} />
    </TarjetaBloque>
  )
}
