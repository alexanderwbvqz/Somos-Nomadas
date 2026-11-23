import type { Perfil } from '../../domain/perfil'

// simulado: el perfil de ejemplo de la maqueta. Los nombres y los textos que escribió la persona son inventados; los textos de las
// preguntas, las opciones y las tareas son los de la aplicación. Vienen en español en todos los idiomas hasta que el backend
// los entregue en el idioma de cada persona.
export function perfilDeEjemplo(): Perfil {
  return {
    ficha: { nombre: 'Ana', apellidos: 'Torres', ciudad: 'Lima', pais: 'Perú', iniciales: 'AT', areas: ['Tecnología'], modalidad: 'Híbrida' },
    buscando: ['Un socio comercial', 'Todavía explorando'],
    habilidades: [
      {
        nombre: 'Desarrollo web',
        nivel: 5,
        estimado: false,
        resumen: 'Es mi trabajo · Más de 5 años',
        detalle: {
          respuestas: [
            { pregunta: '¿Con qué tecnologías trabajas?', respuestas: ['JavaScript / TypeScript', 'React', 'Node.js'] },
            { pregunta: '¿En qué parte trabajas?', respuestas: ['Ambas'] },
            { pregunta: '¿Cuánto tiempo llevas con desarrollo web?', respuestas: ['Más de 5 años'] },
            { pregunta: '¿Llevaste un proyecto de principio a fin?', respuestas: ['Sí'] },
          ],
          texto: { pregunta: 'Cuéntanos algo que hayas construido', texto: 'Hice la página y el carrito de compras de una tienda en línea de artesanías.' },
        },
      },
      {
        nombre: 'Estrategia de producto',
        nivel: 3,
        estimado: false,
        resumen: 'Varias veces · 1 a 3 años',
        detalle: {
          respuestas: [
            { pregunta: '¿Para quién has trabajado en estrategia de producto?', respuestas: ['Para una empresa', 'Para clientes, por mi cuenta'] },
            { pregunta: '¿Cuánto tiempo llevas con estrategia de producto?', respuestas: ['1 a 3 años'] },
          ],
          texto: {
            pregunta: 'Cuéntanos algo que hayas hecho en estrategia de producto',
            texto: 'Decidimos qué lanzar primero en una tienda en línea y probamos con diez clientes antes de construirlo.',
          },
        },
      },
      {
        nombre: 'Marketing digital',
        nivel: 3,
        estimado: false,
        resumen: 'Varias veces · 3 a 5 años',
        detalle: {
          respuestas: [
            { pregunta: '¿En qué canales has trabajado?', respuestas: ['Anuncios en Meta (Facebook e Instagram)', 'Redes orgánicas'] },
            { pregunta: '¿Manejaste presupuesto de anuncios?', respuestas: ['Hasta USD 1 000 al mes'] },
            { pregunta: '¿Qué resultados medías?', respuestas: ['Alcance', 'Ventas generadas'] },
            { pregunta: '¿Cuánto tiempo llevas con marketing digital?', respuestas: ['3 a 5 años'] },
          ],
          texto: { pregunta: 'Cuéntanos una campaña que hayas hecho', texto: 'Una campaña para lanzar la tienda en dos países, con anuncios y redes.' },
        },
      },
      { nombre: 'Gestión de proyectos', nivel: 1, estimado: true, resumen: 'Una vez · sin indicar tiempo' },
      { nombre: 'Visualización', nivel: 1, estimado: true, resumen: 'Una vez · sin indicar tiempo' },
      { nombre: 'Contenidos y redes', nivel: 1, estimado: true, resumen: 'Una vez · sin indicar tiempo' },
    ],
    tareas: {
      total: 30,
      grupos: [
        {
          grupo: 'Definir y organizar',
          tareas: [
            { texto: 'Definir qué construir primero y por qué', veces: 'Varias veces' },
            { texto: 'Organizar un proyecto con fechas y responsables', veces: 'Una vez' },
          ],
        },
        { grupo: 'Construir con tecnología', tareas: [{ texto: 'Programar una página web', veces: 'Es mi trabajo' }] },
        { grupo: 'Trabajar con datos', tareas: [{ texto: 'Presentar datos con gráficos y tableros', veces: 'Una vez' }] },
        {
          grupo: 'Darte a conocer',
          tareas: [
            { texto: 'Lanzar campañas de anuncios en internet', veces: 'Varias veces' },
            { texto: 'Manejar redes sociales o crear contenido', veces: 'Una vez' },
          ],
        },
        {
          grupo: 'Vender y hacer negocios',
          tareas: [
            { texto: 'Convencer a un cliente de que compre', veces: 'Una vez' },
            { texto: 'Atender y resolver los problemas de los clientes', veces: 'Una vez' },
          ],
        },
      ],
    },
    historias: [
      {
        pregunta: 'Algo que lograste o construiste y de lo que estás orgulloso',
        texto: 'Armé con mi hermana una tienda en línea de artesanías. Hicimos la página, las fotos y los primeros envíos, y en tres meses vendimos a otros dos países.',
      },
      {
        pregunta: 'Una vez que resolviste un problema difícil con otras personas',
        texto: 'Nuestro proveedor falló una semana antes de una campaña. Hablamos con tres talleres nuevos, repartimos el trabajo y entregamos a tiempo.',
      },
      { pregunta: '¿Qué problema del mundo te gustaría resolver?', texto: 'El acceso a crédito para pequeños talleres.' },
    ],
    sectores: { pregunta: 'Sectores que te mueven', respuestas: ['Educación', 'Fintech', 'Impacto social'] },
    forma: [
      { pregunta: '¿Cuánto tiempo dedicarías a un proyecto propio?', respuestas: ['10 a 20 horas'] },
      { pregunta: '¿Cuándo quieres arrancar?', respuestas: ['Ya mismo'] },
      { pregunta: '¿Cómo prefieres trabajar?', respuestas: ['Híbrida'] },
      { pregunta: 'Cuando tomas decisiones…', respuestas: ['Rápido'] },
      { pregunta: 'Frente al riesgo…', respuestas: ['Busco equilibrio'] },
      { pregunta: 'Tu ritmo de trabajo', respuestas: ['Constante'] },
    ],
    buscaPerfil: { pregunta: '¿Qué perfil buscas para tu equipo?', respuestas: ['Ventas y Marketing'] },
    socioIdeal: { pregunta: '¿Cómo es tu socio ideal?', texto: 'Alguien que escuche y que no le tenga miedo a vender.' },
    sobreMi: 'Programo desde hace cuatro años y me gusta ver que lo que construyo lo use gente de verdad. Busco a alguien que venda.',
    trayectoria: [
      { desde: 2022, rol: 'Desarrolladora web', donde: 'Tienda de artesanías (proyecto propio)', que: 'Programé la tienda en línea y organicé los envíos.' },
      { desde: 2020, hasta: 2022, rol: 'Desarrolladora', donde: 'Estudio digital en Lima', que: 'Páginas web para pequeños negocios.' },
    ],
    evidencia: ['https://anatorres.example/tienda', 'https://github.com/anatorres'],
  }
}
