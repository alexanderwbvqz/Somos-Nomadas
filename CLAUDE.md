# Reglas base para agentes (plantilla reutilizable)

Extraídas de Power Hub. Se copia a la raíz del otro proyecto como `CLAUDE.md` (o se importa desde él con `@reglas-base.md`). Lo marcado **[adaptar]** depende del stack del proyecto: se ajusta o se borra. Lee esto completo antes de tocar código. Si lo que te piden contradice este documento, avisa y no lo hagas sin confirmación.

## 1. Cómo trabajar

- **Conversar primero:** aclarar lo ambiguo antes de construir; preguntar si falta información. Si algo es grande, el orden es: conversar → spec → plan → aprobación del dueño → implementar → revisar.
- **No inventar datos en silencio:** lo inventado se marca como tal (comentario `// inventado` y una lista en el documento de estado). Los textos y cifras que da el dueño (capturas, mockups) son datos fijos: se copian literal, con sus erratas, y se avisa de ellas.
- No crear carpetas, capas ni abstracciones que la guía no describa. Sin refactors ni renombrados «de paso»: se proponen.
- Antes de escribir algo, buscar si ya existe (colores, funciones, claves de texto). Una sola definición de cada cosa.
- Declarar «hecho» solo con evidencia: tests, lint, tipos y, si es visual, capturas. Verificar los reportes contra el repositorio. Si algo falla, decirlo con la salida.
- Las acciones difíciles de revertir o que salen del equipo (push, merge, despliegues, borrar, cambios en cuentas externas) se confirman antes, aunque se haya aprobado algo parecido antes.

## 2. Git y commits

