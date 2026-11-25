# Autenticación: correo y contraseña

Estado: **decisiones aprobadas por el dueño** (en cada caso, la opción más segura: renovación con dos tokens, contador de intentos en la base y correo confirmado obligatorio). **Implementado en `backend/`** (módulo `acceso`, rama `feat/backend-acceso`): dominio, casos de uso, API, adaptadores de Supabase y la composición. **Falta verificar el SQL de `migraciones/` contra un Postgres real** (ver «Pendientes» en `backend/CLAUDE.md`) y conectar el frontend. Las librerías están aprobadas (sección 13).

Es el contrato entre `frontend/` y `backend/` para entrar con correo y contraseña. Google, la confirmación del correo y recuperar la clave quedan para después (ver «Fuera de alcance»).

## 1. Decisiones ya tomadas

- Supabase se usa solo como Postgres. No se usa Supabase Auth.
- El backend maneja las cuentas: guarda la clave con hash y firma sus propios JWT.
- El navegador nunca habla con Supabase ni guarda el token. La sesión vive en una cookie `httpOnly` del servidor de Next, que reenvía el token al backend.
- Los datos personales (correo, clave) no se escriben en logs ni en URLs.

## 2. Qué cubre esta primera entrega

| Qué | Ruta |
|---|---|
| Registro | `POST /acceso/registro` |
| Inicio de sesión | `POST /acceso/sesion` |
| Quién soy | `GET /acceso/yo` (ruta privada; prueba que el JWT funciona de punta a punta) |
| Renovar sesión | `POST /acceso/renovar` |
| Cerrar sesión | `POST /acceso/cierre` |

## 3. La cuenta

Una cuenta es solo identidad. El nombre, el país y lo demás son del perfil (otro módulo).

Tabla `cuentas` (migración `0001_cuentas.sql`, que **no se ejecuta sobre la base real sin confirmación**):

| Columna | Tipo | Nota |
|---|---|---|
| `id` | `uuid`, clave primaria | Generado por el backend |
| `correo` | `text`, único | Siempre `trim()` y minúsculas |
| `clave_hash` | `text` | argon2id. La clave nunca se guarda tal cual |
| `correo_confirmado` | `boolean`, por defecto `false` | Ver sección 9 |
| `politica_aceptada_en` | `timestamptz` | Prueba del consentimiento |
| `politica_version` | `text` | Qué versión de la política se aceptó |
| `creada_en` | `timestamptz` | |

Tabla `sesiones` (token de renovación, ver sección 7): `id`, `cuenta_id`, `token_hash` (el token nunca se guarda tal cual), `expira_en`, `revocada_en`, `motivo_revocacion` (`rotada`, `cerrada` o `robo`; lleva valor si y solo si la sesión está revocada) y `creada_en`.

Tabla `intentos_acceso` (límite de intentos, ver sección 8): `id`, `accion` (`registro` o `sesion`), `huella` (HMAC de la IP o del correo con un secreto del servidor; nunca el valor en claro) y `ocurrido_en`. La función SQL `consumir_intento` borra lo caducado **solo de la clave que consulta**: falta una limpieza periódica del resto (ver «Pendientes» en `backend/CLAUDE.md`).

Todas las tablas llevan RLS activado y sin políticas: solo el backend entra, con la clave de servidor.

## 4. Reglas de los datos

Son las del dominio del frontend (`modules/acceso/domain/cuenta.ts`); el backend las **vuelve a validar** porque no se fía del navegador. Una sola definición por lado, mismos números.

- `correo`: obligatorio, hasta 120 caracteres. Se acepta **cualquier dominio**. Se normaliza con `trim()` y minúsculas. Formato válido significa:
  - sin espacios ni caracteres de control (saltos de línea incluidos);
  - un solo `@`, con parte local de hasta 64 caracteres;
  - dominio con al menos un punto, sin puntos seguidos ni al inicio o al final, y terminación de 2 o más letras.
  - No se intenta una validación más estricta: quien prueba que el correo existe es el enlace de confirmación.
