import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { datosFormaVacios } from '@/modules/habilidades/domain/forma'
import { textosHabilidades } from '@/modules/habilidades/language'
import { FormaView } from '@/modules/habilidades/presentation/FormaView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarFormaAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraDePaso } from './BarraDePaso'

const PASO = 4

// Cuarto y último paso de preguntas del recorrido: lo que ya había contestado (si vuelve) se lee aquí.
export async function FormaConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { forma } = await obtenerRespuestas(crearRespuestasRepository())

  return (
    <FormaView
      textos={textos}
      inicial={forma ?? datosFormaVacios()}
      alGuardar={guardarFormaAccion}
      barra={<BarraDePaso idioma={idioma} textos={textos} paso={PASO} nombre={textos.forma.titulo} />}
      paso={PASO}
      hrefAtras={`/${idioma}/habilidades/historias`}
      hrefSiguiente={`/${idioma}/habilidades/listo`}
    />
  )
}
