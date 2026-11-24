import { useEffect, useRef, useState } from 'react'

// Muestra los primeros `porPagina` elementos y permite ir añadiendo más.
// Al mostrar el último grupo el botón de "ver más" desaparece: el foco pasa al elemento de estado
// (el que dice "Mostrando X de Y", conectado con `refEstado`) para que no se pierda.
// Para volver a empezar (por ejemplo al cambiar un filtro) basta con remontar el componente con `key`.
export function useMostrarMas<T>(elementos: T[], porPagina: number) {
  const [mostrados, setMostrados] = useState(porPagina)
  const refEstado = useRef<HTMLParagraphElement>(null)
  const yaSeAmplio = useRef(false)

  const visibles = elementos.slice(0, mostrados)
  const quedanPorMostrar = mostrados < elementos.length

  useEffect(() => {
    if (yaSeAmplio.current && !quedanPorMostrar) refEstado.current?.focus()
  }, [quedanPorMostrar])

  function mostrarMas() {
    yaSeAmplio.current = true
    setMostrados((actuales) => actuales + porPagina)
  }

  return { visibles, quedanPorMostrar, mostrarMas, refEstado, total: elementos.length }
}
