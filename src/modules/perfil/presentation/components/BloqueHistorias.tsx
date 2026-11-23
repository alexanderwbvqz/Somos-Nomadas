import type { RespuestaPerfil, TextoPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import type { PasoPerfil } from '../pasos'
import { EnlaceEditar } from '../ui/EnlaceEditar'
import { ParRespuesta, Respuestas } from '../ui/ParRespuesta'
import { TarjetaBloque } from '../ui/TarjetaBloque'

type Props = { textos: TextosPerfil; paso: PasoPerfil; historias: TextoPerfil[]; sectores: RespuestaPerfil }

// «Tus historias»: lo que la persona escribió con sus palabras y los sectores que le mueven. Si no escribió nada, lo dice.
export function BloqueHistorias({ textos, paso, historias, sectores }: Props) {
  const hayAlgo = historias.some((historia) => historia.texto.trim() !== '') || sectores.respuestas.length > 0

  return (
    <TarjetaBloque titulo={paso.nombre} accion={<EnlaceEditar textos={textos} paso={paso} />}>
      {hayAlgo ? (
        <div className="grid gap-[1.125rem]">
          {historias
            .filter((historia) => historia.texto.trim() !== '')
            .map((historia) => (
              <ParRespuesta key={historia.pregunta} pregunta={historia.pregunta}>
                <p className="text-parrafo whitespace-pre-line">{historia.texto}</p>
              </ParRespuesta>
            ))}
          {sectores.respuestas.length > 0 && (
            <>
              <hr className="border-borde/15" />
              <ParRespuesta pregunta={sectores.pregunta}>
                <Respuestas respuestas={sectores.respuestas} />
              </ParRespuesta>
            </>
          )}
        </div>
      ) : (
        <p className="text-parrafo italic opacity-65">{textos.sinEscribirPaso}</p>
      )}
    </TarjetaBloque>
  )
}
