import type { Aliado } from '@/modules/landing/domain/aliados'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import { FranjaLogos } from '@/shared/ui/FranjaLogos'

export type DatoHero = { clave: string; cifra: string; texto: string; fuente: string }

export type TextosHero = {
  tituloInicio: string
  tituloResaltado: string
  parrafo: string
  botonPrincipal: string
  enlaceSecundario: string
  etiquetaAliados: string
  etiquetaDatos: string
  ventajas: string[]
}

export type HeroProps = {
  textos: TextosHero
  datos: DatoHero[]
  aliados: Aliado[]
  hrefPostular: string
  hrefDirectorio: string
}

export function Hero({ textos, datos, aliados, hrefPostular, hrefDirectorio }: HeroProps) {
  return (
    <section aria-labelledby="titulo-hero" className="flex flex-col items-center px-6 py-16 text-center md:py-24">
      <h1 id="titulo-hero" className="text-titulo max-w-4xl">
        {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
      </h1>
      <p className="text-parrafo mt-8 max-w-3xl">{textos.parrafo}</p>

      <ul
        aria-label={textos.etiquetaDatos}
        className="mt-14 grid w-full max-w-5xl gap-10 border-t border-borde pt-10 md:grid-cols-3"
      >
        {datos.map((dato) => (
          <li key={dato.clave} className="flex flex-col items-center gap-3">
            <p className="text-cifra">{dato.cifra}</p>
            <p className="text-parrafo max-w-xs">{dato.texto}</p>
            <p className="text-nota">{dato.fuente}</p>
          </li>
        ))}
      </ul>

      {aliados.length > 0 && (
        <div className="mt-14 w-full">
          <FranjaLogos elementos={aliados} etiqueta={textos.etiquetaAliados} />
        </div>
      )}

      <div className="mt-14 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <EnlaceBoton href={hrefPostular}>{textos.botonPrincipal}</EnlaceBoton>
        <EnlaceBoton href={hrefDirectorio} variante="texto">
          {textos.enlaceSecundario}
        </EnlaceBoton>
      </div>

      <ul className="text-nota mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {textos.ventajas.map((ventaja) => (
          <li key={ventaja}>{ventaja}</li>
        ))}
      </ul>
    </section>
  )
}
