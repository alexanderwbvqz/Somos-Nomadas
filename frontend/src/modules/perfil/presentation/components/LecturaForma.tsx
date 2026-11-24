import type { RespuestaPerfil, TextoPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { ParRespuesta } from '../ui/ParRespuesta'
import { Respuestas } from '../ui/Respuestas'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; forma: RespuestaPerfil[]; buscaPerfil: RespuestaPerfil; socioIdeal: TextoPerfil }

// «Forma de emprender» tal como la lee otra persona: las respuestas, el perfil que busca para su equipo y cómo es su socio ideal.
// Lo que no se contestó no sale: aquí no hay nada que invitar a completar.
export function LecturaForma({ textos, forma, buscaPerfil, socioIdeal }: Props) {
  const hayBuscaPerfil = buscaPerfil.respuestas.length > 0
  const haySocio = socioIdeal.texto.trim() !== ''

  return (
    <TarjetaBloque titulo={textos.publico.forma}>
      {forma.length > 0 && (
        <div className="grid grid-cols-1 gap-x-7 gap-y-4 escritorio:grid-cols-2">
          {forma.map((respuesta) => (
            <ParRespuesta key={respuesta.pregunta} pregunta={respuesta.pregunta}>
              <Respuestas respuestas={respuesta.respuestas} />
            </ParRespuesta>
          ))}
        </div>
      )}
      {forma.length > 0 && (hayBuscaPerfil || haySocio) && <hr className="my-5 border-borde/15" />}
      {(hayBuscaPerfil || haySocio) && (
        <div className="grid gap-[1.125rem]">
          {hayBuscaPerfil && (
            <ParRespuesta pregunta={textos.publico.buscaPerfil}>
              <Respuestas respuestas={buscaPerfil.respuestas} />
            </ParRespuesta>
          )}
          {haySocio && (
            <ParRespuesta pregunta={textos.publico.socioIdeal}>
              <p className="text-parrafo whitespace-pre-line">{socioIdeal.texto}</p>
            </ParRespuesta>
          )}
        </div>
      )}
    </TarjetaBloque>
  )
}
