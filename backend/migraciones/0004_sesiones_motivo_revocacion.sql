-- 0004: motivo de la revocación de una sesión.
-- Antes un token ya revocado se tomaba siempre por robo. Ahora se guarda por qué se revocó la sesión (rotada,
-- cerrada o robo): solo presentar un token rotado puede ser un robo; uno cerrado por la persona no.
-- Spec: contrato/autenticacion.md, sección 7.

alter table sesiones add column motivo_revocacion text;

-- Las sesiones revocadas antes de esta migración no tienen motivo conocido. Se marcan como cerradas, que es lo más
-- prudente: no cuentan como un robo.
update sesiones set motivo_revocacion = 'cerrada' where revocada_en is not null;

alter table sesiones
  add constraint sesiones_motivo_revocacion_check
    check (motivo_revocacion in ('rotada', 'cerrada', 'robo')),
  -- Una sesión tiene motivo si y solo si está revocada
  add constraint sesiones_revocada_en_motivo_revocacion_check
    check ((revocada_en is null) = (motivo_revocacion is null));

-- Rota la sesión: revoca la anterior (motivo rotada) y guarda la nueva en un solo paso atómico.
-- Devuelve false, sin cambiar nada, si la anterior ya estaba revocada. Si dos peticiones llegan a la vez con el mismo
-- token, la segunda espera el bloqueo de la fila, ve que ya está revocada y recibe false.
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
     set revocada_en = now(),
         motivo_revocacion = 'rotada'
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

-- Cierra la sesión (motivo cerrada). Si ya estaba revocada no cambia nada: se conserva la fecha y el motivo originales.
create or replace function revocar_sesion(p_sesion_id uuid) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones
     set revocada_en = now(),
         motivo_revocacion = 'cerrada'
   where id = p_sesion_id
     and revocada_en is null;
$$;

-- Revoca las sesiones de una cuenta que sigan abiertas, con el motivo indicado. Cambia la firma: ahora lleva el motivo.
drop function revocar_sesiones_de_cuenta(uuid);

create function revocar_sesiones_de_cuenta(p_cuenta_id uuid, p_motivo text) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones
     set revocada_en = now(),
         motivo_revocacion = p_motivo
   where cuenta_id = p_cuenta_id
     and revocada_en is null;
$$;

-- Los permisos se vuelven a fijar: la función nueva los necesita y así queda todo igual de cerrado que antes
revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from public;
revoke all on function revocar_sesion(uuid) from public;
revoke all on function revocar_sesiones_de_cuenta(uuid, text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from anon;
    revoke all on function revocar_sesion(uuid) from anon;
    revoke all on function revocar_sesiones_de_cuenta(uuid, text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from authenticated;
    revoke all on function revocar_sesion(uuid) from authenticated;
    revoke all on function revocar_sesiones_de_cuenta(uuid, text) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) to service_role;
    grant execute on function revocar_sesion(uuid) to service_role;
    grant execute on function revocar_sesiones_de_cuenta(uuid, text) to service_role;
  end if;
end;
$$;
