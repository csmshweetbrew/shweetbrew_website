/*
 * Live catalogue: products, prices and stock from Supabase.
 *
 * The site starts with the built-in list in config/products.ts (instant first
 * paint, and the fallback when Supabase isn't configured or can't be reached),
 * then swaps in the database version. The database wins for everything it
 * holds (names, text, prices, sizes, availability, stock); photos fall back to
 * the built-in ones. Products added in the admin app appear automatically.
 */

import {
  PRODUCTS,
  setLiveCategoryHebrew,
  setLiveProductText,
  type ProductCategory,
  type ProductVariant,
  type SizeOption,
} from "@/config/products";
import { getSupabase } from "./supabase";

type DbSize = {
  id: string;
  label: string;
  weight: string | null;
  price: number | string;
  stock: number | null;
  is_active: boolean;
  sort_order: number;
};

type DbProduct = {
  id: string;
  name_en: string;
  name_he: string | null;
  description_en: string | null;
  description_he: string | null;
  tagline_en: string | null;
  tagline_he: string | null;
  image: string | null;
  spice_level: number;
  is_kosher: boolean;
  is_available: boolean;
  unavailable_reason: string | null;
  nutrition: ProductVariant["nutrition"] | null;
  ingredients_en: string | null;
  ingredients_he: string | null;
  allergens_en: string | null;
  allergens_he: string | null;
  sort_order: number;
  product_sizes: DbSize[];
};

type DbCategory = {
  id: string;
  name_en: string;
  name_he: string | null;
  description_en: string | null;
  image: string | null;
  sort_order: number;
  products: DbProduct[];
};

const SELECT = `
  id, name_en, name_he, description_en, image, sort_order,
  products (
    id, name_en, name_he, description_en, description_he, tagline_en, tagline_he, image,
    spice_level, is_kosher, is_available, unavailable_reason, nutrition,
    ingredients_en, ingredients_he, allergens_en, allergens_he, sort_order,
    product_sizes ( id, label, weight, price, stock, is_active, sort_order )
  )`;

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;
const text = (en: string | null | undefined, he: string | null | undefined) => ({ en: en || undefined, he: he || undefined });

function mergeCatalog(rows: DbCategory[]): ProductCategory[] {
  return [...rows].sort(bySort).map((cat) => {
    const builtIn = PRODUCTS.find((c) => c.id === cat.id);
    if (cat.name_he) setLiveCategoryHebrew(cat.name_en, cat.name_he);

    const variants = [...(cat.products ?? [])].sort(bySort).map((p): ProductVariant => {
      const base = builtIn?.variants.find((v) => v.id === p.id);
      const sizes: SizeOption[] = [...(p.product_sizes ?? [])]
        .filter((s) => s.is_active)
        .sort(bySort)
        .map((s) => ({ sizeId: s.id, size: s.label, weight: s.weight ?? s.label, price: Number(s.price), stock: s.stock }));
      const inStock = sizes.some((s) => s.stock == null || s.stock > 0);

      setLiveProductText(p.id, {
        name: text(p.name_en, p.name_he),
        description: text(p.description_en, p.description_he),
        tagline: text(p.tagline_en, p.tagline_he),
        ingredients: text(p.ingredients_en, p.ingredients_he),
        allergens: text(p.allergens_en, p.allergens_he),
      });

      return {
        ...base,
        id: p.id,
        name: p.name_en,
        description: p.description_en ?? base?.description ?? "",
        tagline: p.tagline_en ?? base?.tagline ?? "",
        image: p.image || base?.image || cat.image || builtIn?.image || "",
        spiceLevel: p.spice_level,
        isKosher: p.is_kosher,
        isAvailable: p.is_available && sizes.length > 0 && inStock,
        unavailableReason: p.unavailable_reason ?? (p.is_available && !inStock ? "Sold out" : undefined),
        sizes,
        nutrition: p.nutrition ?? base?.nutrition,
      };
    });

    return {
      id: cat.id,
      name: cat.name_en,
      description: cat.description_en ?? builtIn?.description ?? "",
      image: cat.image || builtIn?.image || "",
      variants,
    };
  });
}

/** The catalogue from the database, or null when Supabase isn't set up / is empty. */
export async function fetchCatalog(): Promise<ProductCategory[] | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("categories").select(SELECT).eq("is_active", true);
  if (error) throw error;
  if (!data?.length) return null; // not seeded yet: keep the built-in list
  return mergeCatalog(data as unknown as DbCategory[]);
}

/** Find a product by the names the cart stores (category name + variant name). */
export function findVariant(categories: ProductCategory[], categoryName: string, productName: string) {
  return categories.find((c) => c.name === categoryName)?.variants.find((v) => v.name === productName);
}

export function findVariantById(categories: ProductCategory[], id: string) {
  for (const c of categories) {
    const v = c.variants.find((x) => x.id === id);
    if (v) return { category: c, variant: v };
  }
  return null;
}
