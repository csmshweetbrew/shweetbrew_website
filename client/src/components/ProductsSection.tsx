/*
 * SHWEETBREW PRODUCTS SECTION
 * Displays product variants with category filter text
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { useState, useMemo } from "react";
import { PRODUCTS } from "@/config/products";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";

export default function ProductsSection() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Memoize filtered variants to prevent unnecessary recalculations
  const filteredVariants = useMemo(() => {
    const allVariantsWithCategory = PRODUCTS.flatMap((category) =>
      category.variants.map((variant) => ({
        variant,
        categoryName: category.name,
        categoryId: category.id,
      }))
    );

    return selectedCategory === "all"
      ? allVariantsWithCategory
      : allVariantsWithCategory.filter((item) => item.categoryId === selectedCategory);
  }, [selectedCategory]);

  // Category filter options - use translated category names
  const getCategoryLabel = (categoryId: string): string => {
    const categoryTranslationMap: Record<string, Record<string, string>> = {
      "biltong": { en: "BILTONG", he: "בילטונג" },
      "boerewors": { en: "BOEREWORS", he: "בוארווורס" },
      "drywors": { en: "DRYWORS", he: "דרייוורס" },
      "jerky": { en: "JERKY", he: "ג'רקי" },
      "chilli-bites": { en: "CHILLI BITES", he: "ביטות צ'ילי" },
      "shots": { en: "SHOTS", he: "שוטות" },
      "sauces": { en: "SAUCES", he: "רטבים" },
    };
    return categoryTranslationMap[categoryId]?.[language] || categoryId;
  };

  const categories = useMemo(
    () => [
      { id: "all", label: translations.products.filterAll[language] },
      ...PRODUCTS.map((cat) => ({ id: cat.id, label: getCategoryLabel(cat.id) })),
    ],
    [language]
  );

  return (
    <section className="py-20 px-4" style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-bold mb-2 tracking-widest" style={{ color: "var(--accent)" }}>
            — {translations.products.theRange[language]} —
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
            {translations.products.sectionTitle[language]}
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "oklch(0.80 0.020 75)" }}>
            {translations.products.sectionSubtitle[language]}
          </p>
        </div>

        {/* Category Filter - Pure Text with Orange Highlight */}
        <div className="flex flex-wrap gap-0 justify-center mb-12 text-sm">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="flex items-center">
                <span
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    color: isSelected ? "var(--accent)" : "oklch(0.80 0.020 75)",
                    fontWeight: isSelected ? "700" : "400",
                    cursor: "pointer",
                    padding: "0.75rem",
                    userSelect: "none",
                    transition: "color 0.2s ease, font-weight 0.2s ease",
                  }}
                >
                  {cat.label}
                </span>
                {idx < categories.length - 1 && (
                  <span style={{ color: "oklch(0.70 0.015 65)" }}>|</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Products Grid with Fade Animation */}
        <div
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0"
          style={{
            animation: "fadeIn 0.6s ease-in-out",
          }}
        >
          {filteredVariants.map((item) => (
            <ProductCard
              key={item.variant.id}
              variant={item.variant}
              categoryName={item.categoryName}
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
