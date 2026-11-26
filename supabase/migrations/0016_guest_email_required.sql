-- ===========================================================================
-- 0016 · Guests must give an email
--
-- Owner's decision (2026-11-24): every order gets a confirmation email, so a
-- guest must type an email (not confirmed with a code; the site suggests
-- fixes for typos like "gamil.com"). Same function as 0015 with one extra
-- check in the guest branch: no email -> INVALID_INPUT:email.
-- Signed-in customers and admins: unchanged.
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
  v_ip         text;
  v_count      integer;
  v_result     jsonb;
begin
  if v_admin then
    -- An admin logging someone else's order: their details come from p_order
    return public.place_order_core(p_order);
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

  -- Per-visitor limit (0015)
  begin
    v_ip := nullif(trim(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  delete from public.guest_order_log where created_at < now() - interval '1 day';
  if v_ip is not null then
    select count(*) into v_count from public.guest_order_log
    where ip = v_ip and created_at > now() - interval '1 hour';
    if v_count >= 10 then raise exception 'TOO_MANY_ORDERS'; end if;
  end if;

  v_result := public.place_order_core(p_order);
  insert into public.guest_order_log (ip) values (v_ip);
  return v_result;
end;
$$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated, service_role;
