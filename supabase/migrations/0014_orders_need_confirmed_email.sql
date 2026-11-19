-- ===========================================================================
-- 0014 · Every order has a confirmed email
--
-- Customers can still order without signing up, but they confirm their email
-- with a 6-digit code first. Confirming the code signs them in with a
-- password-free account (Supabase email OTP), so:
--   * every order is tied to a real, confirmed address (no fake orders),
--   * the customer can come back later, log in with just a code and track it.
--
-- How: the original function from 0008 becomes place_order_core (internal,
-- not callable from the API), and place_order is now a small gate in front of
-- it that
--   1. requires a signed-in user whose email is confirmed,
--   2. records that confirmed email on the order (ignoring any typed one),
--   3. remembers name, phone and address on the profile for next time
--      (only fields that are still empty; never overwrites).
-- Admins logging a WhatsApp/phone order keep the old behaviour (any email).
-- ===========================================================================

alter function public.place_order(jsonb) rename to place_order_core;
revoke all on function public.place_order_core(jsonb) from public, anon, authenticated;
grant execute on function public.place_order_core(jsonb) to service_role;

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
  v_result     jsonb;
begin
  if v_uid is null then
    raise exception 'EMAIL_NOT_CONFIRMED';
  end if;

  if v_admin then
    -- An admin logging someone else's order: their details come from p_order
    return public.place_order_core(p_order);
  end if;

  select u.email, u.email_confirmed_at into v_email, v_confirmed
  from auth.users u where u.id = v_uid;
  if v_email is null or v_confirmed is null then
    raise exception 'EMAIL_NOT_CONFIRMED';
  end if;

  v_result := public.place_order_core(p_order || jsonb_build_object('email', v_email));

  -- Remember the details for next time (only what's still empty)
  update public.profiles p set
    full_name = coalesce(nullif(p.full_name, ''), nullif(left(trim(coalesce(p_order ->> 'name', '')), 120), '')),
    phone     = coalesce(nullif(p.phone, ''), nullif(left(trim(coalesce(p_order ->> 'phone', '')), 30), '')),
    city      = coalesce(nullif(p.city, ''), nullif(left(trim(coalesce(p_order ->> 'city', '')), 120), '')),
    street    = coalesce(nullif(p.street, ''), nullif(left(trim(coalesce(p_order ->> 'street', '')), 200), '')),
    apartment = coalesce(nullif(p.apartment, ''), nullif(left(trim(coalesce(p_order ->> 'apartment', '')), 120), '')),
    default_zone_id = coalesce(p.default_zone_id, p_order ->> 'zone_id')
  where p.id = v_uid;

  return v_result;
end;
$$;

revoke all on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated, service_role;
