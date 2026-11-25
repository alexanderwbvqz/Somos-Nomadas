-- 0001: cuentas de acceso (correo y contraseña).
-- Una cuenta es solo identidad; el nombre, el país y lo demás son del perfil (otra migración).
-- Spec: contrato/autenticacion.md, sección 3.

create table cuentas (
  id uuid primary key,
  -- El backend siempre lo guarda recortado y en minúsculas; la base lo exige para que el único no se pueda esquivar
  correo text not null unique
    check (correo = lower(btrim(correo)) and char_length(correo) between 3 and 120),
  -- argon2id. La clave nunca se guarda tal cual
  clave_hash text not null,
  correo_confirmado boolean not null default false,
  -- Prueba del consentimiento
  politica_aceptada_en timestamptz not null,
  politica_version text not null,
  creada_en timestamptz not null
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

-- Las funciones se pueden llamar por la API REST de Supabase: solo el backend (service_role) debe poder.
revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table cuentas from anon;
    revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table cuentas from authenticated;
    revoke all on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on table cuentas to service_role;
    grant execute on function crear_cuenta(uuid, text, text, boolean, timestamptz, text, timestamptz) to service_role;
  end if;
end;
$$;
