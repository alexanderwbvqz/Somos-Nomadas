import { describe, expect, it } from 'vitest'
import { PASOS_TOTAL } from './recorrido'

describe('recorrido', () => {
  it('tiene cuatro pasos: tareas, más de lo que haces, historias y forma de emprender', () => {
    expect(PASOS_TOTAL).toBe(4)
  })
})
