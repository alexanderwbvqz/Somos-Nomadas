import type { Aliado } from '../../domain/Aliado'
import type { AliadoRepository } from '../../domain/AliadoRepository'

// inventado: 12 aliados de ejemplo hasta tener los reales o el backend.
// Los nombres son ficticios (no corresponden a ninguna marca real). Sin logos: se muestra el nombre.
// Van intercalados por tipo, como se verían en la página.
const ALIADOS: Aliado[] = [
  { id: 'mentoria-producto', nombre: 'Mentoría en producto', tipo: 'mentores', descripcion: 'Acompaña a equipos técnicos a convertir una idea en un producto que la gente use.' },
  { id: 'cowork-plaza', nombre: 'Cowork Plaza', tipo: 'organizadores', descripcion: 'Espacio de trabajo y eventos para que los nómadas se reúnan cada semana.' },
  { id: 'fondo-semilla-sur', nombre: 'Fondo Semilla Sur', tipo: 'estrategicos', descripcion: 'Capital inicial y acompañamiento para proyectos de la comunidad con equipo completo.' },
  { id: 'mentoria-ventas', nombre: 'Mentoría en ventas', tipo: 'mentores', descripcion: 'Ayuda a conseguir los primeros clientes y a validar la oferta con ventas reales.' },
  { id: 'comunidad-brujula', nombre: 'Comunidad Brújula', tipo: 'organizadores', descripcion: 'Red de emprendedores que organiza encuentros y talleres en varias ciudades.' },
  { id: 'universidad-horizonte', nombre: 'Universidad Horizonte', tipo: 'estrategicos', descripcion: 'Conecta a estudiantes y egresados con equipos fundadores de la comunidad.' },
  { id: 'mentoria-financiera', nombre: 'Mentoría financiera', tipo: 'mentores', descripcion: 'Modelos financieros, métricas y flujo de caja para proyectos que empiezan.' },
  { id: 'casa-emprende', nombre: 'Casa Emprende', tipo: 'organizadores', descripcion: 'Sede para eventos presenciales y encuentros de networking con aliados.' },
  { id: 'aceleradora-cumbre', nombre: 'Aceleradora Cumbre', tipo: 'estrategicos', descripcion: 'Programa de aceleración al que pueden postular los equipos de la comunidad.' },
  { id: 'mentoria-operaciones', nombre: 'Mentoría en operaciones', tipo: 'mentores', descripcion: 'Procesos y logística para que la empresa crezca con orden.' },
  { id: 'red-joven-emprende', nombre: 'Red Joven Emprende', tipo: 'organizadores', descripcion: 'Comunidad universitaria que lleva los eventos de Nómadas a nuevas ciudades.' },
  { id: 'estudio-legal-aliado', nombre: 'Estudio Legal Aliado', tipo: 'estrategicos', descripcion: 'Asesoría legal básica para constituir la empresa y ordenar los acuerdos entre socios.' },
]

export class MockAliadoRepository implements AliadoRepository {
  async listarAliados(): Promise<Aliado[]> {
    return ALIADOS
  }
}
