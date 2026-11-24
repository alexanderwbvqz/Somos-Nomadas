'use client'

import { useState } from 'react'

// Qué historia se ve y si su texto completo está abierto. Cambiar de historia cierra el texto; no se mueve sola.
export function useHistoriaActiva(cantidad: number) {
  const [elegida, setElegida] = useState(0)
  const [abierta, setAbierta] = useState(false)
  // Si la lista se acorta, la activa nunca queda fuera de ella
  const activa = Math.min(elegida, Math.max(0, cantidad - 1))

  function irA(indice: number) {
    if (cantidad === 0) return
    setElegida(Math.max(0, Math.min(cantidad - 1, indice)))
    setAbierta(false)
  }

  function alternar() {
    setAbierta((estaba) => !estaba)
  }

  return { activa, abierta, irA, alternar }
}
