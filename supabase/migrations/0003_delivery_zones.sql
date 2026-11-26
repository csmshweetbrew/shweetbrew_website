-- ===========================================================================
-- 0003 · Delivery zones
--
-- Mirrors client/src/config/deliveryZones.ts (seeded from it). The database
-- keeps the fee and the minimum order so totals are worked out here, never
-- trusted from the browser. Delivery days and towns stay in the website code.
-- When a fee or minimum changes, change it in both places.
-- ===========================================================================

create table public.delivery_zones (
  id          text primary key,
  name_en     text not null,
  name_he     text,
  fee         numeric(10, 2) check (fee is null or fee >= 0), -- null = price by arrangement
  min_order   numeric(10, 2) not null default 0 check (min_order >= 0),
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.delivery_zones is 'Delivery areas with their fee and minimum order. Delivery days and towns stay in the website code.';
comment on column public.delivery_zones.fee is 'Delivery fee in NIS. NULL means "by arrangement".';

create trigger delivery_zones_updated_at before update on public.delivery_zones
  for each row execute function public.set_updated_at();

-- A customer's saved delivery area
alter table public.profiles
  add constraint profiles_default_zone_id_fkey
  foreign key (default_zone_id) references public.delivery_zones (id) on update cascade on delete set null;

-- ---------------------------------------------------------------------------
-- Security: everyone reads, admins write
-- ---------------------------------------------------------------------------
alter table public.delivery_zones enable row level security;

create policy "Zones are public" on public.delivery_zones for select to anon, authenticated using (true);
create policy "Admins manage zones" on public.delivery_zones for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke insert, update, delete on public.delivery_zones from anon;
