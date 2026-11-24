import { rellenarPlantilla } from '@/shared/idiomas/rellenarPlantilla'
import { MensajeError } from '@/shared/ui/MensajeError'
import { busquedas, LIMITES_BIENVENIDA, type Busqueda } from '../../domain/bienvenida'
import type { TextosFundadores } from '../../language/tipos'

type Props = {
  textos: TextosFundadores['bienvenida']
  marcadas: Busqueda[]
  alAlternar: (opcion: Busqueda) => void
  error?: string
}

// «Qué estás buscando»: opciones para marcar, con un tope. Al llegar al tope las demás quedan desactivadas.
export function OpcionesBusqueda({ textos, marcadas, alAlternar, error }: Props) {
  const t = textos.busca
  const alTope = marcadas.length >= LIMITES_BIENVENIDA.busquedasMax

  return (
    <fieldset aria-describedby={error ? 'error-busca' : 'ayuda-busca'}>
      <legend className="text-parrafo mb-2 font-medium">{t.titulo}</legend>
      <div className="flex flex-wrap gap-2.5">
        {busquedas.map((opcion, indice) => {
          const marcada = marcadas.includes(opcion)
          return (
            <label key={opcion} className="relative">
              <input
                id={indice === 0 ? 'campo-busca-0' : undefined}
                type="checkbox"
                name="busca"
                value={opcion}
                checked={marcada}
                disabled={!marcada && alTope}
                onChange={() => alAlternar(opcion)}
                className="peer sr-only"
              />
              <span
                className={`text-cuerpo block cursor-pointer rounded-full border-[1.5px] px-4 py-2.5 peer-checked:border-texto peer-checked:bg-texto peer-checked:text-fondo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primario peer-disabled:cursor-not-allowed peer-disabled:opacity-40 ${
                  error ? 'border-primario' : 'border-borde-campo'
                }`}
              >
                {t.opciones[opcion]}
              </span>
            </label>
          )
        })}
      </div>
      <p id="ayuda-busca" className="text-nota mt-2 opacity-70">
        {rellenarPlantilla(t.ayuda, { max: LIMITES_BIENVENIDA.busquedasMax })}
      </p>
      {error && <MensajeError id="error-busca">{error}</MensajeError>}
    </fieldset>
  )
}
