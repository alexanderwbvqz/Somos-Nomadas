import Link from 'next/link'
import { caminosDisponibles, PASOS_TOTAL } from '@/modules/habilidades/domain/camino'
import { textosHabilidades } from '@/modules/habilidades/language'
import { InicioHabilidadesView } from '@/modules/habilidades/presentation/InicioHabilidadesView'
import { obtenerPerfil } from '@/modules/fundadores/application/obtenerPerfil'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { foco } from '@/shared/ui/EnlaceBoton'
import { Progreso } from '@/shared/ui/Progreso'
import { hayAnalisis } from '@/composition/fabricas/analisis'
import { crearPerfilRepository } from '@/composition/fabricas/perfiles'
import { BarraEnfocadaConectado } from './BarraEnfocadaConectado'

// Aquí se juntan dos módulos: el nombre sale del perfil (fundadores) y se le pasa a habilidades, que no lo conoce.
export async function HabilidadesConectado({ idioma }: { idioma: Idioma }) {
  const textos = textosHabilidades(idioma)
  const perfil = await obtenerPerfil(crearPerfilRepository())

  const barra = (
    <BarraEnfocadaConectado
      idioma={idioma}
      centro={<Progreso texto={rellenarPlantilla(textos.comun.paso, { actual: 1, total: PASOS_TOTAL })} actual={1} total={PASOS_TOTAL} />}
      derecha={
        // provisional: todavía no existe el panel adonde llevar a quien salta; por ahora va al inicio del sitio
        <Link href={`/${idioma}`} className={`text-etiqueta-chica underline underline-offset-8 ${foco}`}>
          {textos.comun.saltar} <span aria-hidden="true">→</span>
        </Link>
      }
    />
  )

  return (
    <InicioHabilidadesView
      textos={textos}
      nombre={perfil?.nombre}
      disponibles={caminosDisponibles({ analisisDisponible: hayAnalisis() })}
      // «cero» todavía no tiene paso siguiente: sin ruta, «Arrancar» avisa de que llega pronto
      rutas={{ escritas: `/${idioma}/habilidades/escritas` }}
      barra={barra}
    />
  )
}
