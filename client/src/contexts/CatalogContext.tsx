/*
 * Provides the product catalogue to the whole site.
 *
 * Starts with the built-in list, loads the live one from Supabase once the page
 * is up, and loads it again when the visitor comes back to the tab and every two
 * minutes while it is open, so "sold out" and prices update without a reload.
 * (Live updates needed the 230 KB Supabase library; this is a few lines.)
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PRODUCTS, type ProductCategory } from "@/config/products";
import { fetchCatalog } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase";

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

    let last = 0;
    const load = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 30000) return;
      last = Date.now();
      void refresh();
    };
    // setTimeout rather than requestAnimationFrame: works while the tab is hidden too
    const start = window.setTimeout(() => { last = Date.now(); void refresh(); }, 0);
    const every = window.setInterval(load, 120000);
    document.addEventListener("visibilitychange", load);

    return () => {
      mounted.current = false;
      window.clearTimeout(start);
      window.clearInterval(every);
      document.removeEventListener("visibilitychange", load);
    };
  }, [refresh]);

  return <CatalogContext.Provider value={{ categories, live, refresh }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