- `clave`: de 8 a 128 caracteres, con al menos una **minúscula**, una **mayúscula**, un **número** y un **carácter especial**. **No se recorta**: los espacios cuentan. «Carácter especial» es cualquiera que no sea letra ni número (las letras con tilde y la `ñ` cuentan como letras). Este requisito se aplica solo al **registro**: el inicio de sesión no vuelve a exigirlo, para no bloquear cuentas existentes si las reglas cambian.
- `acepta_politica`: debe ser `true` en el registro.
- `sitio_secundario`: campo trampa (honeypot). Una persona no lo ve ni lo rellena; si trae algo, es un robot. Acepta cualquier valor y sin tope de tamaño (un número, una lista, un texto enorme): un 422 que señalara este campo le diría al robot que es una trampa. Lo que no es texto cuenta como relleno; nulo o vacío, no.

Los campos de la API van en `snake_case`. El frontend los traduce a su dominio en el mapper (zod).

## 5. Rutas

### `POST /acceso/registro`

Petición:
```json
{ "correo": "ana@correo.com", "clave": "…", "acepta_politica": true, "sitio_secundario": "" }
```

Respuesta: **`202 Accepted`** con cuerpo vacío, siempre que los datos sean válidos. No dice si el correo ya tenía cuenta, para que quien lo escribió no pueda averiguar quién está registrado (el puerto `CuentaRepository.registrar` del frontend ya exige esto).

- Correo nuevo: crea la cuenta.
- Correo ya registrado: no crea nada, no cambia nada y responde igual.
- `sitio_secundario` con contenido: responde `202` sin crear nada.
- Datos inválidos: `422` (sección 6).

### `POST /acceso/sesion`

Petición: `{ "correo": "…", "clave": "…" }`.

Respuesta `200`:
```json
{ "token_acceso": "<jwt>", "expira_en": 900, "correo": "ana@correo.com" }
```
Más `token_renovacion` (sección 7). Si `correo_confirmado` es `false` y la confirmación es obligatoria (sección 9), responde `403 correo_sin_confirmar` en lugar de abrir sesión, y solo después de comprobar que la clave es correcta (para no revelar qué correos existen).

- Correo inexistente o clave incorrecta: `401 credenciales_invalidas`, **el mismo cuerpo y el mismo tiempo de respuesta** en los dos casos. Si el correo no existe, se verifica la clave contra un hash falso para que no se note.
- Demasiados intentos: `429 limite_excedido`, con la cabecera `Retry-After`.

### `GET /acceso/yo`

Cabecera `Authorization: Bearer <token_acceso>`. Respuesta `200`:
```json
{ "id": "…", "correo": "ana@correo.com", "correo_confirmado": false }
```
Sin token, o con un token inválido o caducado: `401 no_autenticado`, con la cabecera `WWW-Authenticate: Bearer`. El esquema `Bearer` se acepta en cualquier capitalización. Nunca devuelve la clave, su hash ni la prueba del consentimiento.

### `POST /acceso/renovar`

Petición: `{ "token_renovacion": "…" }`. Respuesta `200`: `{ "token_acceso": "…", "expira_en": 900, "token_renovacion": "…" }` (un par nuevo; el token anterior queda revocado).

- Token desconocido, caducado o revocado: `401 no_autenticado`.
- Un token ya revocado se rechaza con `401`. Si se tomó por robo, se cierran además **todas** las sesiones de la cuenta; los casos están en la sección 7.

### `POST /acceso/cierre`

Petición: `{ "token_renovacion": "…" }`. Respuesta `204` sin cuerpo. Tampoco falla si el token es desconocido o ya estaba cerrado.

## 6. Errores

Un solo formato en toda la API (lo produce `shared/http/`):

```json
{ "codigo": "datos_invalidos", "campos": { "clave": "clave_corta" } }
```

