import { Badge } from '@/shared/ui/Badge'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import type { ProximoEventoVista } from '../mappers/vistaProximoEvento'

export type SeccionProximoEventoProps = {
  textos: {
    etiquetaSeccion: string
    lugar: string
    hora: string
    confirmar: string
    notaConfirmar: string
    sinEventosTitulo: string
    sinEventosTexto: string
    sinEventosBoton: string
  }
  /** No existe si no hay ningún evento programado */
  proximo: ProximoEventoVista | undefined
  hrefAvisar: string
}

export function SeccionProximoEvento({ textos, proximo, hrefAvisar }: SeccionProximoEventoProps) {
  return (
    <section
      aria-labelledby="titulo-proximo-evento"
      className="mx-auto w-full max-w-7xl px-6 pb-16 pt-16 escritorio:px-12 escritorio:pb-24 escritorio:pt-20"
    >
      <h2 id="titulo-proximo-evento" className="text-etiqueta border-b-[1.5px] border-texto pb-4">
        {textos.etiquetaSeccion}
      </h2>

      {proximo ? (
        <article className="mt-9 grid overflow-hidden rounded-3xl bg-tarjeta escritorio:grid-cols-12">
          <div className="flex items-end justify-between gap-6 bg-degradado-amarillo px-8 py-10 escritorio:col-span-4 escritorio:flex-col escritorio:items-start escritorio:justify-between escritorio:px-9 escritorio:py-11">
            <div>
              <p className="text-numero-fecha">{proximo.dia}</p>
              <p className="text-etiqueta mt-5">{proximo.mesAnio}</p>
            </div>
            <p className="text-etiqueta-chica">{proximo.cuenta}</p>
          </div>

          <div className="px-8 py-10 escritorio:col-span-8 escritorio:px-12 escritorio:py-11">
            <Badge>{proximo.modalidad}</Badge>
            <h3 className="text-titulo-medio mt-4">{proximo.nombre}</h3>
            <dl className="mt-6 flex flex-wrap gap-x-9 gap-y-4">
              <div>
                <dt className="text-etiqueta-chica opacity-60">{textos.lugar}</dt>
                <dd className="text-parrafo mt-1 font-medium">{proximo.lugar}</dd>
              </div>
              <div>
                <dt className="text-etiqueta-chica opacity-60">{textos.hora}</dt>
                <dd className="text-parrafo mt-1 font-medium">{proximo.hora}</dd>
              </div>
            </dl>
            <p className="text-parrafo mt-6 max-w-xl">{proximo.descripcion}</p>
            <div className="mt-8">
              <EnlaceBoton href={proximo.hrefConfirmar} variante="lleno">
                {textos.confirmar}
              </EnlaceBoton>
            </div>
            <p className="text-cuerpo mt-5 max-w-lg opacity-80">{textos.notaConfirmar}</p>
          </div>
        </article>
      ) : (
        <div className="mt-9 rounded-3xl bg-tarjeta px-8 py-12 text-center escritorio:py-16">
          <h3 className="text-titulo-medio">{textos.sinEventosTitulo}</h3>
          <p className="text-parrafo mx-auto mt-4 max-w-md">{textos.sinEventosTexto}</p>
          <div className="mt-8 flex justify-center">
            <EnlaceBoton href={hrefAvisar} variante="lleno">
              {textos.sinEventosBoton}
            </EnlaceBoton>
          </div>
        </div>
      )}
    </section>
  )
}
