-- ===========================================================================
-- 0007 · Order workflow
--
-- What happens when an order's status changes, so the admin app only has to
-- update orders.status:
--   * a row in order_status_history (who changed what, when)
--   * confirmed_at / delivered_at / cancelled_at filled in
--   * stock given back on cancel, taken again if a cancelled order is reopened
--     (reopening fails if that stock has gone since)
-- ===========================================================================

create or replace function public.order_status_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item record;
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, from_status, to_status)
    values (new.id, null, new.status);
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  insert into public.order_status_history (order_id, from_status, to_status)
  values (new.id, old.status, new.status);

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    -- Give the stock back
    perform set_config('shweetbrew.stock_reason', 'order_cancelled', true);
    perform set_config('shweetbrew.stock_order_id', new.id::text, true);
    perform set_config('shweetbrew.stock_note', 'Order ' || new.reference || ' cancelled', true);
    for v_item in
      select size_id, sum(quantity)::int as qty
      from public.order_items
      where order_id = new.id and size_id is not null
      group by size_id
      order by size_id
    loop
      update public.product_sizes
      set stock = stock + v_item.qty
      where id = v_item.size_id and stock is not null;
    end loop;

  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    -- Take it again (the stock >= 0 check raises if there isn't enough left)
    perform set_config('shweetbrew.stock_reason', 'order_restored', true);
    perform set_config('shweetbrew.stock_order_id', new.id::text, true);
    perform set_config('shweetbrew.stock_note', 'Order ' || new.reference || ' reopened', true);
    for v_item in
      select size_id, sum(quantity)::int as qty
      from public.order_items
      where order_id = new.id and size_id is not null
      group by size_id
      order by size_id
    loop
      update public.product_sizes
      set stock = stock - v_item.qty
      where id = v_item.size_id and stock is not null;
    end loop;
  end if;

  perform set_config('shweetbrew.stock_reason', '', true);
  perform set_config('shweetbrew.stock_order_id', '', true);
  perform set_config('shweetbrew.stock_note', '', true);
  return new;
end;
$$;

create trigger orders_status_insert
  after insert on public.orders
  for each row execute function public.order_status_changed();

create trigger orders_status_update
  before update of status on public.orders
  for each row execute function public.order_status_changed();

create or replace function public.order_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' and new.confirmed_at is null then new.confirmed_at = now(); end if;
    if new.status = 'delivered' then new.delivered_at = now(); end if;
    if new.status = 'cancelled' then new.cancelled_at = now(); end if;
    if old.status = 'cancelled' and new.status <> 'cancelled' then new.cancelled_at = null; end if;
  end if;
  return new;
end;
$$;

create trigger orders_status_timestamps
  before update of status on public.orders
  for each row execute function public.order_status_timestamps();

revoke all on function public.order_status_changed() from public, anon, authenticated;
revoke all on function public.order_status_timestamps() from public, anon, authenticated;
