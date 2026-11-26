-- ===========================================================================
-- 0020 · The business owner's answers (2026-11-25)
--
-- Product text (ingredients, allergens, Hebrew names, kosher ingredients for the
-- beef jerky) and no minimum order.
-- Every text update only touches rows that still hold the old text, so anything
-- edited since is left alone. Safe to run more than once.
-- ===========================================================================

-- Contains soy (its description says soya sauce)
update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים.'
where id = 'holy-land-jerky-cowboy' and allergens_en = 'May contain traces of nuts and soy.';

-- Nothing was shown for the chicken jerky
update public.products set
  allergens_en = 'May contain traces of nuts and soy.',
  allergens_he = 'עלול להכיל עקבות של אגוזים וסויה.'
where id = 'holy-land-jerky-chicken-sweet-chilli' and coalesce(allergens_en, '') = '';

update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים.'
where id = 'holy-land-jerky-chicken-teriyaki' and coalesce(allergens_en, '') = '';

update public.products set
  allergens_en = 'Contains alcohol. May contain traces of nuts and soy.',
  allergens_he = 'מכיל אלכוהול. עלול להכיל עקבות של אגוזים וסויה.'
where id = 'shweetbrew-shots' and allergens_en = 'Contains alcohol. May contain traces of nuts.';

-- The teriyakis: the sauces have wheat
update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים.'
where id = 'biltong-teriyaki' and allergens_en = 'Contains soy. May contain traces of nuts.';

update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts and sesame.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים וסומסום.'
where id = 'holy-land-jerky-teriyaki' and allergens_en = 'Contains soy. May contain traces of nuts and sesame.';

update public.products set
  ingredients_en = 'Premium beef, soya sauce, salt, black pepper, onion powder, garlic powder, and spices.',
  ingredients_he = 'בשר בקר פרימיום, רוטב סויה, מלח, פלפל שחור, אבקת בצל, אבקת שום ותבלינים.'
where id = 'holy-land-jerky-cowboy' and ingredients_en = 'Premium beef, salt, black pepper, onion powder, garlic powder, and spices.';

-- Recipes he confirmed: Chilli beef jerky and Drywors have soya sauce
update public.products set
  ingredients_en = 'Premium beef, dried chilli spice, soya sauce, salt, and vinegar.',
  ingredients_he = 'בשר בקר פרימיום, תבלין צ''ילי מיובש, רוטב סויה, מלח וחומץ.'
where id = 'holy-land-jerky-chilli' and ingredients_en = 'Premium beef, chilli powder, cayenne pepper, black pepper, garlic, and spices.';

update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים.'
where id = 'holy-land-jerky-chilli' and allergens_en = 'May contain traces of nuts and soy.';

update public.products set
  ingredients_en = 'Premium beef, coriander, black pepper, vinegar, soya sauce, salt, and spices.',
  ingredients_he = 'בשר בקר פרימיום, כוסברה, פלפל שחור, חומץ, רוטב סויה, מלח ותבלינים.'
where id = 'drywors-classic' and ingredients_en = 'Premium beef, coriander, black pepper, garlic, and spices.';

update public.products set
  allergens_en = 'Contains soy and wheat. May contain traces of nuts.',
  allergens_he = 'מכיל סויה וחיטה. עלול להכיל עקבות של אגוזים.'
where id = 'drywors-classic' and allergens_en = 'May contain traces of nuts and soy.';

-- Nothing was shown for the chicken jerky
update public.products set
  ingredients_en = 'Chicken, sugar, dried chilli spice, vinegar, and salt.',
  ingredients_he = 'עוף, סוכר, תבלין צ''ילי מיובש, חומץ ומלח.'
where id = 'holy-land-jerky-chicken-sweet-chilli' and coalesce(ingredients_en, '') = '';

update public.products set
  ingredients_en = 'Chicken, teriyaki sauce, soy sauce, ginger, garlic powder, salt, and vinegar.',
  ingredients_he = 'עוף, רוטב טריאקי, רוטב סויה, ג''ינג''ר, אבקת שום, מלח וחומץ.'
where id = 'holy-land-jerky-chicken-teriyaki' and coalesce(ingredients_en, '') = '';

-- The sauce has sugar
update public.products set
  ingredients_en = 'Red chillies, sugar, garlic, vinegar, salt, and spices.',
  ingredients_he = 'צ''ילי אדום, סוכר, שום, חומץ, מלח ותבלינים.'
where id = 'chilli-sauce' and ingredients_en = 'Red chillies, garlic, vinegar, salt, and spices.';

-- All ingredients are kosher (no certificate; the site shows no kosher mark per product)
update public.products set is_kosher = true where category_id = 'HOLY LAND JERKY' and not is_kosher;

update public.categories set name_he = 'ג''רקי ארץ הקודש'
where id = 'HOLY LAND JERKY' and name_he = 'ג''רקי הארץ הקדושה';

-- Hebrew names he approved (only where there is none yet)
update public.products p set name_he = v.name_he
from (values
  ('biltong-traditional', 'קלאסי'),
  ('biltong-teriyaki', 'טריאקי'),
  ('biltong-sweet-chilli', 'צ''ילי מתוק'),
  ('biltong-chilli', 'צ''ילי'),
  ('boerewors-classic', 'קלאסי'),
  ('drywors-classic', 'קלאסי'),
  ('holy-land-jerky-cowboy', 'קאובוי קלאסי'),
  ('holy-land-jerky-teriyaki', 'טריאקי'),
  ('holy-land-jerky-sweet-chilli', 'צ''ילי מתוק'),
  ('holy-land-jerky-chilli', 'צ''ילי'),
  ('holy-land-jerky-chicken-sweet-chilli', 'ג''רקי עוף צ''ילי מתוק'),
  ('holy-land-jerky-chicken-teriyaki', 'ג''רקי עוף טריאקי'),
  ('shweetbrew-shots', 'שוטס של שוויט ברו'),
  ('chilli-sauce', 'רוטב צ''ילי מתוק')
) as v (id, name_he)
where p.id = v.id and coalesce(p.name_he, '') = '';

-- The chicken jerky in Hebrew
update public.products set description_he = 'ג''רקי עוף רזה ועשיר בחלבון, עם שילוב מושלם של חריפות מתוקה ותבליני ברייי אותנטיים.'
where id = 'holy-land-jerky-chicken-sweet-chilli' and coalesce(description_he, '') = '';
update public.products set tagline_he = 'חריפות רזה. מלא חלבון.'
where id = 'holy-land-jerky-chicken-sweet-chilli' and coalesce(tagline_he, '') = '';
update public.products set description_he = 'ג''רקי עוף רזה ועשיר בחלבון, עם זיגוג טריאקי מלוח-מתוק ותבליני ברייי אותנטיים.'
where id = 'holy-land-jerky-chicken-teriyaki' and coalesce(description_he, '') = '';
update public.products set tagline_he = 'מתוק מלוח. מלא חלבון.'
where id = 'holy-land-jerky-chicken-teriyaki' and coalesce(tagline_he, '') = '';

-- No minimum order
update public.delivery_zones set min_order = 0 where min_order = 80;
