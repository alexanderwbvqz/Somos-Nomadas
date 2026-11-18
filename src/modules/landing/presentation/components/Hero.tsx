import type { AliadoDestacado } from '@/modules/landing/domain/aliados'
import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'
import { FranjaLogos } from '@/shared/ui/FranjaLogos'

export type TextosHero = {
  tituloInicio: string
  tituloResaltado: string
  parrafo: string
  botonPrincipal: string
  enlaceSecundario: string
  etiquetaAliados: string
  ventajas: string[]
}

export type HeroProps = {
  textos: TextosHero
  aliados: AliadoDestacado[]
  hrefPostular: string
  hrefDirectorio: string
}

export function Hero({ textos, aliados, hrefPostular, hrefDirectorio }: HeroProps) {
  return (
    <section
      aria-labelledby="titulo-hero"
      className="fondo-degradado flex flex-col items-center px-6 py-16 text-center md:py-24"
    >
      <h1 id="titulo-hero" className="text-titulo max-w-4xl">
        {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
      </h1>
      <p className="text-parrafo mt-8 max-w-3xl">{textos.parrafo}</p>

      {aliados.length > 0 && (
        <div className="mt-14 w-full">
          <FranjaLogos elementos={aliados} etiqueta={textos.etiquetaAliados} />
        </div>
      )}

      <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
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
