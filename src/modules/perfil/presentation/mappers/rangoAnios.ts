import type { EntradaTrayectoria } from '../../domain/trayectoria'

/** «2020 – 2022», o «2022 – hoy» si sigue ahí; `hoy` es la palabra en el idioma de la persona */
export function rangoAnios(entrada: EntradaTrayectoria, hoy: string): string {
  return `${entrada.desde} – ${entrada.hasta ?? hoy}`
}
