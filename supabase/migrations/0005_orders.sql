-- ===========================================================================
-- 0005 · Orders
--
-- orders + order_items (name and price snapshots, so old orders still read
-- right after the menu changes) + order_status_history (filled by 0007).
-- Nobody inserts orders straight from the browser: place_order() (0008) does.
-- ===========================================================================

create type public.order_status as enum (
  'new',               -- just placed, not looked at yet
  'confirmed',         -- admin called / messaged the customer
  'preparing',         -- being packed
  'ready_for_pickup',  -- Modiin pickup orders
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.payment_status as enum ('unpaid', 'paid', 'refunded');

create sequence public.order_reference_seq start with 1001;

create table public.orders (
  id                       uuid primary key default gen_random_uuid(),
  reference                text not null unique default ('SB-' || nextval('public.order_reference_seq')),
  user_id                  uuid references public.profiles (id) on delete set null,
  source                   text not null default 'website' check (source in ('website', 'whatsapp', 'phone', 'admin')),
  status                   public.order_status not null default 'new',
  payment_status           public.payment_status not null default 'unpaid',
  payment_method           text check (payment_method in ('cash', 'bank_transfer', 'bit')),
  customer_name            text not null,
  phone                    text not null,
  email                    text,
  zone_id                  text references public.delivery_zones (id) on update cascade on delete set null,
  zone_name                text,                -- snapshot at order time
  city                     text,
  street                   text,
  apartment                text,
  notes                    text,                -- from the customer
  admin_notes              text,                -- internal, admin only
  language                 text not null default 'en' check (language in ('en', 'he')),
  subtotal                 numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee             numeric(10, 2) check (delivery_fee is null or delivery_fee >= 0), -- null = to arrange
  total                    numeric(10, 2) not null check (total >= 0),
  requested_delivery_date  date,                -- the "next available delivery" the site showed
  scheduled_delivery_date  date,                -- what the admin actually planned
  confirmed_at             timestamptz,
  delivered_at             timestamptz,
  cancelled_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_phone_created_idx on public.orders (phone, created_at desc);
create index orders_delivery_date_idx on public.orders (scheduled_delivery_date);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id             bigint generated always as identity primary key,
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     text references public.products (id) on update cascade on delete set null,
  size_id        uuid references public.product_sizes (id) on delete set null,
  product_name   text not null,
  category_name  text,
  size_label     text not null,
  unit_price     numeric(10, 2) not null check (unit_price >= 0),
  quantity       integer not null check (quantity > 0),
  line_total     numeric(10, 2) generated always as (unit_price * quantity) stored
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_size_idx on public.order_items (size_id);

create table public.order_status_history (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  from_status  public.order_status,
  to_status    public.order_status not null,
  changed_by   uuid references auth.users (id) on delete set null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Security: customers read their own orders; admins do everything
-- ---------------------------------------------------------------------------
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_status_history enable row level security;

create policy "Read own orders" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins update orders" on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete orders" on public.orders for delete to authenticated
  using ((select public.is_admin()));

create policy "Read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_items.order_id));
create policy "Admins manage order items" on public.order_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Read own order history" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_status_history.order_id));

revoke all on public.orders, public.order_items, public.order_status_history from anon;
revoke insert on public.orders from authenticated;
revoke insert, update, delete, truncate on public.order_status_history from authenticated;
grant usage on sequence public.order_reference_seq to authenticated;
