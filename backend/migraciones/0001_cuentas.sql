-- 0001: cuentas de acceso (correo y contraseña).
-- Una cuenta es solo identidad; el nombre, el país y lo demás son del perfil (otra migración).
-- Spec: contrato/autenticacion.md, sección 3.

create table cuentas (
  id uuid not null,
  correo text not null,
  -- argon2id. La clave nunca se guarda tal cual
  clave_hash text not null,
  correo_confirmado boolean not null default false,
  -- Prueba del consentimiento
  politica_aceptada_en timestamptz not null,
  politica_version text not null,
  creada_en timestamptz not null,
  constraint cuentas_pkey primary key (id),
  constraint cuentas_correo_key unique (correo),
  -- El backend siempre lo guarda recortado y en minúsculas; la base lo exige para que el único no se pueda esquivar
  constraint cuentas_correo_check check (correo = lower(btrim(correo)) and char_length(correo) between 3 and 120)
);

-- RLS activado y SIN políticas: nadie entra salvo el backend, con la clave de servidor (service_role se salta RLS)
alter table cuentas enable row level security;
revoke all on table cuentas from public;

-- Crea la cuenta de forma atómica. Devuelve false, sin cambiar nada, si el correo ya tenía cuenta.
create or replace function crear_cuenta(
  p_id uuid,
  p_correo text,
  p_clave_hash text,
  p_correo_confirmado boolean,
  p_politica_aceptada_en timestamptz,
  p_politica_version text,
  p_creada_en timestamptz
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
    p_id, p_correo, p_clave_hash, p_correo_confirmado, p_politica_aceptada_en, p_politica_version, p_creada_en
  )
  on conflict (correo) do nothing;

  get diagnostics v_filas = row_count;
  return v_filas = 1;
end;
$$;

-- Busca por correo con POST en vez de con un filtro en la URL: así el correo no queda en los logs de las peticiones.
create or replace function obtener_cuenta_por_correo(p_correo text) returns setof cuentas
language sql
stable
set search_path = public, pg_temp
as $$
  select * from cuentas where correo = p_correo limit 1;
$$;

-- Las funciones se pueden llamar por la API REST de Supabase: solo el backend (service_role) debe poder.
revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from public;
revoke all on function obtener_cuenta_por_correo(text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table cuentas from anon;
    revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from anon;
    revoke all on function obtener_cuenta_por_correo(text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table cuentas from authenticated;
    revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from authenticated;
    revoke all on function obtener_cuenta_por_correo(text) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on table cuentas to service_role;
    grant execute on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) to service_role;
    grant execute on function obtener_cuenta_por_correo(text) to service_role;
  end if;
end;
$$;
