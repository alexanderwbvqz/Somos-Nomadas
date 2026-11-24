export function Rotulo({ izquierda, derecha }: { izquierda: string; derecha: string }) {
  return (
    <p className="text-etiqueta-chica mb-2.5 flex justify-between gap-4 opacity-70">
      <span>{izquierda}</span>
      <span>{derecha}</span>
    </p>
  )
}
