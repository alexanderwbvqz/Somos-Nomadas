import type { ReactNode } from 'react'

// Marco común de la bienvenida: una tarjeta centrada.
export function TarjetaBienvenida({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-9 escritorio:py-[4.5rem]">
      <div className="rounded-3xl bg-tarjeta p-6 escritorio:p-10">{children}</div>
    </div>
  )
}
