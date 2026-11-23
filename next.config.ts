import type { NextConfig } from 'next'

const configuracion: NextConfig = {
  // Carpeta de salida propia para pruebas: no pisa la .next del dueño
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // Las acciones de servidor admiten 1 MB por defecto; el PDF de un CV puede llegar a 5 MB (más lo que añade el formulario)
    serverActions: { bodySizeLimit: '6mb' },
  },
}

export default configuracion
