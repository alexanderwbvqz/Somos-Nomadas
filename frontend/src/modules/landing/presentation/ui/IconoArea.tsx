import type { ClaveArea } from '../../domain/match'

const trazos: Record<ClaveArea, React.ReactNode> = {
  tecnologia: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  marketing: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  operaciones: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  finanzas: <path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />,
}

// Icono decorativo de cada área (el nombre del área va siempre en texto al lado)
export function IconoArea({ area }: { area: ClaveArea }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-texto"
    >
      {trazos[area]}
    </svg>
  )
}
