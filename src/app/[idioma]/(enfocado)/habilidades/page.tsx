import { notFound, redirect } from 'next/navigation'
import { esIdioma } from '@/shared/idiomas/idiomas'

type Parametros = { params: Promise<{ idioma: string }> }

// El recorrido de habilidades empieza en «Qué has hecho»; esta dirección solo lleva allí
export default async function PaginaHabilidades({ params }: Parametros) {
  const { idioma } = await params
  if (!esIdioma(idioma)) notFound()
  redirect(`/${idioma}/habilidades/tareas`)
}
