'use client'

import { useCallback, useEffect, useState } from 'react'

/** Cuenta atrás en segundos, de `segundos` a 0, un paso por segundo; `reiniciar` vuelve a empezar. */
export function useCuentaAtras(segundos: number) {
  const [restantes, setRestantes] = useState(segundos)
  const enCurso = restantes > 0

  useEffect(() => {
    if (!enCurso) return
    const intervalo = setInterval(() => setRestantes((actual) => Math.max(0, actual - 1)), 1000)
    return () => clearInterval(intervalo)
  }, [enCurso])

  const reiniciar = useCallback(() => setRestantes(segundos), [segundos])
  return { restantes, reiniciar }
}
