-- 0006: cambiar el hash de la clave de una cuenta solo si sigue siendo el que se verificó.
-- Sirve para volver a hashear la clave con los parámetros actuales cuando una persona inicia sesión (es el único
-- momento en que se tiene en claro) sin pisar un cambio de clave que ocurra en medio: la comparación y el cambio se
-- hacen en un solo paso. Es una función (POST con cuerpo) y no un filtro en la URL: así el hash anterior no queda en
-- los logs de las peticiones.
-- Spec: contrato/autenticacion.md, sección 13.

create or replace function actualizar_clave_hash(
  p_cuenta_id uuid,
  p_clave_hash_anterior text,
  p_clave_hash_nuevo text
) returns boolean
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_filas integer;
begin
  update cuentas
     set clave_hash = p_clave_hash_nuevo
   where id = p_cuenta_id
     and clave_hash = p_clave_hash_anterior;

  get diagnostics v_filas = row_count;
  return v_filas = 1;
end;
$$;

-- Como las demás: solo el backend (service_role) puede llamarla por la API REST de Supabase.
revoke all on function actualizar_clave_hash(uuid, text, text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function actualizar_clave_hash(uuid, text, text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function actualizar_clave_hash(uuid, text, text) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function actualizar_clave_hash(uuid, text, text) to service_role;
  end if;
end;
$$;
