export type SeccionComoFuncionaProps = {
  textos: { etiquetaSeccion: string }
  pasos: { titulo: string; texto: string }[]
}

// Los pasos de un evento, en orden: de confirmar la asistencia a participar en las dinámicas.
export function SeccionComoFunciona({ textos, pasos }: SeccionComoFuncionaProps) {
  return (
    <section
      aria-labelledby="titulo-como-funciona"
      className="mx-auto w-full max-w-7xl px-6 pb-16 escritorio:px-12 escritorio:pb-24"
    >
      <h2 id="titulo-como-funciona" className="text-etiqueta border-b-[1.5px] border-texto pb-4">
        {textos.etiquetaSeccion}
      </h2>
      <ol className="grid gap-x-8 sm:grid-cols-2 escritorio:grid-cols-4">
        {pasos.map((paso, indice) => (
          <li key={paso.titulo} className="mt-10 border-t-[1.5px] border-texto pb-2 pt-5">
            <p aria-hidden="true" className="text-etiqueta-chica">
              {String(indice + 1).padStart(2, '0')}
            </p>
            <h3 className="text-titulo-tarjeta-grande mt-4">{paso.titulo}</h3>
            <p className="text-parrafo mt-3 max-w-xs">{paso.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
