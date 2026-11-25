-- 0002: sesiones (token de renovación).
-- El token de renovación es opaco; aquí solo se guarda su hash, nunca el token.
-- Spec: contrato/autenticacion.md, secciones 3 y 7.

create table sesiones (
  id uuid not null,
  cuenta_id uuid not null,
  token_hash text not null,
  expira_en timestamptz not null,
  creada_en timestamptz not null,
  revocada_en timestamptz,
  constraint sesiones_pkey primary key (id),
  constraint sesiones_token_hash_key unique (token_hash),
  constraint sesiones_cuenta_id_fkey foreign key (cuenta_id) references cuentas (id) on delete cascade
);

create index sesiones_cuenta_id_idx on sesiones (cuenta_id);

alter table sesiones enable row level security;
revoke all on table sesiones from public;

-- Rota la sesión: revoca la anterior y guarda la nueva en un solo paso atómico.
-- Devuelve false, sin cambiar nada, si la anterior ya estaba revocada (un token usado dos veces).
-- Si dos peticiones llegan a la vez con el mismo token, la segunda espera el bloqueo de la fila, ve que ya está
-- revocada y recibe false.
create or replace function rotar_sesion(
  p_anterior_id uuid,
  p_nueva_id uuid,
  p_cuenta_id uuid,
  p_token_hash text,
  p_expira_en timestamptz,
  p_creada_en timestamptz
) returns boolean
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_filas integer;
begin
  update sesiones
     set revocada_en = now()
   where id = p_anterior_id
     and revocada_en is null;

  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    return false;
  end if;

  insert into sesiones (id, cuenta_id, token_hash, expira_en, creada_en)
  values (p_nueva_id, p_cuenta_id, p_token_hash, p_expira_en, p_creada_en);
  return true;
end;
$$;

create or replace function revocar_sesion(p_sesion_id uuid) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones set revocada_en = now() where id = p_sesion_id and revocada_en is null;
$$;

create or replace function revocar_sesiones_de_cuenta(p_cuenta_id uuid) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones set revocada_en = now() where cuenta_id = p_cuenta_id and revocada_en is null;
$$;

revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from public;
revoke all on function revocar_sesion(uuid) from public;
revoke all on function revocar_sesiones_de_cuenta(uuid) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table sesiones from anon;
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from anon;
    revoke all on function revocar_sesion(uuid) from anon;
    revoke all on function revocar_sesiones_de_cuenta(uuid) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table sesiones from authenticated;
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from authenticated;
    revoke all on function revocar_sesion(uuid) from authenticated;
    revoke all on function revocar_sesiones_de_cuenta(uuid) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on table sesiones to service_role;
    grant execute on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) to service_role;
    grant execute on function revocar_sesion(uuid) to service_role;
    grant execute on function revocar_sesiones_de_cuenta(uuid) to service_role;
  end if;
end;
$$;
