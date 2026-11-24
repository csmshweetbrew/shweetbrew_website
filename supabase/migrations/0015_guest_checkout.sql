-- ===========================================================================
-- 0015 · Order as a guest (no code, no account)
--
-- Owner's decision (2026-11-24): ordering as a guest is the default. A guest
-- gives name + phone (+ address); email is optional and not confirmed. The
-- owner calls or messages every customer to confirm the order anyway.
-- Logging in stays available (it fills in saved details).
--
-- place_order is still the only way to create an order. It now accepts:
--   * signed in with a confirmed email: as in 0014 (the confirmed email goes
--     on the order, empty profile fields are filled in);
--   * anyone else (guest): the typed email, if any, goes on the order.
-- Admins logging a WhatsApp/phone order: unchanged.
--
-- Spam guards: the 0008 limit (5 orders per phone in 10 minutes) still
-- applies, plus at most 10 guest orders per visitor (IP) per hour.
-- ===========================================================================

create table if not exists public.guest_order_log (
  id          bigint generated always as identity primary key,
  ip          text,
  created_at  timestamptz not null default now()
);
create index if not exists guest_order_log_ip_idx on public.guest_order_log (ip, created_at);

-- Internal: only place_order touches it
alter table public.guest_order_log enable row level security;
revoke all on public.guest_order_log from anon, authenticated;

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

  -- Guest: typed email (optional, checked by place_order_core), per-visitor limit
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
