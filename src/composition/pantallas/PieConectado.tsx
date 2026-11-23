import { cifras } from '@/modules/landing/domain/cifras'
import { enlaceWhatsapp, redesSociales } from '@/modules/sitio/domain/contacto'
import { textosSitio } from '@/modules/sitio/language'
import { idiomas, nombresIdiomas, type Idioma } from '@/shared/idiomas/idiomas'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { Pie } from '@/modules/sitio/presentation/Pie'
import { IconoRedSocial, nombresRedesSociales } from '@/shared/ui/IconoRedSocial'
import { SelectorIdioma } from '@/shared/ui/SelectorIdioma'
import { formatearCifra } from '@/modules/landing/presentation/formatoCifras'

export function PieConectado({ idioma }: { idioma: Idioma }) {
  const t = textosSitio(idioma)
  const registrados = cifras.find((cifra) => cifra.clave === 'registrados')
  const base = `/${idioma}`

  return (
    <Pie
      logoSrc="/logo/logo_somos_nomadas_claro.svg"
      logoAlt={t.cabecera.logoAlt}
      hrefInicio={base}
      descripcion={t.pie.descripcion}
      insignia={registrados ? `${formatearCifra(registrados, idioma)} ${t.pie.registrados}` : t.pie.registrados}
      columnas={[
        {
          id: 'explorar',
          titulo: t.pie.explorar.titulo,
          enlaces: [
            { texto: t.pie.explorar.directorio, href: `${base}/directorio` },
            { texto: t.pie.explorar.match, href: `${base}/match` },
            { texto: t.pie.explorar.eventos, href: `${base}/eventos` },
          ],
        },
        {
          id: 'ecosistema',
          titulo: t.pie.ecosistema.titulo,
          enlaces: [
            { texto: t.pie.ecosistema.red, href: `${base}/aliados` },
            { texto: t.pie.ecosistema.postular, href: `${base}/aliados/postular` },
          ],
        },
        {
          id: 'privacidad',
          titulo: t.pie.privacidad.titulo,
          enlaces: [
            { texto: t.pie.privacidad.politica, href: `${base}/politica-de-datos` },
            { texto: t.pie.privacidad.terminos, href: `${base}/terminos` },
          ],
        },
      ]}
      aviso={{
        antes: t.pie.avisoAntes,
        textoEnlace: t.pie.avisoEnlace,
        despues: t.pie.avisoDespues,
        href: `${base}/politica-de-datos`,
      }}
      copyright={rellenarPlantilla(t.pie.copyright, { anio: new Date().getFullYear() })}
      contacto={{ texto: t.pie.contacto, href: enlaceWhatsapp() }}
      redes={redesSociales.map((red) => ({
        nombre: nombresRedesSociales[red.tipo],
        href: red.href,
        icono: <IconoRedSocial tipo={red.tipo} />,
      }))}
      etiquetaRedes={t.pie.redes}
      selectorIdioma={
        <SelectorIdioma
          idiomaActual={idioma}
          opciones={idiomas.map((codigo) => ({ codigo, nombre: nombresIdiomas[codigo] }))}
          etiqueta={t.pie.idioma}
        />
      }
    />
  )
}
