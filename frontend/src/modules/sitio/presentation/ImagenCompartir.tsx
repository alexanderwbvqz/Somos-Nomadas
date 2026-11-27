import { paletaImagenes } from '@/shared/styles/colores/paletaImagenes'

type Props = {
  marca: string
  /** La frase de la portada: la primera parte en letra normal y la resaltada en cursiva y color primario */
  fraseInicio: string
  fraseResaltada: string
  dominio: string
  /** El isotipo, como dirección de datos (el dibujo no puede pedir archivos) */
  logo: string
}

const palabras = (texto: string) => texto.split(/\s+/).filter(Boolean)

/**
 * La imagen que acompaña a un enlace compartido (1200 × 630). La dibuja el servidor (next/og), que solo entiende
 * estilos en línea y flexbox: por eso no hay clases ni tokens CSS, y la frase va palabra a palabra para que se parta
 * en líneas con la cursiva en medio.
 */
export function ImagenCompartir({ marca, fraseInicio, fraseResaltada, dominio, logo }: Props) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 84px',
        position: 'relative',
        backgroundColor: paletaImagenes.fondo,
        color: paletaImagenes.texto,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- el dibujo de next/og no admite next/image */}
        <img src={logo} width={58} height={54} alt="" />
        <span style={{ fontFamily: 'DM Mono', fontSize: '22px', letterSpacing: '0.28em', textTransform: 'uppercase' }}>{marca}</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: '19px',
          maxWidth: '960px',
          fontFamily: 'Newsreader',
          fontWeight: 300,
          fontSize: '76px',
          lineHeight: 1.04,
          letterSpacing: '-0.02em',
        }}
      >
        {palabras(fraseInicio).map((palabra, i) => (
          <span key={`i${i}`} data-palabra>
            {palabra}
          </span>
        ))}
        {palabras(fraseResaltada).map((palabra, i) => (
          <span key={`r${i}`} data-palabra style={{ fontStyle: 'italic', color: paletaImagenes.primario }}>
            {palabra}
          </span>
        ))}
      </div>
      <span style={{ fontFamily: 'Hanken Grotesk', fontSize: '22px', color: paletaImagenes.textoSuave }}>{dominio}</span>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '1200px', height: '14px', backgroundColor: paletaImagenes.primario }} />
    </div>
  )
}
