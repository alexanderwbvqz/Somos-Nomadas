import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { habilidadesMasFuertes } from '@/modules/habilidades/domain/perfilArea'
import { textosHabilidades } from '@/modules/habilidades/language'
import { ProfundizarView } from '@/modules/habilidades/presentation/ProfundizarView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { guardarProfundizacionAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraDePaso } from './BarraDePaso'

const PASO = 2

// Segundo paso del recorrido: de lo marcado en «Qué has hecho» salen sus tres habilidades más fuertes, y de lo
// ya contado (si vuelve) lo que se enseña de nuevo. La vista no sabe de dónde sale: recibe las habilidades ya elegidas.
export async function ProfundizarConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { marcas, profundizacion } = await obtenerRespuestas(crearRespuestasRepository())

  return (
    <ProfundizarView
      textos={textos}
      habilidades={habilidadesMasFuertes(marcas)}
      marcas={marcas}
      contadasIniciales={profundizacion}
      alGuardar={guardarProfundizacionAccion}
      barra={<BarraDePaso idioma={idioma} textos={textos} paso={PASO} nombre={textos.profundizar.titulo} />}
      paso={PASO}
      hrefAtras={`/${idioma}/habilidades/tareas`}
      hrefSiguiente={`/${idioma}/habilidades/historias`}
    />
  )
}
