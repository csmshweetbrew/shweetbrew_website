-- ===========================================================================
-- 0011 · Product photos
--
-- A public storage bucket the admin app uploads product photos to. Anyone can
-- view them (they're on the shop); only admins can upload, replace or delete.
-- Put the file's public URL in products.image:
--   https://<project>.supabase.co/storage/v1/object/public/product-images/<file>
-- Same format as the site's own photos: WebP, about 720px wide, under 5MB.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

create policy "Product photos are public" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins replace product photos" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
