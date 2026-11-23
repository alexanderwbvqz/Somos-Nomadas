import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { textosHabilidades } from '@/modules/habilidades/language'
import { TareasView } from '@/modules/habilidades/presentation/TareasView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarTareasAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraDePaso } from './BarraDePaso'

const PASO = 1

// Primer paso del recorrido: lo que la persona ya había marcado (si vuelve) se lee aquí y se le pasa a la vista.
export async function TareasConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { marcas } = await obtenerRespuestas(crearRespuestasRepository())

  return (
    <TareasView
      textos={textos}
      marcasIniciales={marcas}
      alGuardar={guardarTareasAccion}
      barra={<BarraDePaso idioma={idioma} textos={textos} paso={PASO} nombre={textos.tareas.titulo} />}
      paso={PASO}
      hrefAtras={`/${idioma}/bienvenida`}
      hrefSiguiente={`/${idioma}/habilidades/profundizar`}
    />
  )
}
