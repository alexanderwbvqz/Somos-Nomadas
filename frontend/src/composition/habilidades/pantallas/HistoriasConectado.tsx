import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { datosHistoriasVacios } from '@/modules/habilidades/domain/historias'
import { textosHabilidades } from '@/modules/habilidades/language'
import { HistoriasView } from '@/modules/habilidades/presentation/HistoriasView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarHistoriasAccion } from '@/composition/habilidades/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/habilidades/fabricas/respuestas'
import { BarraDePaso } from './BarraDePaso'

const PASO = 3

// Tercer paso del recorrido: lo que la persona ya había escrito (si vuelve) se lee aquí y se le pasa a la vista.
export async function HistoriasConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { historias } = await obtenerRespuestas(crearRespuestasRepository())

  return (
    <HistoriasView
      textos={textos}
      inicial={historias ?? datosHistoriasVacios()}
      alGuardar={guardarHistoriasAccion}
      barra={<BarraDePaso idioma={idioma} textos={textos} paso={PASO} nombre={textos.historias.titulo} />}
      paso={PASO}
      hrefAtras={`/${idioma}/habilidades/profundizar`}
      hrefSiguiente={`/${idioma}/habilidades/forma`}
      hrefInformacion={`/${idioma}/politica-de-datos`}
    />
  )
}
