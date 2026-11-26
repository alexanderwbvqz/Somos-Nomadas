-- 0008: el enlace de confirmación recuerda en qué navegador se pidió.
-- Al registrarse o pedir otro enlace, la web guarda en el navegador una marca aleatoria (cookie httpOnly); aquí se
-- guarda solo su huella (hash). Si el enlace se abre en ese mismo navegador, la aplicación abre la sesión además de
-- confirmar el correo. La comparación la hace la aplicación: esta migración solo guarda y devuelve la huella.
-- Los enlaces de antes quedan sin huella (null): confirman el correo pero nunca abren sesión.
-- Todas las fechas siguen viniendo de la aplicación (regla de la migración 0005).
-- Spec: contrato/confirmacion-correo.md.

alter table confirmaciones_correo add column navegador_hash text;

-- Las funciones cambian de firma: se borran las de la 0007 para que no queden dos versiones con el mismo nombre
drop function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz);
drop function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz);
drop function confirmar_correo(text, timestamptz);

-- Igual que en la 0007, más la huella del navegador que pide el enlace (null si no llegó marca)
create function crear_cuenta_con_confirmacion(
  p_id uuid,
  p_correo text,
  p_clave_hash text,
  p_politica_aceptada_en timestamptz,
  p_politica_version text,
  p_creada_en timestamptz,
  p_confirmacion_id uuid,
  p_token_hash text,
  p_expira_en timestamptz,
  p_navegador_hash text
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

  insert into confirmaciones_correo (id, cuenta_id, token_hash, expira_en, creada_en, navegador_hash)
  values (p_confirmacion_id, p_id, p_token_hash, p_expira_en, p_creada_en, p_navegador_hash);
  return true;
end;
$$;

-- Igual que en la 0007; el enlace nuevo queda atado al navegador que lo pide, no al del registro
create function renovar_confirmacion(
  p_correo text,
  p_confirmacion_id uuid,
  p_token_hash text,
  p_expira_en timestamptz,
  p_ahora timestamptz,
  p_navegador_hash text
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

  insert into confirmaciones_correo (id, cuenta_id, token_hash, expira_en, creada_en, navegador_hash)
  values (p_confirmacion_id, v_cuenta_id, p_token_hash, p_expira_en, p_ahora, p_navegador_hash);
  return true;
end;
$$;

-- Igual que en la 0007, pero devuelve también la cuenta y la huella del navegador, para que la aplicación decida si
-- abre la sesión: {"cuenta_id", "correo", "navegador_hash"}, o null si el enlace no vale (sin decir por qué).
create function confirmar_correo(p_token_hash text, p_ahora timestamptz) returns jsonb
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_cuenta_id uuid;
  v_navegador_hash text;
  v_correo text;
begin
  update confirmaciones_correo
     set usada_en = p_ahora
   where token_hash = p_token_hash
     and usada_en is null
     and anulada_en is null
     and expira_en > p_ahora
  returning cuenta_id, navegador_hash into v_cuenta_id, v_navegador_hash;

  if v_cuenta_id is null then
    return null;
  end if;

  update cuentas
     set correo_confirmado = true
   where id = v_cuenta_id
  returning correo into v_correo;
  return jsonb_build_object('cuenta_id', v_cuenta_id, 'correo', v_correo, 'navegador_hash', v_navegador_hash);
end;
$$;

-- Solo el backend (service_role) puede llamarlas por la API REST de Supabase
revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz, text) from public;
revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz, text) from public;
revoke all on function confirmar_correo(text, timestamptz) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz, text) from anon;
    revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz, text) from anon;
    revoke all on function confirmar_correo(text, timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz, text) from authenticated;
    revoke all on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz, text) from authenticated;
    revoke all on function confirmar_correo(text, timestamptz) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function crear_cuenta_con_confirmacion(uuid, text, text, timestamptz, text, timestamptz, uuid, text, timestamptz, text) to service_role;
    grant execute on function renovar_confirmacion(text, uuid, text, timestamptz, timestamptz, text) to service_role;
    grant execute on function confirmar_correo(text, timestamptz) to service_role;
  end if;
end;
$$;
