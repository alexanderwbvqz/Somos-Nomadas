import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { MensajeError } from '@/shared/ui/Campos'
import { LIMITES_HISTORIAS, sectores, type SectorId } from '../../domain/historias'
import type { TextosHabilidades } from '../../language/tipos'

type Props = {
  textos: TextosHabilidades['historias']
  marcados: readonly SectorId[]
  alElegir: (sector: SectorId) => void
  error?: string
}

// Los sectores que le mueven: se marcan hasta un tope, y al llegar a él los demás quedan desactivados.
export function OpcionesSectores({ textos, marcados, alElegir, error }: Props) {
  const t = textos.sectores
  const alTope = marcados.length >= LIMITES_HISTORIAS.sectoresMax

  return (
    <fieldset aria-describedby={error ? 'error-sectores' : undefined}>
      <legend className="text-parrafo mb-1 font-medium">
        {t.titulo} <span className="font-normal opacity-65">{textos.opcional}</span>
      </legend>
      <p className="text-nota mb-2.5 opacity-70">{rellenarPlantilla(t.ayuda, { max: LIMITES_HISTORIAS.sectoresMax })}</p>
      <div className="flex flex-wrap gap-2.5">
        {sectores.map((sector, indice) => {
          const marcado = marcados.includes(sector)
          return (
            <label key={sector} className="relative">
              <input
                id={indice === 0 ? 'campo-sector-0' : undefined}
                type="checkbox"
                name="sectores"
                value={sector}
                checked={marcado}
                disabled={!marcado && alTope}
                onChange={() => alElegir(sector)}
                className="peer sr-only"
              />
              <span
                className={`text-cuerpo block cursor-pointer rounded-full border-[1.5px] bg-tarjeta px-4 py-2.5 peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario peer-disabled:cursor-not-allowed peer-disabled:opacity-40 ${
                  error ? 'border-primario' : 'border-texto/45'
                }`}
              >
                {t.nombres[sector]}
              </span>
            </label>
          )
        })}
      </div>
      <p className="text-etiqueta-chica mt-3 opacity-70">{rellenarPlantilla(t.contador, { n: marcados.length, max: LIMITES_HISTORIAS.sectoresMax })}</p>
      {error && <MensajeError id="error-sectores">{error}</MensajeError>}
    </fieldset>
  )
}
