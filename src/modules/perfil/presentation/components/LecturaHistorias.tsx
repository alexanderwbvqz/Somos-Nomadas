import type { RespuestaPerfil, TextoPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { ParRespuesta } from '../ui/ParRespuesta'
import { Respuestas } from '../ui/Respuestas'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; historias: TextoPerfil[]; sectores: RespuestaPerfil }

// «Historias» tal como las lee otra persona: solo las que se aceptó mostrar (ya vienen filtradas) y los sectores que mueven.
export function LecturaHistorias({ textos, historias, sectores }: Props) {
  return (
    <TarjetaBloque titulo={textos.publico.historias}>
      <div className="grid gap-[1.125rem]">
        {historias.map((historia) => (
          <ParRespuesta key={historia.pregunta} pregunta={historia.pregunta}>
            <p className="text-parrafo whitespace-pre-line">{historia.texto}</p>
          </ParRespuesta>
        ))}
        {historias.length > 0 && sectores.respuestas.length > 0 && <hr className="border-borde/15" />}
        {sectores.respuestas.length > 0 && (
          <ParRespuesta pregunta={textos.publico.sectores}>
            <Respuestas respuestas={sectores.respuestas} />
          </ParRespuesta>
        )}
      </div>
    </TarjetaBloque>
  )
}
