type Props = {
  etiqueta: string
  titulo: string
  parrafo: string
}

// Hero de una página interior: etiqueta, titular gigante y párrafo, centrados sobre color plano.
export function HeroPagina({ etiqueta, titulo, parrafo }: Props) {
  return (
    <section aria-labelledby="titulo-pagina" className="fondo-hero-interno px-6 py-20 text-center escritorio:py-32">
      <p className="text-etiqueta-hero">{etiqueta}</p>
      <h1 id="titulo-pagina" className="text-titulo-gigante mt-9">
        {titulo}
      </h1>
      <p className="text-parrafo-grande mx-auto mt-11 max-w-3xl">{parrafo}</p>
    </section>
  )
}
