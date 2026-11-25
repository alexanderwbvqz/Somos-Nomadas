# Confirmación del correo

Spec de la segunda entrega de `acceso`. Completa `autenticacion.md` (secciones 9 y 11): hoy el registro crea la cuenta sin confirmar y la pantalla promete un enlace que nadie envía.

**Estado:** aprobada por el dueño el 2026-11-25, con las decisiones de la sección 10.

## 1. Qué cubre

| Qué | Ruta |
|---|---|
| Al registrarse, se envía un enlace de confirmación | `POST /acceso/registro` (ya existe; ahora además envía) |
| Confirmar el correo con el enlace | `POST /acceso/confirmacion` (nueva) |
| Reenviar el enlace | `POST /acceso/confirmacion/reenvio` (nueva) |

Fuera de esta entrega: recuperar la clave (usará el mismo envío de correos, pero es otra spec), cambiar de correo y Google.

## 2. Decisiones ya tomadas

- **Proveedor:** Resend, llamado por HTTPS desde el backend (no SMTP: Render gratis bloquea los puertos SMTP desde septiembre de 2025). Se descartan Supabase Auth (no usamos sus cuentas, y su correo de serie solo llega al equipo del proyecto) y Gmail (bloqueado en Render gratis y expone tu cuenta personal).
- **Dominio:** `somosnomadas.app`, verificado en Resend con sus registros DNS. No hace falta ningún buzón: solo se envía.
- **El correo confirmado sigue siendo obligatorio** para iniciar sesión (`EXIGIR_CORREO_CONFIRMADO=true` en producción).
- Confirmar el correo **no inicia sesión**: después de confirmar, la persona entra con su correo y su clave. Así un enlace reenviado o abierto en otro dispositivo nunca abre una sesión.

## 3. El enlace

- Token aleatorio de 32 bytes (`secrets.token_urlsafe`). En la base se guarda **solo su hash** (SHA-256), igual que los tokens de sesión.
- Un solo uso. Caduca en **24 horas** (la pantalla decía 15 minutos; se cambia el texto).
- Solo hay **un enlace vigente por cuenta**: crear uno nuevo anula los anteriores.
- Forma: `https://somosnomadas.app/{idioma}/confirmar-correo#token=…`
  - El token va **después de `#`** (fragmento): el navegador no lo manda al servidor al pedir la página, así que no queda en los registros de Vercel ni en la cabecera `Referer`. La página lo lee y se lo pasa al backend por una acción de servidor.
  - La dirección base sale de una variable nueva del backend, `URL_WEB` (en producción tiene que ser `https`).

## 4. Rutas

### `POST /acceso/registro` (cambia)

Petición: la de hoy más `idioma` (`es`, `en` o `pt`; opcional, `es` por defecto), para escribir el correo y el enlace en el idioma de la persona.

Respuesta: la de hoy, **`202` siempre**.
- Correo nuevo: crea la cuenta sin confirmar, crea un enlace y lo envía.
- Correo ya registrado: **no envía nada** y responde igual. Si la persona perdió el enlace, usa «Reenviar enlace».
- Campo trampa con contenido: `202` sin crear ni enviar nada.

### `POST /acceso/confirmacion` (nueva)

Petición: `{ "token": "…" }`.

- `200` con `{ "correo": "ana@correo.com" }`: el correo queda confirmado y el enlace usado. La pantalla muestra «Correo confirmado» y lleva a iniciar sesión.
- `400 enlace_invalido`: el token no existe, ya se usó, caducó o fue anulado por uno más nuevo. **Un solo código para todo**, para no dar pistas. La pantalla ofrece reenviar el enlace.
- Si la cuenta ya estaba confirmada por otro enlace, ese token ya estará anulado: `400 enlace_invalido`.
- Límite de intentos por origen (evita probar tokens a ciegas, aunque con 32 bytes es inviable).

### `POST /acceso/confirmacion/reenvio` (nueva)

Petición: `{ "correo": "…", "idioma": "es" }`.

Respuesta: **`202` siempre**, exista o no la cuenta, para no revelar quién está registrado.
- Cuenta sin confirmar: anula el enlace anterior, crea uno nuevo y lo envía.
- Cuenta ya confirmada o inexistente: no envía nada.
- Límites: por origen y por correo (propuesta: 3 por hora por correo y 10 por hora por origen). Con el límite superado: `429 limite_excedido`, como el resto.

## 5. Que no se note quién está registrado

Enviar un correo tarda (una llamada a Resend). Si el registro o el reenvío esperaran al envío, una cuenta nueva respondería más lento que una existente y se notaría.

**El envío se hace en segundo plano** (después de responder, con las tareas de fondo de FastAPI). La respuesta sale igual de rápido haya envío o no. Si el envío falla, se registra el fallo sin el correo ni el enlace, y la persona puede pedir otro con «Reenviar enlace».

## 6. El correo

