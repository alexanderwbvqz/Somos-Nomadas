import Link from 'next/link'
import type { TipoAliado } from '../../domain/Aliado'
import { colorTipoAliado } from '../ui/coloresTipoAliado'

export type CabeceraAliadoProps = {
  tipo: TipoAliado
  etiquetaTipo: string
  nombre: string
  descripcion: string
  textoVolver: string
  hrefVolver: string
}

// Cabecera de la página de un aliado: sobre el color de su tipo, con enlace para volver a la red.
export function CabeceraAliado({ tipo, etiquetaTipo, nombre, descripcion, textoVolver, hrefVolver }: CabeceraAliadoProps) {
  return (
    <section aria-labelledby="titulo-aliado" className={`${colorTipoAliado[tipo]} px-6 pb-16 pt-8 escritorio:px-12 escritorio:pb-24`}>
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href={hrefVolver}
          className="text-etiqueta inline-block underline underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primario"
        >
          <span aria-hidden="true">← </span>
          {textoVolver}
        </Link>
        <p className="text-etiqueta-hero mt-12 escritorio:mt-16">{etiquetaTipo}</p>
        <h1 id="titulo-aliado" className="text-titulo-gigante texto-equilibrado mt-7">
          {nombre}
        </h1>
        <p className="text-parrafo-grande mt-8 max-w-3xl">{descripcion}</p>
      </div>
    </section>
  )
}
