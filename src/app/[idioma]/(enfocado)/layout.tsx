// Pantallas de una sola tarea (crear cuenta, iniciar sesión, completar el perfil): sin cabecera ni pie del sitio.
// Cada pantalla pone su propia barra con el logo, porque lo que muestra a la derecha cambia de una a otra
// (el selector de idioma, o en qué paso va la persona), y su <main>.
export default function LayoutEnfocado({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
