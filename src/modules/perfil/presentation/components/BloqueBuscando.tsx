import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'
import { EnlaceEditar } from './EnlaceEditar'
import { Respuestas } from './ParRespuesta'
import { TarjetaBloque } from './TarjetaBloque'

// «Qué estás buscando», lo que la persona marcó en la bienvenida.
export function BloqueBuscando({ textos, paso, buscando }: { textos: TextosPerfil; paso: PasoPerfil; buscando: string[] }) {
  return (
    <TarjetaBloque titulo={paso.nombre} accion={<EnlaceEditar textos={textos} paso={paso} />}>
      <Respuestas respuestas={buscando} />
    </TarjetaBloque>
  )
}