| Estado | `codigo` | Cuándo |
|---|---|---|
| 422 | `datos_invalidos` | Falla la validación. `campos` indica el campo y el código: `obligatorio`, `correo_invalido`, `clave_corta`, `clave_larga`, `clave_sin_minuscula`, `clave_sin_mayuscula`, `clave_sin_numero`, `clave_sin_especial`, `politica_requerida` (los mismos del frontend, en `snake_case`). Si la clave incumple varias reglas de composición, `campos.clave` lleva el primer código en este orden: minúscula, mayúscula, número, especial |
| 401 | `credenciales_invalidas` | Inicio de sesión fallido |
| 401 | `no_autenticado` | Ruta privada sin token válido |
| 403 | `correo_sin_confirmar` | Clave correcta, pero el correo aún no se confirmó |
| 429 | `limite_excedido` | Demasiados intentos |
| 404 | `no_encontrado` | La ruta no existe |
| 405 | `metodo_no_permitido` | La ruta existe, pero no con ese método |
| 500 | `fallo` | Cualquier otro error. Sin detalles internos |

Además de los códigos de campo de la fila `datos_invalidos`, un campo puede llevar `obligatorio` (falta) o `invalido` (el tipo no es el esperado, o supera el tamaño máximo que se acepta por HTTP: 500 caracteres el correo, 1000 la clave). Si el cuerpo ni siquiera es JSON, `campos` va vacío. El error de validación **nunca repite lo que se envió** (podría ser una clave). Los errores inesperados se registran con el tipo de error y la ruta, sin el mensaje ni el traceback, porque podrían llevar datos personales.

Los mensajes que ve la persona **no** vienen de la API: son del frontend (`language/`) y se eligen según el `codigo`.

## 7. Sesión y token

**JWT firmado por el backend.**

- Algoritmo `HS256` con un secreto del `.env` del backend (el mismo servicio emite y valida, no hace falta clave pública).
- Contenido: `sub` (id de la cuenta), `iat`, `exp`. **Sin correo ni otros datos personales**: un JWT se puede leer.
- El backend rechaza tokens sin firma válida, caducados o con algoritmo distinto de `HS256`.

**Duración y renovación (decidido).**
- Token de acceso de **15 minutos**.
- Token de renovación **opaco** (no JWT), de 30 días, guardado **con hash** en la tabla `sesiones` y **rotado** en cada uso: al renovar, el anterior queda revocado. Permite cerrar sesión de verdad y revocar si se roba.
- **Qué pasa si llega un token de renovación que ya estaba revocado** depende de por qué lo estaba (`motivo_revocacion`):

  | Motivo | Cuándo se presenta | Resultado |
  |---|---|---|
  | `rotada` | pasados **10 segundos** de la rotación | `401` y se toma por **robo**: se cierran todas las sesiones de la cuenta que sigan abiertas (motivo `robo`) |
  | `rotada` | dentro de esos 10 segundos | `401` y **nada más**: es una carrera legítima (dos peticiones casi a la vez con el mismo token, por ejemplo dos de Next, o un reintento de red) |
  | `cerrada` | cuando sea | `401` y nada más: la persona cerró esa sesión a propósito; una pestaña vieja que reenvía el token no desconecta los demás dispositivos |
  | `robo` | cuando sea | `401` y nada más |

  Si dos peticiones simultáneas compiten por rotar el mismo token, gana una y la otra recibe `401` sin cerrar nada.
  Un token caducado también solo se rechaza.
- **Riesgo que se acepta con la tolerancia de 10 segundos:** dentro de ese margen, reusar un token robado ya no cierra
  todas las sesiones. El atacante tampoco obtiene sesión (el token está revocado, recibe `401`), salvo que gane una
  carrera exacta con la víctima; entonces la víctima recibe `401` y debe volver a iniciar sesión. Es el equilibrio
  habitual de esta técnica. La tolerancia es la constante `TOLERANCIA_REUSO_SEGUNDOS` del dominio.
