import Link from 'next/link'
import { obtenerRespuestas } from '@/modules/habilidades/application/respuestas'
import { PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { habilidadesMasFuertes } from '@/modules/habilidades/domain/perfilArea'
import { textosHabilidades } from '@/modules/habilidades/language'
import { ProfundizarView } from '@/modules/habilidades/presentation/ProfundizarView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { guardarProfundizacionAccion } from '@/composition/acciones/accionesRespuestas'
import { crearRespuestasRepository } from '@/composition/fabricas/respuestas'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

// Tercer paso del recorrido de «de cero»: de lo marcado en «Qué has hecho» salen sus tres habilidades más fuertes, y de lo
// ya contado (si vuelve) lo que se enseña de nuevo. La vista no sabe de dónde sale: recibe las habilidades ya elegidas.
export async function ProfundizarConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const { marcas, profundizacion } = await obtenerRespuestas(crearRespuestasRepository())

  const barra = (
    <BarraEnfocadaConectado
      idioma={idioma}
      centro={<Progreso texto={rellenarPlantilla(textos.comun.paso, { actual: 3, total: PASOS_TOTAL })} actual={3} total={PASOS_TOTAL} />}
      derecha={
        // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
        <Link href={`/${idioma}`} className={`text-etiqueta-chica underline underline-offset-8 ${foco}`}>
          {textos.comun.saltar} <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )

  return (
    <ProfundizarView
      textos={textos}
      habilidades={habilidadesMasFuertes(marcas)}
      marcas={marcas}
      contadasIniciales={profundizacion}
      alGuardar={guardarProfundizacionAccion}
      barra={barra}
      hrefAtras={`/${idioma}/habilidades/tareas`}
      hrefSiguiente={`/${idioma}/habilidades/historias`}
    />
  )
}
