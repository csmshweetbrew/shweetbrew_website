/*
 * SHWEETBREW PRODUCT CARD COMPONENT
 * Displays individual product variants with size selection and add to cart
 * Info popup for nutrients, ingredients, and full description
 */

import { memo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSpiceFlames, getTranslatedProductName, getTranslatedProductDescription, getTranslatedProductTagline, type ProductVariant } from "@/config/products";
import { translations } from "@/config/languages";
import ProductInfoModal from "./ProductInfoModal";
import { ShoppingCart, Info } from "lucide-react";

interface ProductCardProps {
  variant: ProductVariant;
  categoryName: string;
}

const ProductCardComponent = ({ variant, categoryName }: ProductCardProps) => {
  const { addItem } = useCart();
  const { language } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>(variant.sizes[0].size);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const selectedSizeData = variant.sizes.find((s) => s.size === selectedSize);

  const handleAddToCart = () => {
    if (variant.isAvailable === false) {
      alert(`${variant.name} is currently unavailable: ${variant.unavailableReason}`);
      return;
    }
    if (!selectedSize || !selectedSizeData) {
      alert("Please select a size");
      return;
    }

    addItem({
      id: `${categoryName}-${variant.name}-${selectedSize}`,
      categoryName,
      productName: variant.name,
      size: selectedSize,
      price: selectedSizeData.price,
      quantity: 1,
      image: variant.image,
    });

    // Show feedback
    const event = new CustomEvent("cartAdded", {
      detail: { product: variant.name, size: selectedSize, price: selectedSizeData.price },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      <div
        className="rounded-lg overflow-hidden shadow-lg transition-shadow duration-200 hover:shadow-2xl"
        style={{
          backgroundColor: "oklch(0.21 0.006 285.885)",
          borderLeft: "4px solid var(--accent)",
        }}
      >
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden bg-black">
          <img
            src={variant.image}
            alt={`${categoryName} - ${variant.name}`}
            className="w-full h-full object-cover"
          />
          {/* Badges Container */}
          <div className={`absolute top-3 flex flex-col gap-1 max-w-[120px] ${language === "he" ? "left-3" : "right-3"}`}>
            {/* Unavailable Badge */}
            {variant.isAvailable === false && (
              <div
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: "oklch(0.50 0.05 0)",
                  color: "oklch(0.70 0.05 0)",
                }}
                title={variant.unavailableReason}
              >
                {translations.products.notAvailable[language]}
              </div>
            )}

          </div>
          {/* Info Button */}
          <button
            onClick={() => setIsInfoOpen(true)}
            className="absolute bottom-3 left-3 p-2 rounded-full transition-all hover:scale-110"
            style={{
              backgroundColor: "oklch(0.62 0.20 42 / 0.9)",
              color: "oklch(0.97 0.005 260)",
            }}
            title="View nutrients & ingredients"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category & Name */}
          <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>
            {language === "en" ? categoryName : (translations.products as any)[categoryName.toLowerCase()]?.[language] || categoryName}
          </p>
          <h3 className="font-display text-lg font-bold mb-1" style={{ color: "oklch(0.97 0.005 260)" }}>
            {getTranslatedProductName(variant.id, language)}
          </h3>

          {/* Tagline */}
          <p className="text-xs mb-3" style={{ color: "oklch(0.70 0.015 65)", fontStyle: "italic" }}>
            {getTranslatedProductTagline(variant.id, language)}
          </p>

          {/* Spice Level with Label */}
          <div className="mb-3">
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold mb-1" style={{ color: "var(--accent)" }}>
                {translations.products.spiceLevel[language]}
              </span>
              <div className="flex gap-1 items-center">
                {variant.spiceLevel === 0 ? (
                  <span className="text-sm font-semibold" style={{ color: "oklch(0.70 0.015 65)" }}>
                    Mild
                  </span>
                ) : (
                  <span className="text-lg">
                    {getSpiceFlames(variant.spiceLevel)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description (short) */}
          <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{ color: "oklch(0.80 0.020 75)" }}>
            {getTranslatedProductDescription(variant.id, language)}
          </p>

          {/* Size Selection */}
          <div className="mb-4 pb-4 border-b" style={{ borderColor: "oklch(0.62 0.20 42 / 0.3)" }}>
            <label
              className="block text-xs font-bold mb-2"
              style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
            >
              {translations.products.selectSize[language]}
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-bold"
              style={{
                backgroundColor: "oklch(0.13 0.005 60)",
                borderColor: "var(--accent)",
                color: "oklch(0.97 0.005 260)",
                border: "1px solid var(--accent)",
              }}
            >
              {variant.sizes.map((size) => (
                <option key={size.size} value={size.size}>
                  {size.size} — ₪{size.price}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--accent)",
              color: "oklch(0.97 0.005 260)",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            {translations.products.addToCart[language]}
          </button>
        </div>
      </div>

      {/* Info Modal (nutrients, ingredients, description) */}
      <ProductInfoModal
        variant={variant}
        categoryName={categoryName}
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </>
  );
};

export default memo(ProductCardComponent);
