/** Las iniciales de las dos primeras palabras del nombre, en mayúsculas; vacío si no hay nombre */
export function iniciales(nombre: string | undefined): string {
  const palabras = (nombre ?? '').trim().split(/\s+/).filter((palabra) => palabra !== '')
  return palabras
    .slice(0, 2)
    .map((palabra) => Array.from(palabra)[0] ?? '')
    .join('')
    .toLocaleUpperCase()
}
