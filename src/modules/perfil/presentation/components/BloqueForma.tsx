import type { Perfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'
import { EnlaceEditar } from '../ui/EnlaceEditar'
import { ParRespuesta, Respuestas } from '../ui/ParRespuesta'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; paso: PasoPerfil; forma: Perfil['forma']; buscaPerfil: Perfil['buscaPerfil']; socioIdeal: Perfil['socioIdeal'] }

// «Tu forma de emprender»: las respuestas de las preguntas, el perfil que busca para su equipo y cómo es su socio ideal.
export function BloqueForma({ textos, paso, forma, buscaPerfil, socioIdeal }: Props) {
  return (
    <TarjetaBloque titulo={paso.nombre} accion={<EnlaceEditar textos={textos} paso={paso} />}>
      {forma.length > 0 && (
        <div className="grid grid-cols-1 gap-x-7 gap-y-4 escritorio:grid-cols-2">
          {forma.map((respuesta) => (
            <ParRespuesta key={respuesta.pregunta} pregunta={respuesta.pregunta}>
              <Respuestas respuestas={respuesta.respuestas} />
            </ParRespuesta>
          ))}
        </div>
      )}
      <hr className="my-5 border-borde/15" />
      <div className="grid gap-[1.125rem]">
        <ParRespuesta pregunta={buscaPerfil.pregunta}>
          {buscaPerfil.respuestas.length > 0 ? <Respuestas respuestas={buscaPerfil.respuestas} /> : <p className="text-parrafo italic opacity-65">{textos.sinEscribir}</p>}
        </ParRespuesta>
        <ParRespuesta pregunta={socioIdeal.pregunta}>
          {socioIdeal.texto.trim() !== '' ? <p className="text-parrafo whitespace-pre-line">{socioIdeal.texto}</p> : <p className="text-parrafo italic opacity-65">{textos.sinEscribir}</p>}
        </ParRespuesta>
      </div>
    </TarjetaBloque>
  )
}