- Una revocación conserva su fecha y su motivo originales: revocar otra vez no los cambia.
- **Un solo reloj:** todas las fechas de una sesión (`creada_en`, `expira_en` y `revocada_en`) las pone la **aplicación**, nunca el reloj de la base de datos. La tolerancia de 10 segundos compara la hora de la aplicación con `revocada_en`; si la revocación usara el reloj de la base, unos segundos de diferencia entre ambos relojes (medidos ~2,6 s con la base de Supabase) acortarían o alargarían la tolerancia. Al rotar, la anterior se revoca en el instante en que nace la nueva (`creada_en` de la nueva). Migración `0005`.
- `POST /acceso/renovar` recibe el token de renovación y devuelve un par nuevo. `POST /acceso/cierre` revoca la sesión actual.

**Cookies en Next** (el navegador nunca ve los tokens):
- `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- El servidor de Next lee la cookie y manda `Authorization: Bearer …` al backend.
- Consecuencia: las llamadas a rutas **privadas** salen del servidor de Next (acciones de servidor y rutas de servidor), no del navegador. Las públicas (`eventos`, `aliados`) pueden seguir llamándose desde el navegador.
- Cerrar sesión borra la cookie y, si hay renovación, avisa al backend para revocar.

## 8. Seguridad

- **Hash:** `argon2id` con los parámetros por defecto recomendados de la librería elegida, ajustados al servidor de Render. Nunca SHA ni MD5.
- **Enumeración de cuentas:** el registro responde igual exista o no el correo; el inicio de sesión responde igual si falla el correo o la clave, y tarda lo mismo.
- **Límite de intentos (decidido):** por IP y por correo, en registro e inicio de sesión. El contador se guarda **en la base** (tabla `intentos_acceso`), así sobrevive a los reinicios de Render y funciona con varias instancias. Se guarda un hash de la IP y del correo, no el valor en claro. Umbrales (primera propuesta, en `domain/intentos.py`; se ajustan con el uso real). Cuentan todos los intentos, también los que aciertan:

  | Acción | Se cuenta por | Máximo | Ventana |
  |---|---|---|---|
  | Registro | origen (IP) | 5 | 1 hora |
  | Inicio de sesión | origen (IP), cualquier correo | 20 | 15 minutos |
  | Inicio de sesión | **pareja (correo, origen)** | 5 | 15 minutos |
  | Inicio de sesión | correo, desde cualquier origen (techo) | 100 | 1 hora |

  Se aplican en ese orden y un intento bloqueado por uno **no gasta** el cupo de los siguientes: quien ya está bloqueado no puede seguir llenando el techo ni alargar su propio bloqueo.
- **Nadie puede bloquear la entrada de otra persona.** El bloqueo rápido es por pareja (correo, origen), no por correo: quien gasta los cinco intentos con el correo ajeno solo se bloquea a sí mismo, y la titular entra desde su propio origen. El techo por correo (100 por hora) es lo bastante holgado para que no sirva de arma, y evita que alguien pruebe claves contra una cuenta repartiendo los intentos entre muchas IPs. Riesgos que se aceptan: (a) quien comparte origen con el atacante (la misma red o el mismo equipo) sí queda bloqueado con él; (b) un atacante con muchos orígenes puede agotar el techo de un correo (hacen falta al menos 5 orígenes y 100 intentos en una hora) y bloquear a esa persona hasta una hora. Si eso ocurre, la defensa siguiente es un captcha. La clave de la pareja usa un espacio como separador, porque un correo válido no puede llevarlo.
- **CORS:** restringido a los orígenes propios. Recordatorio: protege al navegador, no sustituye la autenticación.
- **HTTPS** siempre (Render y Vercel lo dan).
- **Logs:** sin correo ni clave. Se loguea el id de la cuenta, no el correo.
- **Secretos:** el secreto del JWT, la clave `service_role` y la contraseña de la base van solo en el `.env` del backend. Nunca en variables `NEXT_PUBLIC_*`.
- **Autorización:** cada ruta privada usa el `sub` del token. Una ruta nunca acepta un `id` de la persona como parámetro para decidir de quién son los datos.

## 9. Correo sin confirmar

La pantalla de registro hoy promete «Te enviaremos un enlace al correo para confirmarlo», y la siguiente pantalla se llama «Confirma tu correo». Sin proveedor de correo, **esta primera entrega no envía nada**.

**Decidido:** el correo confirmado es **obligatorio** para iniciar sesión. Una variable del backend, `EXIGIR_CORREO_CONFIRMADO`, vale `true` por defecto.

Consecuencia que hay que tener presente: **mientras no exista el envío de correos, nadie puede iniciar sesión con una cuenta nueva** (se crea con `correo_confirmado = false`). Para probar en local hay dos caminos:
- Poner `EXIGIR_CORREO_CONFIRMADO=false` en el `.env` de desarrollo. Nunca en producción.
- Construir la confirmación de correo antes de conectar el frontend al backend.

El frontend puede seguir mostrando la pantalla «Confirma tu correo» (hoy lo hace con los mocks), pero sin proveedor de correo no llegará ningún enlace.

## 10. Cómo encaja con el frontend

- `CuentaRepository.registrar(cuenta)` → `POST /acceso/registro`. Un `202` es éxito; un `422` o un fallo se traducen a los motivos del caso de uso.
- `CuentaRepository.iniciarSesion(correo, clave)` → `POST /acceso/sesion`. Un `200` devuelve `{ correo }`; un `401` devuelve `undefined`; un `429` y los fallos se traducen a `limite` y `fallo`.
- `iniciarConGoogle` y `reenviarConfirmacion`: **no existen todavía** en la API. El adaptador `Http` no los implementa en esta entrega; el botón de Google queda oculto o desactivado.
- El token y la cookie los maneja `composition/acceso/acciones/` (acciones de servidor), no el dominio. El dominio no sabe qué es un token.

## 11. Fuera de alcance (después)

1. Confirmación de correo y reenvío (necesita proveedor de correo; el enlace caduca en 15 minutos según la pantalla actual).
2. Recuperar clave y nueva clave (mismo proveedor).
3. Google.
4. Cambiar correo o clave dentro de la cuenta.
5. Captcha, si llega spam.

## 12. Pruebas esperadas

- Dominio y casos de uso con el repositorio en memoria, sin FastAPI ni Supabase.
- Cada test negativo debe poder fallar: correo duplicado que no se nota, clave incorrecta y correo inexistente con la misma respuesta, token caducado, token con otro algoritmo, honeypot relleno, límite de intentos.
- API con el cliente de pruebas de FastAPI y el repositorio en memoria.
- El adaptador de Supabase contra una base de pruebas, nunca contra la real.
- Un test de arquitectura (`import-linter`) con las reglas de capas.

## 13. Decisiones abiertas

Decididas: renovación con dos tokens, contador de intentos en la base, correo confirmado obligatorio.

Librerías aprobadas e instaladas: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `argon2-cffi`, `pyjwt`, `supabase`, y para desarrollo `pytest`, `httpx`, `ruff`, `mypy`, `import-linter`.

Resuelta tras la revisión de código: el reúso de un token revocado (carreras entre dos `/renovar`, o una pestaña vieja tras cerrar sesión) ya no desconecta todos los dispositivos; ver la sección 7 y la migración `0004`.

Resuelta también: el bloqueo de una cuenta por un tercero (sección 8: límite por pareja de correo y origen, con un techo por correo).

Pendientes de decidir (salieron de la revisión de código de la rama):
1. **Recalcular el hash al iniciar sesión** cuando cambien los parámetros de argon2 (`check_needs_rehash`); hoy las cuentas viejas conservan los parámetros con los que se crearon.
