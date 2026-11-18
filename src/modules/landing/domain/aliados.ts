export type Aliado = {
  nombre: string
  /** Ruta del logo en public/aliados/; si falta se muestra el nombre en texto */
  logoSrc?: string
}

// Empresas que apoyan a Nómadas. Vacía hasta recibir los aliados reales:
// mientras no haya ninguno, la franja no se muestra.
export const aliados: Aliado[] = []
