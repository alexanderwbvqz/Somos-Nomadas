import { foco } from '@/shared/ui/EnlaceBoton'
import type { PasoPostulacion } from '../../domain/postulacion'

export function FilaResumen({ etiqueta, paso, textoEditar, alEditar, children }: { etiqueta: string; paso: PasoPostulacion; textoEditar: string; alEditar: (paso: PasoPostulacion) => void; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-5 border-b border-borde/15 py-3.5">
      <dt className="text-parrafo flex-none opacity-60">{etiqueta}</dt>
      <dd className="text-parrafo text-right font-medium">
        {children}
        <button
          type="button"
          onClick={() => alEditar(paso)}
          aria-label={`${textoEditar}: ${etiqueta}`}
          className={`text-nota ml-3 font-normal underline underline-offset-4 ${foco}`}
        >
          {textoEditar}
        </button>
      </dd>
    </div>
  )
}
