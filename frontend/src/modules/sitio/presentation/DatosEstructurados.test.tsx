import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DatosEstructurados } from './DatosEstructurados'

const leer = () => document.querySelector('script[type="application/ld+json"]')

describe('DatosEstructurados', () => {
  it('escribe los datos como JSON-LD en un script que los buscadores leen', () => {
    const datos = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Somos Nómadas' }

    render(<DatosEstructurados datos={datos} />)

    expect(JSON.parse(leer()?.textContent ?? '')).toEqual(datos)
  })

  it('un texto con «</script>» no puede cerrar el script antes de tiempo ni colar HTML', () => {
    const datos = { description: '</script><script>alert(1)</script> & <b>' }

    render(<DatosEstructurados datos={datos} />)

    const crudo = leer()?.innerHTML ?? ''
    expect(crudo).not.toContain('<')
    expect(JSON.parse(leer()?.textContent ?? '')).toEqual(datos)
    expect(document.querySelectorAll('script')).toHaveLength(1)
  })
})
