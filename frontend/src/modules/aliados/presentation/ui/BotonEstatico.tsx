import { CirculoFlecha } from '@/shared/ui/CirculoFlecha'

export function BotonEstatico({ lleno, children }: { lleno: boolean; children: string }) {
  return (
    <span
      className={`text-etiqueta-chica inline-flex items-center gap-3 rounded-full border-2 border-texto py-1.5 pl-5 pr-1.5 ${
        lleno ? 'bg-texto text-fondo' : 'text-texto'
      }`}
    >
      {children}
      <CirculoFlecha lleno={lleno} />
    </span>
  )
}
