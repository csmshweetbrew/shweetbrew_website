-- ===========================================================================
-- 0022 · Shots nutrition (2026-11-26)
--
-- The Shots showed 110 kcal and 2 g of carbs, too low for a sweet liqueur.
-- Until the business owner checks his own, they show a sweet vodka liqueur of
-- the same strength (Sourz, 15%: 175-190 kcal and 24 g sugar per 100 ml).
-- The site labels it per 100 ml. Only changes the old values; safe to run twice.
-- ===========================================================================

update public.products
set nutrition = '{"protein": "0g", "fat": "0g", "carbs": "24g", "calories": "180"}'::jsonb
where id = 'shweetbrew-shots' and nutrition = '{"protein": "0g", "fat": "0g", "carbs": "2g", "calories": "110"}'::jsonb;
