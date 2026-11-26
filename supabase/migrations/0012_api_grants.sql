-- ===========================================================================
-- 0012 · API access grants
--
-- Newer Supabase projects don't give the API roles (anon, authenticated,
-- service_role) access to new tables automatically, so the API answered
-- "permission denied" for everything. This grants exactly what each role
-- needs. Row Level Security (set up in 0002-0006) still decides which rows:
--   anon            the public site: read the catalogue and zones
--   authenticated   signed-in users: their profile and orders; admins more (RLS)
--   service_role    the secret key (Python backend, admin scripts): everything
-- ===========================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Secret key: full access (it bypasses RLS by design; never ship it to a browser)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Catalogue and zones: everyone reads; admins write (RLS checks is_admin)
grant select on public.categories, public.products, public.product_sizes, public.delivery_zones to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_sizes, public.delivery_zones to authenticated;

-- Profiles: read your own (RLS); the editable columns were granted in 0002
grant select on public.profiles to authenticated;

-- Orders: customers read their own, admins manage (RLS). Creating orders goes
-- through place_order(), never a direct insert.
grant select, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select on public.order_status_history to authenticated;
grant select on public.stock_movements to authenticated;
grant select on public.stock_overview, public.order_overview to authenticated;

-- Used inside the RLS policies, so the calling roles must be able to run it
grant execute on function public.is_admin() to anon, authenticated;
