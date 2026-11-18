import { TarjetaAliado, type AliadoVista } from '../ui/TarjetaAliado'

export type SeccionMasAliadosProps = {
  textos: { titulo: string; leerMas: string }
  aliados: AliadoVista[]
}

// Otros aliados del mismo tipo, para seguir explorando. Sin ninguno, la sección no aparece.
export function SeccionMasAliados({ textos, aliados }: SeccionMasAliadosProps) {
  if (aliados.length === 0) return null

  return (
    <section aria-labelledby="titulo-mas-aliados" className="mx-auto w-full max-w-7xl px-6 pb-16 escritorio:px-12 escritorio:pb-24">
      <h2 id="titulo-mas-aliados" className="text-etiqueta border-b-[1.5px] border-texto pb-4">
        {textos.titulo}
      </h2>
      <ul className="grid gap-x-10 sm:grid-cols-2 escritorio:grid-cols-3">
        {aliados.map((aliado) => (
          <li key={aliado.id} className="mt-9 flex flex-col">
            <TarjetaAliado aliado={aliado} textoLeerMas={textos.leerMas} />
          </li>
        ))}
      </ul>
    </section>
  )
}
