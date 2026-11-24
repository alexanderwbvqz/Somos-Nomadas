import { tiposAliado } from '@/modules/aliados/domain/Aliado'
import { obtenerHistorias } from '@/modules/landing/application/obtenerHistorias'
import { aliados } from '@/modules/landing/domain/aliados'
import { cifras } from '@/modules/landing/domain/cifras'
import { areasMatch } from '@/modules/landing/domain/match'
import { clavesProblemas } from '@/modules/landing/domain/problemas'
import { textosLanding } from '@/modules/landing/language'
import type { ItemProblema } from '@/modules/landing/presentation/components/SeccionProblemas'
import { LandingView } from '@/modules/landing/presentation/LandingView'
import type { Idioma } from '@/shared/idiomas/idiomas'
import { formatearCifra, formatearFuente } from '@/modules/landing/presentation/mappers/formatoCifras'
import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { crearHistoriasRepository } from '@/composition/landing/fabricas/historias'

// Las historias se leen aquí: si no se pueden leer, la landing sigue completa sin esa sección.
export async function LandingConectado({ idioma }: { idioma: Idioma }) {
  const t = textosLanding(idioma)
  const resultadoHistorias = await obtenerHistorias(crearHistoriasRepository(), idioma, new Date().getFullYear())

  const items: ItemProblema[] = clavesProblemas.map((clave) => ({ clave, ...t.problemas.items[clave] }))

  return (
    <LandingView
      hero={{
        textos: t.hero,
        aliados,
        hrefPostular: `/${idioma}/registro`,
        hrefDirectorio: `/${idioma}/directorio`,
      }}
      problemas={{
        textos: {
          tituloInicio: t.problemas.tituloInicio,
          tituloFin: t.problemas.tituloFin,
          subtitulo: t.problemas.subtitulo,
          etiquetaProblema: t.problemas.etiquetaProblema,
          etiquetaSolucion: t.problemas.etiquetaSolucion,
          diagrama: t.problemas.diagrama,
        },
        items,
      }}
      match={{
        textos: t.match,
        nombresAreas: {
          tecnologia: t.problemas.diagrama.tecnologia,
          marketing: t.problemas.diagrama.marketing,
          operaciones: t.problemas.diagrama.operaciones,
          finanzas: t.problemas.diagrama.finanzas,
        },
      }}
      aliados={{
        textos: {
          etiqueta: t.aliados.etiqueta,
          tituloInicio: t.aliados.tituloInicio,
          tituloResaltado: t.aliados.tituloResaltado,
          parrafo: t.aliados.parrafo,
          botonAliado: t.aliados.botonAliado,
          enlaceRed: t.aliados.enlaceRed,
          nota: t.aliados.nota,
          etiquetaActivos: t.aliados.etiquetaActivos,
        },
        tipos: tiposAliado.map((clave, indice) => {
          const activos = aliados.filter((aliado) => aliado.tipo === clave).length
          return {
            clave,
            numero: String(indice + 1).padStart(2, '0'),
            nombre: t.aliados.tipos[clave].nombre,
            descripcion: t.aliados.tipos[clave].descripcion,
            enlace: t.aliados.tipos[clave].enlace,
            href: `/${idioma}/aliados?tipo=${clave}`,
            activos:
              activos > 0
                ? rellenarPlantilla(activos === 1 ? t.aliados.activoUno : t.aliados.activoOtros, { cantidad: activos })
                : undefined,
          }
        }),
        activos: aliados,
        hrefAliado: `/${idioma}/aliados/postular`,
        hrefRed: `/${idioma}/aliados`,
      }}
      pilares={{
        textos: {
          etiqueta: t.pilares.etiqueta,
          tituloInicio: t.pilares.tituloInicio,
          tituloResaltado: t.pilares.tituloResaltado,
          parrafo: t.pilares.parrafo,
          estado: t.pilares.estado,
          botonPostular: t.pilares.botonPostular,
          enlacePerfiles: t.pilares.enlacePerfiles,
        },
        areas: areasMatch.map((clave) => ({
          clave,
          nombre: t.problemas.diagrama[clave],
          aporta: t.problemas.diagrama.roles[clave],
          descripcion: t.pilares.areas[clave].descripcion,
          claves: t.pilares.areas[clave].claves,
          hrefPostular: `/${idioma}/registro`,
          hrefPerfiles: `/${idioma}/directorio?area=${clave}`,
        })),
      }}
      historias={{
        textos: t.historias,
        historias: resultadoHistorias.ok ? resultadoHistorias.historias : [],
        textoBoton: t.hero.botonPrincipal,
        hrefBoton: `/${idioma}/registro`,
      }}
      cifras={{
        textos: { titulo: t.cifras.titulo, parrafo: t.cifras.parrafo, etiquetaLista: t.cifras.etiquetaLista },
        items: cifras.map((cifra) => ({
          clave: cifra.clave,
          cifra: formatearCifra(cifra, idioma),
          texto: rellenarPlantilla(t.cifras.items[cifra.clave], { comparado: cifra.comparadoCon ?? '' }),
          fuente: formatearFuente(cifra, idioma),
        })),
      }}
    />
  )
}
