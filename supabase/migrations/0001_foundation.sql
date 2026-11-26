-- ===========================================================================
-- 0001 · Foundation
--
-- Shweet Brew database, built up in numbered steps. Run them in order:
--
--   0001_foundation             shared helpers (this file)
--   0002_users                  profiles, customer/admin roles, signup trigger
--   0003_delivery_zones         delivery areas with fee and minimum order
--   0004_catalog                categories, products, sizes and prices
--   0005_orders                 orders, order lines, status history
--   0006_stock                  stock log and the admin stock functions
--   0007_order_workflow         status changes: history, timestamps, stock back on cancel
--   0008_place_order            place_order(): the only way the website creates orders
--   0009_admin_views            stock_overview and order_overview for the admin apps
--   0010_realtime               live updates for the admin app and the website
--   0011_product_images         storage bucket for product photos (admin uploads)
--
-- Then load ../seed.sql (generated from the site's product list).
--
-- Security model: the website talks to Supabase directly with the public anon
-- key, and Row Level Security decides what each visitor can see or change:
--   * anyone      reads the catalogue, zones and stock; orders only through place_order()
--   * customers   read and edit their own profile, read their own orders
--   * admins      read and change everything (profiles.role = 'admin')
--
-- Each file sets up the security rules for its own tables, so a table is never
-- left open between steps.
--
-- Apply: Supabase SQL editor, paste each file in order.
-- New changes go in a new file with the next number; never edit a file that
-- has already been applied to the live database.
-- ===========================================================================

-- Keeps updated_at current on every table that has one.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
