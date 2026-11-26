-- ===========================================================================
-- 0023 · The phone number is required for website orders (2026-11-26)
--
-- The site has required it since 2026-11-26; now the database does too, so an
-- order sent straight to the API without a phone is refused with
-- INVALID_INPUT:phone. place_order is 0021's, with only that check added.
-- Orders an admin logs (WhatsApp, phone) still go straight to
-- place_order_core, where the phone stays optional. Old orders are untouched.
-- Safe to run more than once.
-- ===========================================================================

create or replace function public.place_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := auth.uid();
  v_admin      boolean := public.is_admin();
  v_email      text;
  v_confirmed  timestamptz;
  v_headers    json;
  v_ip         text;
  v_count      integer;
  v_result     jsonb;
begin
  if v_admin then
    -- An admin logging someone else's order: their details come from p_order
    return public.place_order_core(p_order);
  end if;

  -- Website orders need a phone (2026-11-26); its format is checked by place_order_core.
  -- Admins logging a WhatsApp or phone order (above) are not affected.
  if nullif(trim(coalesce(p_order ->> 'phone', '')), '') is null then
    raise exception 'INVALID_INPUT:phone';
  end if;

  if v_uid is not null then
    select u.email, u.email_confirmed_at into v_email, v_confirmed
    from auth.users u where u.id = v_uid;
  end if;

  -- Signed in with a confirmed email: as before (0014)
  if v_email is not null and v_confirmed is not null then
    v_result := public.place_order_core(p_order || jsonb_build_object('email', v_email));

    update public.profiles p set
      full_name = coalesce(nullif(p.full_name, ''), nullif(left(trim(coalesce(p_order ->> 'name', '')), 120), '')),
      phone     = coalesce(nullif(p.phone, ''), nullif(left(trim(coalesce(p_order ->> 'phone', '')), 30), '')),
      city      = coalesce(nullif(p.city, ''), nullif(left(trim(coalesce(p_order ->> 'city', '')), 120), '')),
      street    = coalesce(nullif(p.street, ''), nullif(left(trim(coalesce(p_order ->> 'street', '')), 200), '')),
      apartment = coalesce(nullif(p.apartment, ''), nullif(left(trim(coalesce(p_order ->> 'apartment', '')), 120), '')),
      default_zone_id = coalesce(p.default_zone_id, p_order ->> 'zone_id')
    where p.id = v_uid;

    return v_result;
  end if;

  -- Guest: an email is required (its format is checked by place_order_core)
  if nullif(trim(coalesce(p_order ->> 'email', '')), '') is null then
    raise exception 'INVALID_INPUT:email';
  end if;

  -- The visitor's address: the one Supabase's edge saw, not one the visitor wrote
  begin
    v_headers := current_setting('request.headers', true)::json;
    v_ip := coalesce(
      nullif(trim(v_headers ->> 'cf-connecting-ip'), ''),
      nullif(trim(split_part(v_headers ->> 'x-forwarded-for', ',', 1)), '')
    );
  exception when others then
    v_ip := null;
  end;

  delete from public.guest_order_log where created_at < now() - interval '1 day';
  -- Per visitor: 10 an hour (0015)
  if v_ip is not null then
    select count(*) into v_count from public.guest_order_log
    where ip = v_ip and created_at > now() - interval '1 hour';
    if v_count >= 10 then raise exception 'TOO_MANY_ORDERS'; end if;
  end if;
  -- Everybody together: 60 an hour, far above a real busy hour
  select count(*) into v_count from public.guest_order_log where created_at > now() - interval '1 hour';
  if v_count >= 60 then raise exception 'TOO_MANY_ORDERS'; end if;

  v_result := public.place_order_core(p_order);
  insert into public.guest_order_log (ip) values (v_ip);
  return v_result;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated, service_role;
