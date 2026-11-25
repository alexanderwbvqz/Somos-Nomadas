-- 0003: contador de intentos (límite de registro y de inicio de sesión).
-- `huella` es un HMAC de la IP o del correo, nunca el valor en claro.
-- Spec: contrato/autenticacion.md, sección 8.

create table intentos_acceso (
  id bigint generated always as identity primary key,
  accion text not null check (accion in ('registro', 'sesion')),
  huella text not null,
  ocurrido_en timestamptz not null
);

create index intentos_acceso_clave_idx on intentos_acceso (accion, huella, ocurrido_en);

alter table intentos_acceso enable row level security;
revoke all on table intentos_acceso from public;

-- Cuenta un intento de forma atómica. Devuelve null si está permitido, o los segundos que faltan para poder
-- reintentar si ya se superó el máximo dentro de la ventana. Misma regla que MemoriaLimitadorIntentos.
create or replace function consumir_intento(
  p_accion text,
  p_huella text,
  p_maximo integer,
  p_ventana_segundos integer,
  p_ahora timestamptz
) returns integer
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_ventana interval := make_interval(secs => p_ventana_segundos);
  v_cuenta integer;
  v_mas_antiguo timestamptz;
begin
  -- Un bloqueo por (acción, huella): dos intentos simultáneos de la misma clave no se cuentan a la vez
  perform pg_advisory_xact_lock(hashtextextended(p_accion || ':' || p_huella, 0));

  -- Lo que ya salió de la ventana se borra
  delete from intentos_acceso
   where accion = p_accion
     and huella = p_huella
     and ocurrido_en <= p_ahora - v_ventana;

  select count(*), min(ocurrido_en)
    into v_cuenta, v_mas_antiguo
    from intentos_acceso
   where accion = p_accion
     and huella = p_huella;

  if v_cuenta >= p_maximo then
    return greatest(1, ceil(extract(epoch from (v_mas_antiguo + v_ventana - p_ahora)))::integer);
  end if;

  insert into intentos_acceso (accion, huella, ocurrido_en) values (p_accion, p_huella, p_ahora);
  return null;
end;
$$;

revoke all on function consumir_intento(text, text, integer, integer, timestamptz) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table intentos_acceso from anon;
    revoke all on function consumir_intento(text, text, integer, integer, timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table intentos_acceso from authenticated;
    revoke all on function consumir_intento(text, text, integer, integer, timestamptz) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant all on table intentos_acceso to service_role;
    grant execute on function consumir_intento(text, text, integer, integer, timestamptz) to service_role;
  end if;
end;
$$;
