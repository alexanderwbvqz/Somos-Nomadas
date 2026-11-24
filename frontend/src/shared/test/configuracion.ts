import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Con globals desactivado, Testing Library no limpia sola: se hace tras cada prueba
afterEach(() => {
  cleanup()
})
