-- ===========================================================================
-- 0013 · "Does this email have an account?"
--
-- The login popup asks for an email first, then either a password (returning
-- customer) or a name and new password (new customer), so there's no
-- "Sign in / Sign up" choice to make. This function answers that one
-- question and nothing else: no name, no details about the account.
--
-- Anyone could use it to test whether an address is registered (Airbnb and
-- most shops accept the same), so it's rate-limited: 10 checks per address
-- per hour and 30 per visitor (IP) per 10 minutes.
-- ===========================================================================

create table public.auth_email_checks (
  id          bigint generated always as identity primary key,
  email_hash  text not null,           -- md5 of the lowercased address, never the address itself
  ip          text,
  created_at  timestamptz not null default now()
);
create index auth_email_checks_email_idx on public.auth_email_checks (email_hash, created_at);
create index auth_email_checks_ip_idx on public.auth_email_checks (ip, created_at);

-- Internal: no API role may read or write it (only the function below)
alter table public.auth_email_checks enable row level security;
revoke all on public.auth_email_checks from anon, authenticated;

create or replace function public.email_has_account(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hash  text := md5(lower(trim(coalesce(p_email, ''))));
  v_ip    text;
  v_count integer;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'INVALID_INPUT:email';
  end if;

  -- The visitor's address as Supabase's gateway passes it on (first hop)
  begin
    v_ip := nullif(trim(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  -- Keep the log small
  delete from public.auth_email_checks where created_at < now() - interval '1 day';

  select count(*) into v_count from public.auth_email_checks
  where email_hash = v_hash and created_at > now() - interval '1 hour';
  if v_count >= 10 then raise exception 'TOO_MANY_TRIES'; end if;

  if v_ip is not null then
    select count(*) into v_count from public.auth_email_checks
    where ip = v_ip and created_at > now() - interval '10 minutes';
    if v_count >= 30 then raise exception 'TOO_MANY_TRIES'; end if;
  end if;

  insert into public.auth_email_checks (email_hash, ip) values (v_hash, v_ip);

  return exists (select 1 from auth.users where lower(email) = v_email);
end;
$$;

revoke all on function public.email_has_account(text) from public;
grant execute on function public.email_has_account(text) to anon, authenticated, service_role;
