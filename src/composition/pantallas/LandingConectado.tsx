import { aliados } from '@/modules/landing/domain/aliados'
import { datosEquipo } from '@/modules/landing/domain/datosEquipo'
import { textosLanding } from '@/modules/landing/language'
import { LandingView } from '@/modules/landing/presentation/LandingView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'

const ESPACIO_FIJO = ' '

export function LandingConectado({ idioma }: { idioma: Idioma }) {
  const { hero } = textosLanding(idioma)

  const datos = datosEquipo.map((dato) => ({
    clave: dato.clave,
    cifra: `${dato.porcentaje}${ESPACIO_FIJO}%`,
    texto: rellenarPlantilla(hero.datos[dato.clave], { comparado: dato.comparadoCon ?? '' }),
    fuente: dato.fuente,
  }))

  return (
    <LandingView
      textos={{
        tituloInicio: hero.tituloInicio,
        tituloResaltado: hero.tituloResaltado,
        parrafo: hero.parrafo,
        botonPrincipal: hero.botonPrincipal,
        enlaceSecundario: hero.enlaceSecundario,
        etiquetaAliados: hero.etiquetaAliados,
        etiquetaDatos: hero.etiquetaDatos,
        ventajas: hero.ventajas,
      }}
      datos={datos}
      aliados={aliados}
      hrefPostular={`/${idioma}/registro`}
      hrefDirectorio={`/${idioma}/directorio`}
    />
  )
}
