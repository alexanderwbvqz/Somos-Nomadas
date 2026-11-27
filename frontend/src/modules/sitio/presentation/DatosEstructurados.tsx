// Datos para los buscadores (JSON-LD) en un <script>. El JSON se escribe con «<» escapado: así ningún texto puede
// cerrar el script antes de tiempo ni colar HTML en la página
export function DatosEstructurados({ datos }: { datos: object }) {
  const json = JSON.stringify(datos).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
