export type ItemCifra = { clave: string; cifra: string; texto: string; fuente: string }

export type SeccionCifrasProps = {
  textos: { titulo: string; parrafo: string; etiquetaLista: string }
  items: ItemCifra[]
}

export function SeccionCifras({ textos, items }: SeccionCifrasProps) {
  return (
    <section
      aria-labelledby="titulo-cifras"
      className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 escritorio:grid-cols-12 escritorio:gap-12 escritorio:px-12 escritorio:pb-24"
    >
      <div className="escritorio:col-span-5">
        <h2 id="titulo-cifras" className="text-titulo-seccion">
          {textos.titulo}
        </h2>
        <p className="text-parrafo mt-5 max-w-md">{textos.parrafo}</p>
      </div>

      <ul aria-label={textos.etiquetaLista} className="grid gap-x-8 sm:grid-cols-2 escritorio:col-span-7">
        {items.map((item) => (
          <li key={item.clave} className="border-t border-texto pb-9 pt-4">
            <p className="text-cifra">{item.cifra}</p>
            <p className="text-parrafo mt-3 max-w-xs">{item.texto}</p>
            <p className="text-nota mt-2">{item.fuente}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
