-- ===========================================================================
-- 0010 · Realtime
--
-- The admin phone app listens to new orders and status changes; the website
-- listens to products and stock so "sold out" and prices update without a
-- reload. Realtime respects Row Level Security, so each visitor only receives
-- rows they're allowed to read (guests get catalogue changes, never orders).
-- ===========================================================================

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime
      add table public.orders, public.order_items, public.products, public.product_sizes;
  end if;
end;
$$;
