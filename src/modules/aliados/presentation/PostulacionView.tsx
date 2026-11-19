import { HeroPagina } from '@/shared/ui/HeroPagina'
import { FormularioPostulacion, type FormularioPostulacionProps } from './components/postulacion/FormularioPostulacion'

export type PostulacionViewProps = {
  hero: { etiqueta: string; titulo: string; parrafo: string }
  como: { pasos: { titulo: string; texto: string }[] }
  formulario: FormularioPostulacionProps
}

// Vista pura de la página "Quiero ser aliado": recibe todo por props.
export function PostulacionView({ hero, como, formulario }: PostulacionViewProps) {
  return (
    <>
      <HeroPagina {...hero} />
      <section aria-label={hero.titulo} className="mx-auto w-full max-w-7xl px-6 pt-10 escritorio:px-12 escritorio:pt-14">
        <ol className="grid gap-6 escritorio:grid-cols-3 escritorio:gap-8">
          {como.pasos.map((paso, indice) => (
            <li key={paso.titulo} className="border-t-[1.5px] border-texto pt-4">
              <span className="text-etiqueta-chica">{String(indice + 1).padStart(2, '0')}</span>
              <h2 className="text-titulo-tarjeta-grande mt-2.5">{paso.titulo}</h2>
              <p className="text-parrafo mt-1.5 max-w-sm opacity-80">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>
      <FormularioPostulacion {...formulario} />
    </>
  )
}
