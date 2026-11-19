-- ===========================================================================
-- 0004 · Catalogue: categories → products → sizes
--
-- Matches client/src/config/products.ts: a "product" here is one flavour
-- (the site's variant, e.g. 'biltong-traditional'); each has pack sizes with
-- their own price and stock. The website reads this live and the admin app
-- edits it.
-- ===========================================================================

create table public.categories (
  id              text primary key,             -- e.g. 'biltong', 'HOLY LAND JERKY' (matches products.ts)
  name_en         text not null,
  name_he         text,
  description_en  text,
  description_he  text,
  image           text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id                  text primary key,         -- variant id, e.g. 'biltong-traditional'
  category_id         text not null references public.categories (id) on update cascade on delete restrict,
  name_en             text not null,
  name_he             text,
  description_en      text,
  description_he      text,
  tagline_en          text,
  tagline_he          text,
  image               text,                     -- '/images/x-720.webp' or a product-images storage URL
  spice_level         smallint not null default 0 check (spice_level between 0 and 5),
  is_kosher           boolean not null default false,
  is_available        boolean not null default true,
  unavailable_reason  text,
  nutrition           jsonb,                    -- { protein, fat, carbs, calories } per 100g
  ingredients_en      text,
  ingredients_he      text,
  allergens_en        text,
  allergens_he        text,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index products_category_idx on public.products (category_id, sort_order);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_sizes (
  id                   uuid primary key default gen_random_uuid(),
  product_id           text not null references public.products (id) on update cascade on delete cascade,
  label                text not null,           -- what the site shows and orders use: '100g', '500ml'
  weight               text,
  price                numeric(10, 2) not null check (price >= 0),
  stock                integer check (stock is null or stock >= 0), -- packs on hand; NULL = not tracked
  low_stock_threshold  integer not null default 5 check (low_stock_threshold >= 0),
  is_active            boolean not null default true,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (product_id, label)
);
comment on column public.product_sizes.stock is 'Packs on hand. NULL = stock not tracked for this size (never sells out).';
create index product_sizes_product_idx on public.product_sizes (product_id, sort_order);

create trigger product_sizes_updated_at before update on public.product_sizes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Security: everyone reads, admins write
-- ---------------------------------------------------------------------------
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.product_sizes enable row level security;

create policy "Catalogue is public" on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Catalogue is public" on public.products for select to anon, authenticated using (true);
create policy "Admins manage products" on public.products for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Catalogue is public" on public.product_sizes for select to anon, authenticated using (true);
create policy "Admins manage sizes" on public.product_sizes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke insert, update, delete on public.categories, public.products, public.product_sizes from anon;
