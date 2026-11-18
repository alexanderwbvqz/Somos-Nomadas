/** Sustituye {clave} por su valor; si no hay valor para una clave, la deja tal cual. */
export function rellenarPlantilla(plantilla: string, valores: Record<string, string | number>): string {
  return plantilla.replace(/\{(\w+)\}/g, (coincidencia, clave: string) => {
    const valor = valores[clave]
    return valor === undefined ? coincidencia : String(valor)
  })
}
