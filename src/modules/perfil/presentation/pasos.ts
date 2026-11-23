/** Un paso del recorrido donde se corrige lo que muestra el perfil: su nombre (del idioma de la persona) y adónde lleva */
export type PasoPerfil = { nombre: string; href: string }

/** Los pasos del recorrido de los que sale lo que muestra el perfil; los pone quien arma la pantalla */
export type PasosPerfil = { bienvenida: PasoPerfil; tareas: PasoPerfil; historias: PasoPerfil; forma: PasoPerfil }
