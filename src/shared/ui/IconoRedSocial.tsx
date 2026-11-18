export type TipoRedSocial = 'instagram' | 'linkedin'

// Los nombres de las redes son marcas: no se traducen
export const nombresRedesSociales: Record<TipoRedSocial, string> = { instagram: 'Instagram', linkedin: 'LinkedIn' }

const trazos: Record<TipoRedSocial, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5M8 8v.01M12 16v-5M12 13a2.5 2.5 0 0 1 5 0v3" />
    </>
  ),
}

// Icono decorativo: el nombre de la red va en el enlace que lo contiene
export function IconoRedSocial({ tipo }: { tipo: TipoRedSocial }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazos[tipo]}
    </svg>
  )
}
