import type { DetalleAliado } from '@/modules/aliados/application/obtenerDetalleAliado'
import { contactoDe, urlSegura } from '@/modules/aliados/domain/detalle'
import { textosAliados } from '@/modules/aliados/language'
import type { DetalleAliadoViewProps } from '../DetalleAliadoView'
import { enlaceWhatsapp } from '@/modules/sitio/domain/contacto'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { nombresRedesSociales } from '@/shared/ui/IconoRedSocial'
import { formatearMesAnio } from '@/shared/lib/formatoFechas'

// Convierte el detalle de un aliado en lo que muestra la página: etiquetas en el idioma,
// enlaces ya comprobados como seguros, la fecha formateada y las formas de contacto que sí tiene.
export function vistaDetalleAliado({ aliado, similares }: DetalleAliado, idioma: Idioma): DetalleAliadoViewProps {
  const t = textosAliados(idioma)
  const d = t.detalle
  const etiquetaTipo = t.listado.tipos[aliado.tipo].singular
  const contacto = contactoDe(aliado)
  const hayContacto = contacto.agenda !== undefined || contacto.whatsapp !== undefined

  const web = urlSegura(aliado.sitioWeb)
  const redes = aliado.redes.flatMap((red) => {
    const href = urlSegura(red.href)
    return href ? [{ nombre: nombresRedesSociales[red.tipo], href, tipo: red.tipo }] : []
  })

  return {
    cabecera: {
      tipo: aliado.tipo,
      etiquetaTipo,
      nombre: aliado.nombre,
      descripcion: aliado.descripcion,
      textoVolver: d.volver,
      hrefVolver: `/${idioma}/aliados`,
    },
    contenido: {
      textos: {
        quienEs: d.quienEs,
        datosClave: d.datosClave,
        enQuePuedeAyudarte: d.enQuePuedeAyudarte,
        paraEquipos: d.paraEquipos,
        comoTrabajar: d.comoTrabajar,
      },
      descripcionLarga: aliado.descripcionLarga,
      datosClave: aliado.datosClave,
      areas: aliado.areas,
      paraQuien: aliado.paraQuien,
      apoyos: aliado.apoyos,
      pasos: hayContacto ? d.pasos : undefined,
    },
    ficha: {
      textos: {
        tipo: d.ficha.tipo,
        ciudad: d.ficha.ciudad,
        sitioWeb: d.ficha.sitioWeb,
        enLaRed: d.ficha.enLaRed,
        redes: d.ficha.redes,
        agendar: d.agendar,
        whatsapp: d.whatsapp,
        notaContacto: d.notaContacto,
      },
      etiquetaTipo,
      ciudad: aliado.ciudad,
      sitioWeb: web ? { texto: new URL(web).host.replace(/^www\./, ''), href: web } : undefined,
      enLaRedDesde: aliado.enLaRedDesde ? formatearMesAnio(aliado.enLaRedDesde, idioma) : undefined,
      redes,
      hrefAgenda: contacto.agenda,
      hrefWhatsapp: contacto.whatsapp
        ? `${enlaceWhatsapp(contacto.whatsapp)}?text=${encodeURIComponent(d.mensajeWhatsapp)}`
        : undefined,
    },
    masAliados: {
      textos: { titulo: d.masAliados, leerMas: t.listado.leerMas },
      aliados: similares.map((otro) => ({
        ...otro,
        etiquetaTipo: t.listado.tipos[otro.tipo].singular,
        href: `/${idioma}/aliados/${otro.id}`,
      })),
    },
  }
}
