import type { ReactNode } from 'react'

type Props = {
  /** Lo que va encima del título, por ejemplo "Paso 02" */
  etiqueta: string
  titulo: string
  subtitulo: string
  /** El porqué de la pregunta: un rótulo y el texto */
  porQue: { titulo: string; texto: string }
  /** Lo que va dentro de la tarjeta blanca, normalmente un formulario */
  children: ReactNode
}

// Pantalla de un paso: a la izquierda, fija al desplazarse, qué paso es y por qué se pregunta; a la derecha, una tarjeta
// blanca con lo que hay que hacer. En pantallas estrechas, una columna. La barra y el progreso van fuera, antes del <main>.
export function LayoutPaso({ etiqueta, titulo, subtitulo, porQue, children }: Props) {
  return (
    <main className="flex-1">
      <div className="mx-auto grid w-full max-w-[80rem] items-start gap-7 px-6 pb-16 pt-7 md:px-12 escritorio:grid-cols-[4fr_8fr] escritorio:gap-16 escritorio:pb-24 escritorio:pt-12">
        <div className="escritorio:sticky escritorio:top-8">
          <p className="text-etiqueta-chica">{etiqueta}</p>
          <h1 className="text-titulo texto-equilibrado mt-4">{titulo}</h1>
          <p className="text-parrafo mt-4 max-w-md text-texto-suave">{subtitulo}</p>
          <div className="mt-6 max-w-md border-t-[1.5px] border-texto pt-3.5 escritorio:mt-8">
            <p className="text-etiqueta-chica text-texto-tenue">{porQue.titulo}</p>
            <p className="text-cuerpo mt-2 text-texto-suave">{porQue.texto}</p>
          </div>
        </div>
        <div className="min-w-0 rounded-3xl bg-tarjeta p-6 escritorio:p-10">{children}</div>
      </div>
    </main>
  )
}
