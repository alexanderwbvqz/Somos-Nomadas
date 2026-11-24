import type { DatoClave } from '../../domain/Aliado'
import { Bloque } from '../ui/Bloque'

export type ContenidoAliadoProps = {
  textos: {
    quienEs: string
    datosClave: string
    enQuePuedeAyudarte: string
    paraEquipos: string
    comoTrabajar: string
  }
  descripcionLarga: string[]
  datosClave: DatoClave[]
  areas: string[]
  paraQuien?: string
  apoyos: string[]
  /** Los pasos para trabajar con el aliado solo se muestran si hay alguna forma de contacto */
  pasos: { titulo: string; texto: string }[] | undefined
}

/** ¿Hay algo que mostrar en la columna de contenido? */
export function tieneContenidoAliado(props: Pick<ContenidoAliadoProps, 'descripcionLarga' | 'datosClave' | 'areas' | 'paraQuien' | 'apoyos' | 'pasos'>): boolean {
  return (
    props.descripcionLarga.length > 0 ||
    props.datosClave.length > 0 ||
    props.areas.length > 0 ||
    Boolean(props.paraQuien) ||
    props.apoyos.length > 0 ||
    Boolean(props.pasos?.length)
  )
}

// Todo lo que el aliado ha contado de sí mismo. Cada bloque aparece solo si tiene datos.
export function ContenidoAliado({ textos, descripcionLarga, datosClave, areas, paraQuien, apoyos, pasos }: ContenidoAliadoProps) {
  const hayPasos = Boolean(pasos && pasos.length > 0)
  const visibles = {
    quienEs: descripcionLarga.length > 0,
    datosClave: datosClave.length > 0,
    ayuda: areas.length > 0 || Boolean(paraQuien) || apoyos.length > 0,
    pasos: hayPasos,
  }
  // El primer bloque visible no lleva margen superior
  const primero = (['quienEs', 'datosClave', 'ayuda', 'pasos'] as const).find((bloque) => visibles[bloque])

  return (
    <div>
      {visibles.quienEs && (
        <Bloque id="aliado-quien-es" titulo={textos.quienEs} primero={primero === 'quienEs'}>
          {descripcionLarga.map((parrafo) => (
            <p key={parrafo} className="text-parrafo mt-6 max-w-2xl">
              {parrafo}
            </p>
          ))}
        </Bloque>
      )}

      {visibles.datosClave && (
        <Bloque id="aliado-datos-clave" titulo={textos.datosClave} primero={primero === 'datosClave'}>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {datosClave.map((dato) => (
              <div key={dato.etiqueta} className="mt-7 border-t-[1.5px] border-texto pt-4">
                <dd className="text-dato-clave">{dato.valor}</dd>
                <dt className="text-cuerpo mt-2 opacity-85">{dato.etiqueta}</dt>
              </div>
            ))}
          </dl>
        </Bloque>
      )}

      {visibles.ayuda && (
        <Bloque id="aliado-ayuda" titulo={textos.enQuePuedeAyudarte} primero={primero === 'ayuda'}>
          {areas.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {areas.map((area) => (
                <li key={area} className="text-cuerpo rounded-full border-[1.5px] border-texto px-4 py-1.5">
                  {area}
                </li>
              ))}
            </ul>
          )}
          {paraQuien && (
            <div className="mt-6 max-w-2xl">
              <p className="text-etiqueta-chica">{textos.paraEquipos}</p>
              <p className="text-parrafo mt-2">{paraQuien}</p>
            </div>
          )}
          {apoyos.length > 0 && (
            <ul className="mt-6">
              {apoyos.map((apoyo) => (
                <li key={apoyo} className="text-parrafo flex gap-4 border-b border-borde/25 py-4">
                  <span aria-hidden="true" className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-texto">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  </span>
                  <span>{apoyo}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloque>
      )}

      {visibles.pasos && pasos && (
        <Bloque id="aliado-como-trabajar" titulo={textos.comoTrabajar} primero={primero === 'pasos'}>
          <ol>
            {pasos.map((paso, indice) => (
              <li key={paso.titulo} className="flex gap-5 border-b border-borde/25 py-6">
                <p aria-hidden="true" className="text-etiqueta-chica w-8 shrink-0 pt-2">
                  {String(indice + 1).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="text-titulo-tarjeta-grande">{paso.titulo}</h3>
                  <p className="text-parrafo mt-2 max-w-lg">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </Bloque>
      )}
    </div>
  )
}
