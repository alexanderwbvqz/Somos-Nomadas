import type { NextConfig } from 'next'

const configuracion: NextConfig = {
  // Carpeta de salida propia para pruebas: no pisa la .next del dueño
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

export default configuracion
