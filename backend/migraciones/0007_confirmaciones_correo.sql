-- 0007: confirmación del correo con un enlace de un solo uso.
-- Del enlace solo se guarda el hash del token, nunca el token. Una cuenta tiene como mucho un enlace vigente: pedir
-- otro anula los anteriores. Todas las fechas las pone la aplicación (regla de la migración 0005).
-- Spec: contrato/confirmacion-correo.md.

create table confirmaciones_correo (
  id uuid not null,
  cuenta_id uuid not null,
  token_hash text not null,
  expira_en timestamptz not null,
  creada_en timestamptz not null,
  -- Cuándo se usó para confirmar el correo
  usada_en timestamptz,
  -- Cuándo dejó de valer porque se pidió otro enlace
  anulada_en timestamptz,
  constraint confirmaciones_correo_pkey primary key (id),
  constraint confirmaciones_correo_token_hash_key unique (token_hash),
  constraint confirmaciones_correo_cuenta_id_fkey foreign key (cuenta_id) references cuentas (id) on delete cascade,
  constraint confirmaciones_correo_creada_en_expira_en_check check (expira_en > creada_en),
  -- Un enlace se usa o se anula, no las dos cosas
  constraint confirmaciones_correo_usada_en_anulada_en_check check (usada_en is null or anulada_en is null)
);

create index confirmaciones_correo_cuenta_id_idx on confirmaciones_correo (cuenta_id);

alter table confirmaciones_correo enable row level security;
revoke all on table confirmaciones_correo from public;

-- Los límites de intentos cuentan también el reenvío del enlace y la confirmación
alter table intentos_acceso drop constraint intentos_acceso_accion_check;
alter table intentos_acceso
  add constraint intentos_acceso_accion_check check (accion in ('registro', 'sesion', 'reenvio', 'confirmacion'));

-- Crea la cuenta y su primer enlace en un solo paso. Una sola llamada tanto si el correo es nuevo como si ya existía:
-- así el tiempo de respuesta no delata qué correos tienen cuenta. Devuelve false, sin cambiar nada, si ya existía.
create or replace function crear_cuenta_con_confirmacion(
  p_id uuid,
  p_correo text,
  p_clave_hash text,
  p_politica_aceptada_en timestamptz,
  p_politica_version text,
  p_creada_en timestamptz,
  p_confirmacion_id uuid,
  p_token_hash text,
  p_expira_en timestamptz
) returns boolean
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_filas integer;
begin
  insert into cuentas (
    id, correo, clave_hash, correo_confirmado, politica_aceptada_en, politica_version, creada_en
  ) values (
    p_id, p_correo, p_clave_hash, false, p_politica_aceptada_en, p_politica_version, p_creada_en
  )
  on conflict (correo) do nothing;

  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    return false;
  end if;

  insert into confirmaciones_correo (id, cuenta_id, token_hash, expira_en, creada_en)
  values (p_confirmacion_id, p_id, p_token_hash, p_expira_en, p_creada_en);
  return true;
end;
$$;

-- Pide un enlace nuevo para el correo: si la cuenta existe y no está confirmada, anula los enlaces vigentes y guarda el
-- nuevo, y devuelve true. Si no existe o ya está confirmada, no cambia nada y devuelve false. Una sola llamada en los
-- dos casos, por lo mismo que al crear la cuenta. Dos peticiones a la vez para la misma cuenta van una detrás de otra
-- (bloqueo de la fila de la cuenta): al final queda un solo enlace vigente.
create or replace function renovar_confirmacion(
  p_correo text,
  p_confirmacion_id uuid,
  p_token_hash text,
  p_expira_en timestamptz,
  p_ahora timestamptz
) returns boolean
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_cuenta_id uuid;
begin
  select id into v_cuenta_id
    from cuentas
   where correo = p_correo
     and not correo_confirmado
   for update;

  if v_cuenta_id is null then
    return false;
  end if;

  update confirmaciones_correo
     set anulada_en = p_ahora
   where cuenta_id = v_cuenta_id
     and usada_en is null
     and anulada_en is null;

  insert into confirmaciones_correo (id, cuenta_id, token_hash, expira_en, creada_en)
  values (p_confirmacion_id, v_cuenta_id, p_token_hash, p_expira_en, p_ahora);
  return true;
end;
$$;

-- Usa el enlace: si existe, no se usó, no se anuló y no caducó, lo marca usado y confirma el correo de su cuenta.
-- Devuelve el correo confirmado, o null si el enlace no vale (sin decir por qué). Dos clics a la vez: el segundo espera
-- el bloqueo de la fila, ve que ya está usado y recibe null.
create or replace function confirmar_correo(p_token_hash text, p_ahora timestamptz) returns text
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_cuenta_id uuid;
  v_correo text;
begin
  update confirmaciones_correo
     set usada_en = p_ahora
   where token_hash = p_token_hash
     and usada_en is null
     and anulada_en is null
     and expira_en > p_ahora
  returning cuenta_id into v_cuenta_id;

  if v_cuenta_id is null then
    return null;
  end if;

  update cuentas
     set correo_confirmado = true
   where id = v_cuenta_id
  returning correo into v_correo;
  return v_correo;
end;
$$;

-- Solo el backend (service_role) puede llamarlas por la API REST de Supabase
revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz) from public;
revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz) from public;
revoke all on function confirmar_correo(text, timestamptz) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table confirmaciones_correo from anon;
    revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz) from anon;
    revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz) from anon;
    revoke all on function confirmar_correo(text, timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table confirmaciones_correo from authenticated;
    revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz) from authenticated;
    revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz) from authenticated;
    revoke all on function confirmar_correo(text, timestamptz) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on table confirmaciones_correo to service_role;
    grant execute on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz) to service_role;
    grant execute on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz) to service_role;
    grant execute on function confirmar_correo(text, timestamptz) to service_role;
  end if;
end;
$$;
