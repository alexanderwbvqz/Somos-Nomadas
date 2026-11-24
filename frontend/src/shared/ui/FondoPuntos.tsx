'use client'

import { useEffect, useRef } from 'react'

// Paisaje de puntos: tres lomas hechas de granos de luz, más densos junto a la cresta y más tenues hacia abajo.
// Se mueve muy despacio; con movimiento reducido se dibuja una sola vez y se queda quieto.
// Los puntos toman el color del texto del elemento (se le da con una clase como `text-fondo`).
const CAPAS = [
  { base: 0.6, amp: 0.075, f: [1.1, 2.6], vel: [0.00009, -0.00013], n: 9000, disp: 0.18, alfa: 0.62 },
  { base: 0.72, amp: 0.065, f: [1.7, 3.4], vel: [-0.00012, 0.00016], n: 9000, disp: 0.21, alfa: 0.46 },
  { base: 0.84, amp: 0.055, f: [2.3, 4.4], vel: [0.00015, -0.0002], n: 8000, disp: 0.22, alfa: 0.34 },
] as const

/** Cuadros por segundo del movimiento: despacio y sin gastar de más */
const CUADROS_POR_SEGUNDO = 24

type Punto = { u: number; g: number; r: number; a: number }

/** Números «al azar» siempre iguales, para que el paisaje no cambie entre visitas ni entre servidor y navegador */
function crearPuntos(): Punto[][] {
  let semilla = 7
  const azar = () => {
    semilla = (semilla * 16807) % 2147483647
    return semilla / 2147483647
  }
  return CAPAS.map((capa) => Array.from({ length: capa.n }, () => ({ u: azar(), g: Math.pow(azar(), 2.2), r: 0.5 + azar() * 0.9, a: 0.35 + azar() * 0.65 })))
}

function dibujar(lienzo: HTMLCanvasElement, puntos: Punto[][], t: number) {
  const contexto = lienzo.getContext('2d')
  if (!contexto) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const ancho = lienzo.clientWidth
  const alto = lienzo.clientHeight
  if (lienzo.width !== Math.round(ancho * dpr) || lienzo.height !== Math.round(alto * dpr)) {
    lienzo.width = Math.round(ancho * dpr)
    lienzo.height = Math.round(alto * dpr)
  }
  contexto.setTransform(dpr, 0, 0, dpr, 0, 0)
  contexto.clearRect(0, 0, ancho, alto)
  contexto.fillStyle = getComputedStyle(lienzo).color

  CAPAS.forEach((capa, i) => {
    for (const punto of puntos[i] ?? []) {
      const x = punto.u * ancho
      const angulo = punto.u * Math.PI * 2
      const cresta = (capa.base + capa.amp * (Math.sin(angulo * capa.f[0] + t * capa.vel[0] + i) * 0.6 + Math.sin(angulo * capa.f[1] + t * capa.vel[1] + i * 2) * 0.4)) * alto
      contexto.globalAlpha = capa.alfa * punto.a * (1 - punto.g * 0.85) * 0.8
      contexto.fillRect(x, cresta + punto.g * capa.disp * alto, punto.r, punto.r)
    }
  })
  contexto.globalAlpha = 1
}

/** Lo que ocupa todo el espacio de su contenedor (que debe ser `relative`); es solo adorno, no lo leen los lectores de pantalla */
export function FondoPuntos({ className = '' }: { className?: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const elemento = lienzo.current
    if (!elemento) return
    const puntos = crearPuntos()
    dibujar(elemento, puntos, 0)

    const redibujar = () => dibujar(elemento, puntos, performance.now())
    const observador = new ResizeObserver(redibujar)
    observador.observe(elemento)

    let cuadro = 0
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let ultimo = 0
      const bucle = (t: number) => {
        if (t - ultimo >= 1000 / CUADROS_POR_SEGUNDO) {
          ultimo = t
          dibujar(elemento, puntos, t)
        }
        cuadro = requestAnimationFrame(bucle)
      }
      cuadro = requestAnimationFrame(bucle)
    }

    return () => {
      cancelAnimationFrame(cuadro)
      observador.disconnect()
    }
  }, [])

  return <canvas ref={lienzo} aria-hidden="true" className={`absolute inset-0 block size-full ${className}`} />
}
