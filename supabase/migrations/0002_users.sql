-- ===========================================================================
-- 0002 · Users
--
-- One profile per signed-up user (auth.users), created automatically on signup.
-- role = 'admin' unlocks the admin apps. The first admin is set by hand in the
-- SQL editor:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- After that, admins use admin_set_role().
-- ===========================================================================

create type public.app_role as enum ('customer', 'admin');

create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  full_name           text,
  phone               text,
  role                public.app_role not null default 'customer',
  preferred_language  text not null default 'en' check (preferred_language in ('en', 'he')),
  default_zone_id     text,               -- foreign key added in 0003_delivery_zones
  city                text,
  street              text,
  apartment           text,
  marketing_opt_in    boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.profiles is 'One row per signed-up user (auth.users). role = admin unlocks the admin apps.';

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- True when the signed-in user is an admin. SECURITY DEFINER so policies on
-- profiles can call it without recursing into their own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Create a profile automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, preferred_language)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), ''),
    coalesce(nullif(new.phone, ''), nullif(new.raw_user_meta_data ->> 'phone', '')),
    case when new.raw_user_meta_data ->> 'language' = 'he' then 'he' else 'en' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Make someone an admin (or take it away). Admins can't demote themselves, so
-- there is always at least the one doing it.
create or replace function public.admin_set_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN' using errcode = '42501'; end if;
  if p_user_id = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'INVALID_INPUT:cannot_remove_own_admin';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
  if not found then raise exception 'INVALID_INPUT:user_id'; end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- You see and edit yourself; admins see everyone
create policy "Read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Only these columns can be changed from the browser (never role or email)
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, phone, preferred_language, default_zone_id, city, street, apartment, marketing_opt_in)
  on public.profiles to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.admin_set_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.app_role) to authenticated;
