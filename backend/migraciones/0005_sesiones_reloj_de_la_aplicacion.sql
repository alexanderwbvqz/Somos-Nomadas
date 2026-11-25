-- 0005: la fecha de revocación de una sesión la pone la aplicación, no el reloj de la base.
-- Hasta ahora las revocaciones usaban now() de la base, mientras que creada_en y expira_en salen del reloj de la
-- aplicación. La tolerancia para reusar un token rotado compara ambos relojes, y unos segundos de diferencia entre
-- ellos la acortan o la alargan (con la base de Supabase ~2,6 s adelantada, una prueba falló de forma intermitente).
-- Ahora todas las fechas salen del mismo reloj.
-- Spec: contrato/autenticacion.md, sección 7.

-- Rota la sesión: revoca la anterior (motivo rotada) en el instante en que nace la nueva (p_creada_en, la hora de la
-- aplicación) y guarda la nueva, en un solo paso atómico. Mismo contrato que antes: devuelve false, sin cambiar nada,
-- si la anterior ya estaba revocada.
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
     set revocada_en = p_creada_en,
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

-- Estas dos cambian de firma: reciben la hora de la aplicación
drop function revocar_sesion(uuid);
drop function revocar_sesiones_de_cuenta(uuid, text);

-- Cierra la sesión (motivo cerrada). Si ya estaba revocada no cambia nada: se conserva la fecha y el motivo originales.
create function revocar_sesion(p_sesion_id uuid, p_ahora timestamptz) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones
     set revocada_en = p_ahora,
         motivo_revocacion = 'cerrada'
   where id = p_sesion_id
     and revocada_en is null;
$$;

-- Revoca las sesiones de una cuenta que sigan abiertas, con el motivo indicado.
create function revocar_sesiones_de_cuenta(p_cuenta_id uuid, p_motivo text, p_ahora timestamptz) returns void
language sql
set search_path = public, pg_temp
as $$
  update sesiones
     set revocada_en = p_ahora,
         motivo_revocacion = p_motivo
   where cuenta_id = p_cuenta_id
     and revocada_en is null;
$$;

-- Los permisos se vuelven a fijar: las funciones nuevas los necesitan, y así queda todo igual de cerrado que antes
revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from public;
revoke all on function revocar_sesion(uuid, timestamptz) from public;
revoke all on function revocar_sesiones_de_cuenta(uuid, text, timestamptz) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from anon;
    revoke all on function revocar_sesion(uuid, timestamptz) from anon;
    revoke all on function revocar_sesiones_de_cuenta(uuid, text, timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) from authenticated;
    revoke all on function revocar_sesion(uuid, timestamptz) from authenticated;
    revoke all on function revocar_sesiones_de_cuenta(uuid, text, timestamptz) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function rotar_sesion(uuid, uuid, uuid, text, timestamptz, timestamptz) to service_role;
    grant execute on function revocar_sesion(uuid, timestamptz) to service_role;
    grant execute on function revocar_sesiones_de_cuenta(uuid, text, timestamptz) to service_role;
  end if;
end;
$$;
