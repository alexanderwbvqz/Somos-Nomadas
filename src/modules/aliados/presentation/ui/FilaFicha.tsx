export function FilaFicha({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-borde/15 py-3.5">
      <dt className="text-parrafo opacity-60">{etiqueta}</dt>
      <dd className="text-parrafo text-right font-medium">{children}</dd>
    </div>
  )
}
