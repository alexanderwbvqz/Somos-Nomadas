import { obtenerBienvenida } from '@/modules/fundadores/application/obtenerBienvenida'
import { textosHabilidades } from '@/modules/habilidades/language'
import { CierreView } from '@/modules/habilidades/presentation/CierreView'
import { iniciales } from '@/modules/habilidades/presentation/mappers/iniciales'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { prepararCierreAccion } from '@/composition/habilidades/acciones/accionesRespuestas'
import { crearBienvenidaRepository } from '@/composition/fundadores/fabricas/bienvenida'

// Aquí se juntan dos módulos: el nombre sale del perfil (fundadores) y se le pasa a habilidades como iniciales ya hechas.
export async function CierreConectado({ idioma }: { idioma: Idioma }) {
  const perfil = await obtenerBienvenida(crearBienvenidaRepository())

  return (
    <CierreView
      textos={textosHabilidades(idioma)}
      iniciales={iniciales(perfil ? `${perfil.nombre} ${perfil.apellidos}` : undefined)}
      logoSrc="/logo/logo_somos_nomadas_claro.svg"
      isotipoSrc="/logo/logo_isotipo.svg"
      hrefInicio={`/${idioma}`}
      alPreparar={prepararCierreAccion}
    />
  )
}
