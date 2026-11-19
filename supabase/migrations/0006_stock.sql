-- ===========================================================================
-- 0006 · Stock
--
-- Stock lives in product_sizes.stock (0004). Every change to it, from
-- place_order, the admin app or the SQL editor, writes a stock_movements row
-- through a trigger. Functions describe the change by setting, for the
-- transaction:
--   shweetbrew.stock_reason, shweetbrew.stock_order_id, shweetbrew.stock_note
-- A direct edit without them is logged as 'adjustment'.
-- ===========================================================================

create type public.stock_reason as enum (
  'order',            -- taken by a placed order
  'order_cancelled',  -- given back when an order is cancelled
  'order_restored',   -- taken again when a cancelled order is reopened
  'restock',          -- new batch packed
  'adjustment',       -- manual change by an admin (breakage, tasting, gifts)
  'correction'        -- stocktake: set to the counted number
);

create table public.stock_movements (
  id           bigint generated always as identity primary key,
  size_id      uuid not null references public.product_sizes (id) on delete cascade,
  change       integer not null,
  stock_after  integer,
  reason       public.stock_reason not null,
  order_id     uuid references public.orders (id) on delete set null,
  note         text,
  created_by   uuid references auth.users (id) on delete set null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index stock_movements_size_idx on public.stock_movements (size_id, created_at desc);

create or replace function public.log_stock_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := nullif(current_setting('shweetbrew.stock_reason', true), '');
  v_order  text := nullif(current_setting('shweetbrew.stock_order_id', true), '');
  v_note   text := nullif(current_setting('shweetbrew.stock_note', true), '');
begin
  if new.stock is distinct from old.stock then
    insert into public.stock_movements (size_id, change, stock_after, reason, order_id, note)
    values (
      new.id,
      coalesce(new.stock, 0) - coalesce(old.stock, 0),
      new.stock,
      coalesce(v_reason, 'adjustment')::public.stock_reason,
      v_order::uuid,
      coalesce(v_note, case when new.stock is null then 'Stock tracking turned off'
                            when old.stock is null then 'Stock tracking turned on' end)
    );
  end if;
  return new;
end;
$$;

create trigger product_sizes_log_stock
  after update of stock on public.product_sizes
  for each row execute function public.log_stock_change();

-- Add or remove packs: +12 after a batch, -1 for a broken pack.
create or replace function public.admin_adjust_stock(
  p_size_id uuid,
  p_change  integer,
  p_reason  public.stock_reason default 'adjustment',
  p_note    text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stock integer;
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN' using errcode = '42501'; end if;
  if p_reason in ('order', 'order_cancelled', 'order_restored') then raise exception 'INVALID_INPUT:reason'; end if;

  perform set_config('shweetbrew.stock_reason', p_reason::text, true);
  perform set_config('shweetbrew.stock_note', coalesce(p_note, ''), true);
  update public.product_sizes
  set stock = coalesce(stock, 0) + p_change
  where id = p_size_id
  returning stock into v_stock;
  if not found then raise exception 'INVALID_INPUT:size_id'; end if;
  perform set_config('shweetbrew.stock_reason', '', true);
  perform set_config('shweetbrew.stock_note', '', true);
  return v_stock;
end;
$$;

-- Stocktake: set the counted number. NULL stops tracking that size.
create or replace function public.admin_set_stock(
  p_size_id uuid,
  p_stock   integer,
  p_note    text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stock integer;
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN' using errcode = '42501'; end if;

  perform set_config('shweetbrew.stock_reason', 'correction', true);
  perform set_config('shweetbrew.stock_note', coalesce(p_note, ''), true);
  update public.product_sizes set stock = p_stock where id = p_size_id returning stock into v_stock;
  if not found then raise exception 'INVALID_INPUT:size_id'; end if;
  perform set_config('shweetbrew.stock_reason', '', true);
  perform set_config('shweetbrew.stock_note', '', true);
  return v_stock;
end;
$$;

-- ---------------------------------------------------------------------------
-- Security: only admins read the log; nobody writes it except the trigger
-- ---------------------------------------------------------------------------
alter table public.stock_movements enable row level security;

create policy "Admins read stock log" on public.stock_movements for select to authenticated
  using ((select public.is_admin()));

revoke all on public.stock_movements from anon;
revoke insert, update, delete, truncate on public.stock_movements from authenticated;

revoke all on function public.log_stock_change() from public, anon, authenticated;
revoke all on function public.admin_adjust_stock(uuid, integer, public.stock_reason, text) from public, anon;
revoke all on function public.admin_set_stock(uuid, integer, text) from public, anon;
grant execute on function public.admin_adjust_stock(uuid, integer, public.stock_reason, text) to authenticated;
grant execute on function public.admin_set_stock(uuid, integer, text) to authenticated;
