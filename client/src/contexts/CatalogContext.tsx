/*
 * Provides the product catalogue to the whole site.
 *
 * Starts with the built-in list, loads the live one from Supabase once the page
 * is up, and listens for stock / product changes so "sold out" and prices update
 * without a reload (Supabase Realtime, debounced).
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PRODUCTS, type ProductCategory } from "@/config/products";
import { fetchCatalog } from "@/lib/catalog";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type CatalogState = {
  categories: ProductCategory[];
  /** true once the database version is showing */
  live: boolean;
  /** reload now (e.g. after an order came back "out of stock") */
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogState>({ categories: PRODUCTS, live: false, refresh: async () => {} });

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ProductCategory[]>(PRODUCTS);
  const [live, setLive] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchCatalog();
      if (next && mounted.current) {
        setCategories(next);
        setLive(true);
      }
    } catch (err) {
      console.warn("[catalog] Using the built-in product list:", err);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!isSupabaseConfigured) return;

    let debounce: number | undefined;
    let unsubscribe: (() => void) | undefined;
    const onChange = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(refresh, 400);
    };

    // setTimeout rather than requestAnimationFrame: works while the tab is hidden too
    const start = window.setTimeout(async () => {
      await refresh();
      const sb = await getSupabase();
      if (!sb || !mounted.current) return;
      const channel = sb
        .channel("catalog-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "product_sizes" }, onChange)
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, onChange)
        .subscribe();
      unsubscribe = () => void sb.removeChannel(channel);
    }, 0);

    return () => {
      mounted.current = false;
      window.clearTimeout(start);
      window.clearTimeout(debounce);
      unsubscribe?.();
    };
  }, [refresh]);

  return <CatalogContext.Provider value={{ categories, live, refresh }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
