import { obtenerPerfil } from '@/modules/fundadores/application/obtenerPerfil'
import { textosHabilidades } from '@/modules/habilidades/language'
import { CierreView } from '@/modules/habilidades/presentation/CierreView'
import { iniciales } from '@/modules/habilidades/presentation/mappers/iniciales'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { prepararCierreAccion } from '@/composition/acciones/accionesRespuestas'
import { crearPerfilRepository } from '@/composition/fabricas/perfiles'

// Aquí se juntan dos módulos: el nombre sale del perfil (fundadores) y se le pasa a habilidades como iniciales ya hechas.
export async function CierreConectado({ idioma }: { idioma: Idioma }) {
  const perfil = await obtenerPerfil(crearPerfilRepository())

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
