import type { Aliado } from '../../domain/Aliado'
import type { AliadoRepository } from '../../domain/AliadoRepository'

// inventado: 12 aliados de ejemplo hasta tener los reales o el backend.
// Los nombres y las descripciones son ficticios (no corresponden a ninguna marca ni persona real).
// Sin logos: se muestra el nombre. Van intercalados por tipo, como se verían en la página.
// Las descripciones tienen la extensión que se espera de las reales (unas 25 a 35 palabras).
const ALIADOS: Aliado[] = [
  { id: 'mentoria-producto', nombre: 'Mentoría en producto', tipo: 'mentores', descripcion: 'Acompaña a equipos técnicos a convertir una idea en un producto que la gente use: qué construir primero, cómo hablar con los primeros usuarios y cómo saber si funciona.' },
  { id: 'cowork-plaza', nombre: 'Cowork Plaza', tipo: 'organizadores', descripcion: 'Espacio de trabajo y eventos en el centro de la ciudad. Recibe cada semana a los nómadas para trabajar juntos, conocerse y probar ideas en un ambiente tranquilo.' },
  { id: 'fondo-semilla-sur', nombre: 'Fondo Semilla Sur', tipo: 'estrategicos', descripcion: 'Capital inicial y acompañamiento para proyectos de la comunidad con equipo completo. Evalúa equipos que combinan perfiles técnicos y de negocio y los conecta con otros inversionistas.' },
  { id: 'mentoria-ventas', nombre: 'Mentoría en ventas', tipo: 'mentores', descripcion: 'Ayuda a conseguir los primeros clientes y a validar la oferta con ventas reales: cómo hablar con compradores, cómo cerrar una venta y cómo medir lo que funciona.' },
  { id: 'comunidad-brujula', nombre: 'Comunidad Brújula', tipo: 'organizadores', descripcion: 'Red de emprendedores que organiza encuentros y talleres en varias ciudades. Reúne a fundadores en etapas tempranas para compartir lo que aprenden y apoyarse entre ellos.' },
  { id: 'universidad-horizonte', nombre: 'Universidad Horizonte', tipo: 'estrategicos', descripcion: 'Conecta a estudiantes y egresados con equipos fundadores de la comunidad. Ofrece espacios del campus para eventos y ayuda a que más perfiles técnicos y de negocio se encuentren.' },
  { id: 'mentoria-financiera', nombre: 'Mentoría financiera', tipo: 'mentores', descripcion: 'Modelos financieros, métricas y flujo de caja para proyectos que empiezan. Ayuda a entender cuánto cuesta lanzar, cuándo se acaba el dinero y qué números mirar cada mes.' },
  { id: 'casa-emprende', nombre: 'Casa Emprende', tipo: 'organizadores', descripcion: 'Sede para eventos presenciales y encuentros de networking con aliados. Cuenta con una sala para dinámicas en grupo y espacio para que los equipos trabajen después del evento.' },
  { id: 'aceleradora-cumbre', nombre: 'Aceleradora Cumbre', tipo: 'estrategicos', descripcion: 'Programa de aceleración al que pueden postular los equipos de la comunidad. Combina mentoría, un grupo de pares y una presentación final ante posibles inversionistas.' },
  { id: 'mentoria-operaciones', nombre: 'Mentoría en operaciones', tipo: 'mentores', descripcion: 'Procesos y logística para que la empresa crezca con orden. Ayuda a documentar cómo se hace cada cosa, a elegir proveedores y a prepararse para cumplir con la normativa.' },
  { id: 'red-joven-emprende', nombre: 'Red Joven Emprende', tipo: 'organizadores', descripcion: 'Comunidad universitaria que lleva los eventos de Nómadas a nuevas ciudades. Organiza encuentros entre estudiantes con ideas y ayuda a que lleguen a la comunidad.' },
  { id: 'estudio-legal-aliado', nombre: 'Estudio Legal Aliado', tipo: 'estrategicos', descripcion: 'Asesoría legal básica para constituir la empresa y ordenar los acuerdos entre socios. Explica qué debe quedar por escrito antes de empezar y cómo repartir la propiedad.' },
]

export class MockAliadoRepository implements AliadoRepository {
  async listarAliados(): Promise<Aliado[]> {
    return ALIADOS
  }
}
