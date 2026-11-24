import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import { IconoRedSocial, type TipoRedSocial } from '@/shared/ui/IconoRedSocial'
import { FilaFicha } from '../ui/FilaFicha'

export type FichaAliadoProps = {
  textos: {
    tipo: string
    ciudad: string
    sitioWeb: string
    enLaRed: string
    redes: string
    agendar: string
    whatsapp: string
    notaContacto: string
  }
  etiquetaTipo: string
  ciudad?: string
  /** Solo enlaces ya comprobados como seguros (http o https) */
  sitioWeb?: { texto: string; href: string }
  /** Fecha de ingreso ya formateada, por ejemplo "marzo de 2026" */
  enLaRedDesde?: string
  redes: { nombre: string; href: string; tipo: TipoRedSocial }[]
  hrefAgenda?: string
  hrefWhatsapp?: string
}

// Ficha lateral de un aliado: datos rápidos y las formas de contacto directo que él mismo ha dado.
export function FichaAliado({ textos, etiquetaTipo, ciudad, sitioWeb, enLaRedDesde, redes, hrefAgenda, hrefWhatsapp }: FichaAliadoProps) {
  const hayContacto = Boolean(hrefAgenda || hrefWhatsapp)

  return (
    <aside className="rounded-3xl bg-tarjeta p-8 escritorio:sticky escritorio:top-8">
      <dl>
        <FilaFicha etiqueta={textos.tipo}>{etiquetaTipo}</FilaFicha>
        {ciudad && <FilaFicha etiqueta={textos.ciudad}>{ciudad}</FilaFicha>}
        {sitioWeb && (
          <FilaFicha etiqueta={textos.sitioWeb}>
            <a
              href={sitioWeb.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            >
              {sitioWeb.texto} <span aria-hidden="true">↗</span>
            </a>
          </FilaFicha>
        )}
        {enLaRedDesde && <FilaFicha etiqueta={textos.enLaRed}>{enLaRedDesde}</FilaFicha>}
        {redes.length > 0 && (
          <FilaFicha etiqueta={textos.redes}>
            <ul className="flex justify-end gap-2">
              {redes.map((red) => (
                <li key={red.nombre}>
                  <a
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={red.nombre}
                    className="inline-flex size-9 items-center justify-center rounded-full border-[1.5px] border-texto hover:bg-texto hover:text-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
                  >
                    <IconoRedSocial tipo={red.tipo} />
                  </a>
                </li>
              ))}
            </ul>
          </FilaFicha>
        )}
      </dl>

      {hayContacto && (
        <div className="mt-7 flex flex-col items-start gap-3">
          {hrefAgenda && (
            <EnlaceBoton href={hrefAgenda} variante="lleno" externo>
              {textos.agendar}
            </EnlaceBoton>
          )}
          {hrefWhatsapp && (
            <EnlaceBoton href={hrefWhatsapp} variante="contorno" externo>
              {textos.whatsapp}
            </EnlaceBoton>
          )}
          <p className="text-cuerpo mt-2 text-texto-suave">{textos.notaContacto}</p>
        </div>
      )}
    </aside>
  )
}
