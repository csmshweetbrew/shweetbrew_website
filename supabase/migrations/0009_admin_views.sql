-- ===========================================================================
-- 0009 · Admin views
--
-- Ready-made lists for the admin apps. security_invoker = true means they obey
-- the caller's Row Level Security, so customers see only their own rows (or
-- nothing) and admins see everything.
-- ===========================================================================

-- Stock app: one row per pack size, with a ready-made state for colouring
create view public.stock_overview with (security_invoker = true) as
select
  ps.id            as size_id,
  p.id             as product_id,
  p.name_en        as product_name,
  p.name_he        as product_name_he,
  c.id             as category_id,
  c.name_en        as category_name,
  ps.label         as size,
  ps.price,
  ps.stock,
  ps.low_stock_threshold,
  ps.is_active,
  p.is_available,
  case
    when ps.stock is null then 'untracked'
    when ps.stock = 0 then 'out'
    when ps.stock <= ps.low_stock_threshold then 'low'
    else 'ok'
  end              as stock_state,
  c.sort_order     as category_sort,
  p.sort_order     as product_sort,
  ps.sort_order    as size_sort
from public.product_sizes ps
join public.products p on p.id = ps.product_id
join public.categories c on c.id = p.category_id;

-- Orders app: every order plus how many packs it holds
create view public.order_overview with (security_invoker = true) as
select
  o.*,
  (select coalesce(sum(oi.quantity), 0) from public.order_items oi where oi.order_id = o.id)::int as item_count
from public.orders o;

revoke all on public.stock_overview, public.order_overview from anon;
