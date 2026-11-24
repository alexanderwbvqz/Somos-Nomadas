// Lo que devuelven los casos de uso que guardan algo del perfil. `fallo` es un error al guardar o leer; `limite` (demasiados
// intentos seguidos) lo pone quien recibe la petición.
export type ResultadoGuardar<Errores> =
  | { ok: true }
  | { ok: false; errores: Errores; motivo?: 'limite' | 'fallo' }
