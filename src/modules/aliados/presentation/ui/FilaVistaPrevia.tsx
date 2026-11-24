export function FilaVistaPrevia({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-borde/15 py-3">
      <dt className="text-parrafo opacity-60">{etiqueta}</dt>
      <dd className={`text-parrafo text-right font-medium ${valor ? '' : 'opacity-30'}`}>{valor || '—'}</dd>
    </div>
  )
}
