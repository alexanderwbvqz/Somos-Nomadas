import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { CampoArea } from '@/shared/ui/CampoArea'
import { areas, type AreaId } from '../../domain/catalogo'
import { LIMITE_SOCIO_IDEAL } from '../../domain/forma'
import type { TextosHabilidades } from '../../language/tipos'
import type { PreguntaVista } from '../mappers/vistaForma'
import { ResumenRespuestas } from '../ui/ResumenRespuestas'

type Props = {
  textos: TextosHabilidades['forma']
  preguntas: PreguntaVista[]
  respondidas: number
  busca: readonly AreaId[]
  socioIdeal: string
  errorSocio?: string
  alIrA: (indice: number) => void
  alternarArea: (area: AreaId) => void
  escribirSocio: (texto: string) => void
}

// Lo que queda al terminar las preguntas: el resumen (cada respuesta se puede cambiar), el perfil que busca y su socio ideal.
export function FinalForma({ textos, preguntas, respondidas, busca, socioIdeal, errorSocio, alIrA, alternarArea, escribirSocio }: Props) {
  const opcional = <span className="font-normal opacity-65">{textos.opcional}</span>

  return (
    <div className="grid gap-8">
      <div>
        <h2 id="titulo-pregunta-forma" tabIndex={-1} className="text-titulo-tarjeta texto-equilibrado outline-none">
          {rellenarPlantilla(textos.listo, { n: respondidas, total: preguntas.length })}
        </h2>
        <p className="text-cuerpo mt-2 rounded-xl bg-suave px-4 py-3">{textos.cambiar}</p>
        <div className="mt-5">
          <ResumenRespuestas textos={textos} preguntas={preguntas} respondidas={respondidas} alIrA={alIrA} />
        </div>
      </div>

      <fieldset>
        <legend className="text-parrafo mb-1 font-medium">
          {textos.busca.titulo} {opcional}
        </legend>
        <p className="text-nota mb-2.5 opacity-70">{textos.busca.ayuda}</p>
        <div className="flex flex-wrap gap-2.5">
          {areas.map((area) => (
            <label key={area} className="relative">
              <input type="checkbox" name="busca" value={area} checked={busca.includes(area)} onChange={() => alternarArea(area)} className="peer sr-only" />
              <span className="text-cuerpo block cursor-pointer rounded-full border-[1.5px] border-texto/45 bg-tarjeta px-4 py-2.5 peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario">
                {textos.busca.areas[area]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <CampoArea
          clave="socioIdeal"
          etiqueta={
            <>
              {textos.socio.etiqueta} {opcional}
            </>
          }
          placeholder={textos.socio.ejemplo}
          filas={3}
          maxLength={LIMITE_SOCIO_IDEAL * 2}
          valor={socioIdeal}
          alCambiar={escribirSocio}
          error={errorSocio}
        />
      </div>
    </div>
  )
}