- Remitente: `Somos Nómadas <hola@somosnomadas.app>`. El dominio está dado de alta en Resend (región us-east-1) con sus registros DKIM, SPF (`send`, `rsend`) y DMARC en Namecheap; sin seguimiento de clics ni de aperturas, para que el enlace no pase por servidores de terceros.
- Asunto y cuerpo en el idioma de la persona (es, en, pt). Versión HTML sencilla y versión de texto plano.
- Contenido: para qué es, el botón con el enlace, cuánto dura y «si no fuiste tú, ignora este correo».
- No lleva la clave ni ningún otro dato de la cuenta.

## 7. Datos (migración nueva)

Tabla `confirmaciones_correo` (nombres según las reglas aprobadas):

| Columna | Tipo | |
|---|---|---|
| `id` | `uuid` | clave primaria |
| `cuenta_id` | `uuid` | → `cuentas.id`, se borra con la cuenta |
| `token_hash` | `text` | único |
| `expira_en` | `timestamptz` | |
| `creada_en` | `timestamptz` | |
| `usada_en` | `timestamptz` | cuándo se usó para confirmar |
| `anulada_en` | `timestamptz` | cuándo dejó de valer porque se pidió otro enlace (no puede estar usada y anulada a la vez) |

Funciones SQL, atómicas, con todas las fechas del reloj de la aplicación (regla de la migración `0005`):
- `crear_cuenta_con_confirmacion(...)`: crea la cuenta y su primer enlace en **una sola llamada**, tanto si el correo es nuevo como si ya existía (en ese caso no cambia nada). Así el número de viajes a la base, y con él el tiempo de respuesta, no delata qué correos tienen cuenta.
- `renovar_confirmacion(p_correo, ...)`: si la cuenta existe y no está confirmada, anula sus enlaces vigentes y guarda el nuevo; si no, no hace nada. También una sola llamada en los dos casos. Dos reenvíos a la vez van uno detrás de otro y queda un solo enlace vigente.
- `confirmar_correo(p_token_hash, p_ahora)`: si el enlace existe, no se usó, no se anuló y no caducó, lo marca usado y pone `correo_confirmado = true`. Devuelve el correo, o nada. Dos clics a la vez: solo uno gana.
- La restricción de `intentos_acceso.accion` admite también `reenvio` y `confirmacion` (los límites de la sección 4).

RLS activado y sin políticas; solo `service_role` puede ejecutar las funciones. Se prueba en el Postgres desechable de Docker antes de aplicarla, y se aplica a Supabase **con tu confirmación**.

## 8. Configuración (backend)

| Variable | Para qué |
|---|---|
| `ENVIADOR_DE_CORREOS` | `resend` en producción. En desarrollo y pruebas, `carpeta`: guarda cada correo como archivo en `backend/correos-de-prueba/` (ignorada por Git), de donde lo lee el test de punta a punta y donde puedes abrirlo tú. Producción solo acepta `resend`. |
| `RESEND_CLAVE` | Clave de la API de Resend. Secreta: solo en el `.env` y en Render. |
| `CORREO_REMITENTE` | El remitente de la sección 6. |
| `URL_WEB` | La dirección de la web, para armar el enlace. |

`httpx` pasa de dependencia de desarrollo a dependencia del backend (aprobado; ya estaba instalado).

## 9. Frontend

- Página nueva `/{idioma}/confirmar-correo`: lee el token del fragmento, llama a una acción de servidor y muestra «Correo confirmado», con un botón a iniciar sesión, o «El enlace no es válido o caducó», con la opción de reenviarlo.
- «Reenviar enlace» (pantalla de confirmación) pasa a llamar al backend de verdad; hoy falla.
- Al iniciar sesión con el correo sin confirmar, el aviso actual ofrece también reenviar el enlace.
- El registro manda el idioma de la página.
- Textos nuevos en es, en y pt.

## 10. Decisiones del dueño (2026-11-25)

1. El enlace dura **24 horas**.
2. Remitente **`hola@somosnomadas.app`** (dominio principal, sin subdominio).
3. **`httpx`** como dependencia del backend para llamar a Resend.
4. Límites del reenvío: **3 por hora por correo y 10 por hora por origen**.

## 11. Lo que tienes que hacer tú (fuera del código)

1. ~~Crear la cuenta en Resend~~ (hecho).
2. ~~Añadir `somosnomadas.app` en Resend y sus registros DNS en Namecheap~~ (hecho el 2026-11-25; DKIM y SPF visibles en los DNS públicos, DMARC pendiente). Hasta que Resend lo marque como verificado, solo envía a tu propio correo desde `onboarding@resend.dev`.
3. Generar una clave de API y ponerla en `backend/.env` como `RESEND_CLAVE`.

## 12. Pruebas esperadas

- Casos de uso con el enviador en memoria: se envía al registrar una cuenta nueva y no a una existente; el reenvío anula el anterior; un enlace usado, caducado o anulado da `enlace_invalido`; confirmar no inicia sesión; las respuestas no cambian entre cuenta existente e inexistente.
- El adaptador de Resend con un cliente HTTP falso (qué manda, que no repite el token en los errores).
- La migración en el Postgres de Docker: permisos, la carrera de dos clics y la anulación de enlaces viejos.
- De punta a punta con Playwright: registrarse, tomar el enlace del enviador de pruebas, confirmar e iniciar sesión.
