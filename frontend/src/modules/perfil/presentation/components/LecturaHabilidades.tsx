import type { HabilidadPerfil } from '../../domain/perfil'
import type { TextosPerfil } from '../../language/tipos'
import { NombreHabilidad } from '../ui/NombreHabilidad'
import { ParRespuesta } from '../ui/ParRespuesta'
import { PuntosNivel } from '../ui/PuntosNivel'
import { Respuestas } from '../ui/Respuestas'
import { TarjetaBloque } from '../ui/TarjetaBloque'

// «Habilidades» tal como las lee otra persona: nivel, resumen y, abierto, lo que la persona contó de cada una.
export function LecturaHabilidades({ textos, habilidades }: { textos: TextosPerfil; habilidades: HabilidadPerfil[] }) {
  return (
    <TarjetaBloque titulo={textos.habilidades.titulo}>
      {habilidades.map((habilidad) => {
        const respuestas = habilidad.detalle?.respuestas ?? []
        const texto = habilidad.detalle?.texto
        return (
          <div key={habilidad.nombre} className="border-b border-borde/10 py-3.5 first:pt-0 last:border-b-0 last:pb-0">
            <h3 className="grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1">
              <NombreHabilidad habilidad={habilidad} textos={textos} />
              <PuntosNivel nivel={habilidad.nivel} etiqueta={textos.habilidades.nivel} />
              <span className="text-nota col-span-full text-texto-tenue">{habilidad.resumen}</span>
            </h3>
            {(respuestas.length > 0 || texto) && (
              <div className="mt-3 grid gap-3.5">
                {respuestas.map((respuesta) => (
                  <ParRespuesta key={respuesta.pregunta} pregunta={respuesta.pregunta}>
                    <Respuestas respuestas={respuesta.respuestas} />
                  </ParRespuesta>
                ))}
                {texto && (
                  <ParRespuesta pregunta={texto.pregunta}>
                    <p className="text-parrafo rounded-2xl bg-suave px-4 py-3 whitespace-pre-line">{texto.texto}</p>
                  </ParRespuesta>
                )}
              </div>
            )}
          </div>
        )
      })}
    </TarjetaBloque>
  )
}
