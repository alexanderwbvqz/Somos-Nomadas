import { textosSitio } from '@/modules/sitio/language'
import { DatosEstructurados } from '@/modules/sitio/presentation/DatosEstructurados'
import { datosEstructurados } from '@/modules/sitio/presentation/mappers/datosEstructurados'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { urlDelSitio } from '@/shared/seo/direcciones'
import { ISOTIPO } from '../marca'

// Quién es Somos Nómadas, para los buscadores: va en la portada
export function DatosEstructuradosConectado({ idioma }: { idioma: Idioma }) {
  const datos = datosEstructurados(textosSitio(idioma), {
    urlSitio: urlDelSitio(process.env.NEXT_PUBLIC_URL_SITIO),
    idioma,
    logo: ISOTIPO,
  })
  return <DatosEstructurados datos={datos} />
}
