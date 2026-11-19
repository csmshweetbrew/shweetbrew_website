/*
 * SHWEETBREW PRODUCTS SECTION
 * Displays product variants with category filter text
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { useState, useMemo, useEffect } from "react";
import { FILTER_GROUPS, SHOP_FILTER_EVENT } from "@/lib/shopFilter";
import { getCategoryNameHebrew } from "@/config/products";
import { useCatalog } from "@/contexts/CatalogContext";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";

export default function ProductsSection() {
  const { language } = useLanguage();
  const { categories: catalog } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // The hero's range tiles open this section on a range (see lib/shopFilter.ts)
  useEffect(() => {
    const onFilter = (e: Event) => {
      const filter = (e as CustomEvent<{ filter: string }>).detail?.filter;
      if (filter) setSelectedCategory(filter);
    };
    window.addEventListener(SHOP_FILTER_EVENT, onFilter);
    return () => window.removeEventListener(SHOP_FILTER_EVENT, onFilter);
  }, []);

  // Memoize filtered variants to prevent unnecessary recalculations
  const filteredVariants = useMemo(() => {
    const allVariantsWithCategory = catalog.flatMap((category) =>
      category.variants.map((variant) => ({
        variant,
        categoryName: category.name,
        categoryId: category.id,
      }))
    );

    if (selectedCategory === "all") return allVariantsWithCategory;
    const ids = FILTER_GROUPS[selectedCategory] ?? [selectedCategory];
    return allVariantsWithCategory.filter((item) => ids.includes(item.categoryId));
  }, [selectedCategory, catalog]);

  // Category filter options - use translated category names
  const getCategoryLabel = (categoryId: string, categoryName = categoryId): string => {
    const categoryTranslationMap: Record<string, Record<string, string>> = {
      "biltong": { en: "BILTONG", he: "בילטונג" },
      "boerewors": { en: "BOEREWORS", he: "בוארווורס" },
      "drywors": { en: "DRYWORS", he: "דרייוורס" },
      "jerky": { en: "JERKY", he: "ג'רקי" },
      "HOLY LAND JERKY": { en: "HOLY LAND JERKY", he: "ג'רקי ארץ הקודש" },
      "SHOTS": { en: "SHOTS", he: "שוטס" },
      "chilli-bites": { en: "CHILLI BITES", he: "ביטות צ'ילי" },
      "shots": { en: "SHOTS", he: "שוטות" },
      "sauces": { en: "SAUCES", he: "רטבים" },
    };
    // Categories added in the admin app aren't in the map: use their (Hebrew) name
    return categoryTranslationMap[categoryId]?.[language] || (language === "he" ? getCategoryNameHebrew(categoryName.toUpperCase()) : categoryName.toUpperCase());
  };

  const categories = useMemo(
    () => [
      { id: "all", label: translations.products.filterAll[language] },
      ...catalog.map((cat) => ({ id: cat.id, label: getCategoryLabel(cat.id, cat.name) })),
    ],
    [language, catalog]
  );

  return (
    <section className="py-20 px-4" style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="section-title mb-4">
            {translations.products.sectionTitle[language]}
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "oklch(0.80 0.020 75)" }}>
            {translations.products.sectionSubtitle[language]}
          </p>
        </div>

        {/* Category Filter - Pure Text with Orange Highlight */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:gap-x-9 justify-center mb-12">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                className="category-tab"
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid with Fade Animation */}
        <div
          key={selectedCategory}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 max-w-[1200px] mx-auto px-1 sm:px-4 lg:px-6"
        >
          {filteredVariants.map((item, index) => (
            <ProductCard
              key={item.variant.id}
              variant={item.variant}
              categoryName={item.categoryName}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredVariants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: "oklch(0.80 0.020 75)" }}>
              No products found in this category.
            </p>
          </div>
        )}

        {/* CSS Animation for fade-in */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
