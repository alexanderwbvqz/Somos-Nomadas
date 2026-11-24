export function Bloque({ id, titulo, primero, children }: { id: string; titulo: string; primero: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={primero ? '' : 'mt-14'}>
      <h2 id={id} className="text-etiqueta border-b-[1.5px] border-texto pb-4">
        {titulo}
      </h2>
      {children}
    </section>
  )
}
