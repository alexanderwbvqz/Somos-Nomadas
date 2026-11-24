import type { TextosPerfil } from '../../language/tipos'
import { TarjetaBloque } from '../ui/TarjetaBloque'

// «Sobre mí» tal como lo lee otra persona: solo el texto, sin nada que editar.
export function LecturaSobreMi({ textos, sobreMi }: { textos: TextosPerfil; sobreMi: string }) {
  return (
    <TarjetaBloque titulo={textos.sobreMi.titulo}>
      <p className="text-parrafo whitespace-pre-line">{sobreMi}</p>
    </TarjetaBloque>
  )
}
