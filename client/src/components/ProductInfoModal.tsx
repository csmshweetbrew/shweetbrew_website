import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getTranslatedProductDescription, getCategoryNameHebrew, getTranslatedIngredients, getTranslatedAllergens, getTranslatedProductName, type ProductVariant } from "@/config/products";

type ProductInfoModalProps = {
  variant: ProductVariant;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductInfoModal({ variant, categoryName, isOpen, onClose }: ProductInfoModalProps) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "oklch(0.13 0.005 60)", border: "2px solid var(--accent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--accent)" }}>
          <div>
            <p style={{ color: "var(--accent)" }} className="text-xs font-bold">
              {language === "en" ? categoryName : getCategoryNameHebrew(categoryName)}
            </p>
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "oklch(0.97 0.005 260)",
                letterSpacing: "0.05em",
              }}
            >
              {getTranslatedProductName(variant.id, language)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded transition"
            style={{ backgroundColor: "oklch(0.21 0.006 285.885)" }}
          >
            <X className="w-6 h-6" style={{ color: "oklch(0.97 0.005 260)" }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <img src={variant.image} alt={variant.name} className="w-full h-full object-cover" />
          </div>

          {/* Full Description */}
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "oklch(0.97 0.005 260)", letterSpacing: "0.05em" }}
            >
              {language === "en" ? "ABOUT THIS PRODUCT" : "על המוצר"}
            </h3>
            <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-base leading-relaxed">
              {getTranslatedProductDescription(variant.id, language)}
            </p>
          </div>

          {/* Nutrients Section */}
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "oklch(0.97 0.005 260)", letterSpacing: "0.05em" }}
            >
              {translations.products.nutrition[language]} (per 100g)
            </h3>
            <div
              className="grid grid-cols-2 gap-4 p-4 rounded"
              style={{ backgroundColor: "oklch(0.21 0.006 285.885)", border: "1px solid oklch(0.62 0.20 42 / 0.3)" }}
            >
              <div>
                <p style={{ color: "var(--accent)" }} className="text-xs font-bold">
                  {translations.products.protein[language]}
                </p>
                <p style={{ color: "oklch(0.97 0.005 260)" }} className="text-lg font-bold">
                  {variant.nutrition?.protein || "50g"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--accent)" }} className="text-xs font-bold">
                  {translations.products.fat[language]}
                </p>
                <p style={{ color: "oklch(0.97 0.005 260)" }} className="text-lg font-bold">
                  {variant.nutrition?.fat || "8g"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--accent)" }} className="text-xs font-bold">
                  {translations.products.carbs[language]}
                </p>
                <p style={{ color: "oklch(0.97 0.005 260)" }} className="text-lg font-bold">
                  {variant.nutrition?.carbs || "2g"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--accent)" }} className="text-xs font-bold">
                  {translations.products.calories[language]}
                </p>
                <p style={{ color: "oklch(0.97 0.005 260)" }} className="text-lg font-bold">
                  {variant.nutrition?.calories || "300"}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "oklch(0.97 0.005 260)", letterSpacing: "0.05em" }}
            >
              {translations.products.ingredients[language]}
            </h3>
            <p
              style={{ color: "oklch(0.80 0.020 75)" }}
              className="text-sm leading-relaxed bg-black/20 p-4 rounded"
            >
              {getTranslatedIngredients(variant.id, language)}
            </p>
          </div>

          {/* Allergens */}
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "oklch(0.97 0.005 260)", letterSpacing: "0.05em" }}
            >
              {translations.products.allergens[language]}
            </h3>
            <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-sm">
              {getTranslatedAllergens(variant.id, language)}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded font-bold text-lg transition-all hover:scale-105"
            title={translations.products.close[language]}
            style={{
              backgroundColor: "var(--accent)",
              color: "oklch(0.97 0.005 260)",
            }}
          >
            {translations.products.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
