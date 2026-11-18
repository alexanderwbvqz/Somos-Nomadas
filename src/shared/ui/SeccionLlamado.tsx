import { EnlaceBoton } from '@/shared/ui/EnlaceBoton'

export type SeccionLlamadoProps = {
  /** Identificador del titular; nombra la sección para lectores de pantalla */
  idTitulo: string
  textos: {
    tituloInicio: string
    tituloResaltado: string
    boton: string
    nota: string
  }
  href: string
}

// Llamado final de una página: titular con una parte en cursiva, un botón y una nota breve.
export function SeccionLlamado({ idTitulo, textos, href }: SeccionLlamadoProps) {
  return (
    <section
      aria-labelledby={idTitulo}
      className="mx-auto grid w-full max-w-7xl items-center gap-10 border-t border-borde/25 px-6 py-16 escritorio:grid-cols-12 escritorio:gap-12 escritorio:px-12 escritorio:py-24"
    >
      <h2 id={idTitulo} className="text-titulo-medio escritorio:col-span-7">
        {textos.tituloInicio} <em className="italic">{textos.tituloResaltado}</em>
      </h2>
      <div className="flex flex-col items-start gap-5 escritorio:col-span-5">
        <EnlaceBoton href={href} variante="lleno">
          {textos.boton}
        </EnlaceBoton>
        <p className="text-cuerpo max-w-sm opacity-85">{textos.nota}</p>
      </div>
    </section>
  )
}
