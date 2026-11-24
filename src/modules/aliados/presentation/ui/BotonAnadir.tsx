import { foco } from '@/shared/ui/EnlaceBoton'

export function BotonAnadir({ alPulsar, children }: { alPulsar: () => void; children: string }) {
  return (
    <button type="button" onClick={alPulsar} className={`text-nota mt-3 underline underline-offset-4 ${foco}`}>
      + {children}
    </button>
  )
}