- **No `git push` ni merge sin que el dueño lo pida.** Trabajar en una rama; la rama de producción es la que diga el proyecto **[adaptar]**.
- Commits en español sin tildes, tema corto y prefijo (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`), un commit por unidad lógica, terminados con la línea `Co-Authored-By` del entorno.
- Ramas desde la rama principal; PR hacia ella. Los PR terminan con la línea de atribución del entorno.
- En Windows, al editar archivos por script, conservar el fin de línea existente.

## 3. Arquitectura hexagonal **[adaptar]**

```
modules/<modulo>/
  domain/          entidades, reglas puras, puertos, errores
  application/     casos de uso
  infrastructure/  adaptadores (http, mock, mappers con zod)
  presentation/    hooks, ui/ (ladrillos), components/ (secciones), mappers/ (dominio → pantalla), vistas puras
  language/        textos por idioma (si el módulo tiene pantalla)
composition/<modulo>/   único sitio que conoce mocks y http; una carpeta por módulo, con su mismo nombre:
  pantallas/       <Nombre>Conectado.tsx (y piezas como la barra o el pie que arma ese módulo)
  fabricas/        eligen el adaptador (mock o http) de cada puerto
  acciones/        acciones de servidor (solo si el módulo las necesita)
shared/            genérico, sin vocabulario de negocio
```

Rutas (`app/[idioma]/`): una carpeta de grupo según lo que rodea a la página.

- `(sitio)`: páginas públicas, con la cabecera y el pie completos.
- `(enfocado)`: pantallas de una sola tarea (cuenta, bienvenida, recorrido de habilidades): sin cabecera ni pie; cada pantalla pone su propia barra y su `<main>`.
- `(cuenta)`: páginas de la cuenta de la persona (perfil, y más adelante descubrir, conversaciones, guardados): su `layout.tsx` pone la barra de la cuenta y el `<main>` una sola vez; sin pie. La barra es de `sitio`.

Reglas de dependencia:

- `domain` no importa nada de afuera (ni React, ni `fetch`, ni zod, ni otros módulos salvo su `domain`).
- `application` solo importa de `domain`.
- `infrastructure` y `presentation` importan de `domain` y `application`, **nunca entre sí**.
- Un módulo solo importa el `domain` de otro; jamás su `infrastructure` ni su `presentation`. La composición entre módulos se hace en `composition/` con slots y props.
- Las páginas y componentes no llaman a `fetch` ni a repositorios: usan hooks que ejecutan casos de uso.
- Los campos de la API se mantienen tal cual en el adaptador y se traducen en el mapper (zod).
- `shared/` no importa de ningún módulo ni de `composition`.
- Solo `composition/` conoce los adaptadores concretos (mock o http).
- Cada pantalla: `<Nombre>View.tsx` pura (datos y slots por props) en su módulo + `<Nombre>Conectado.tsx` en `composition/<modulo>/pantallas/`. Lo que una pantalla junta de varios módulos vive en el módulo dueño de esa pantalla; las subcarpetas se crean solo cuando hacen falta.
- Imports que salen del módulo por alias (`@/shared/...`); las relativas largas (`../../../../`) están prohibidas.
- Vigilar las reglas con ESLint (`no-restricted-imports`) y un test que corra ESLint sobre archivos imaginarios y exija la violación.
- Datos de ejemplo solo en `infrastructure/mock/`.

`ui/` vs `components/` vs `shared/ui`: `shared/ui` es genérico (Button, Badge); `presentation/ui` son ladrillos que solo usan piezas del mismo módulo; `presentation/components` son secciones que coloca `composition/` o la vista; `presentation/mappers` son funciones puras (sin React ni efectos) que traducen datos del dominio a lo que muestra la pantalla: mensajes de error según el idioma, formatos de cifras y fechas, o las props de una vista. Son distintos de `infrastructure/mappers`, que traducen en el otro sentido (lo que llega de fuera → dominio).

## 4. Textos e idiomas **[adaptar]**

- Todo texto visible va en `language/` del módulo, en todos los idiomas con **claves idénticas** (un test lo vigila). Sin texto fijo en componentes.
- Un texto repetido en dos módulos del mismo idioma se unifica en una clave y se pasa por props.
- Los textos visibles llevan tildes; los identificadores no.

## 5. Estilo visual **[adaptar: solo si el proyecto usa Tailwind y tokens]**

- Colores solo mediante tokens en `shared/styles/colores/`: los componentes usan clases con nombre (`bg-card`, `border-border`…) y **nunca** `#fff`, `rgb(...)`, `hsl(var(--…))` ni la paleta por defecto de Tailwind. Un test lo vigila.
- Una etiqueta es siempre `Badge` con un tono (`data-tono`).
- Tipografía solo en `shared/styles/tipografia/`; los componentes usan `font-sans` / `font-mono`.
- Animaciones solo en `shared/styles/animaciones/` y todas respetan `prefers-reduced-motion`.
- Accesibilidad: roles y nombres accesibles, foco visible, el foco no se pierde al cambiar el contenido, campos de texto a 16 px en móvil, sin desborde horizontal.
- Anchos a probar: 390, 768, ~1030 y 1280 px, con textos largos.

## 6. Convenciones de nombres

Código y comentarios en español **sin tildes ni ñ en identificadores**. Inglés solo para: `Repository`, `Mock`, `Http`, `use`, `Schema`, `Mapper`, `View`.

| Qué | Convención | Ejemplo |
|---|---|---|
| Carpetas | minúsculas con guiones | `control-central`, `use-cases` |
| Componentes React | PascalCase, uno por archivo | `MenuLateral.tsx` |
| Hooks | `use` + nombre | `useIncubadora.ts` |
| Entidades | PascalCase singular | `Programa.ts` |
| Puertos | entidad + `Repository` | `CuentaRepository.ts` |
| Casos de uso | verbo + sustantivo, camelCase | `obtenerIncubadora.ts` |
| Adaptadores | tecnología + puerto | `HttpCuentaRepository.ts`, `MockCuentaRepository.ts` |
| Mappers / esquemas | `...Mapper.ts` / `...Schema.ts` | `cuentaMapper.ts` |
| Vistas / pantallas conectadas | `<Nombre>View.tsx` / `<Nombre>Conectado.tsx` | `AppShellConectado.tsx` |
| Tests | junto al archivo, `.test.ts(x)` | `construirRuta.test.ts` |
| Claves de idioma | camelCase por sección | `menu.controlCentral` |
| Variables de entorno | `NEXT_PUBLIC_USAR_MOCKS_<MODULO>` | `NEXT_PUBLIC_USAR_MOCKS_CUENTA` |

## 7. Pruebas y lint

- Tests de dominio y casos de uso: sin renderizar y sin importar el framework de tests. Componentes: Testing Library por rol y nombre accesible.
- Cada test negativo debe poder fallar. Un test que no puede fallar no vale.
- ESLint sin `argsIgnorePattern`: los parámetros sin uso se omiten, no se prefijan con `_`.
- Antes de decir «hecho»: tests completos, lint, tipos y, si hay pantalla, e2e. Comandos típicos desde la carpeta del frontend: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm e2e` **[adaptar]**.
- No agregar librerías sin consultar.

## 8. Puertos y entornos **[adaptar]**

- El puerto del dueño (el de su servidor de desarrollo habitual) **jamás se toca**, y tampoco su carpeta de caché. Los servidores propios de las pruebas usan otro puerto y su propia carpeta de caché (`NEXT_DIST_DIR`).
- Antes de probar, comprobar que el puerto escucha; al terminar, apagar solo el propio.
- Las variables `NEXT_PUBLIC_*` se fijan al compilar: tras cambiarlas hay que volver a desplegar. Se leen con acceso literal (`process.env.NEXT_PUBLIC_X`).

## 9. Seguridad y datos personales

- Nunca abrir ni imprimir archivos `.env` con secretos: usar solo `.env.example` para conocer los nombres. Los `.env*.local` están ignorados.
- Datos personales (nombres, correos): no loguearlos, no ponerlos en analítica ni en URLs, validar todo en el servidor, y guardar la prueba del consentimiento si se pide.
- Un formulario público necesita validación en el servidor, CORS restringido a los orígenes propios, un campo trampa (honeypot) y límite de peticiones; el captcha se añade si llega spam.
- No tocar cuentas ni proyectos ajenos (otros despliegues, DNS de otros dominios) sin que el dueño lo pida y lo confirme.
- Subida de imágenes: el servidor revalida tipo y tamaño; los SVG se sirven desde otro origen o sanitizados.

## 10. Qué no se copió de Power Hub

El árbol de módulos, el estado de cada plan, las cifras de tests, las decisiones abiertas y las listas de datos inventados de Power Hub son de ese proyecto. En el nuevo proyecto se empieza con un `## Estado` propio, vacío, y se va llenando.
