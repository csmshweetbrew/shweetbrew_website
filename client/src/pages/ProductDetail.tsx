/*
 * SHWEETBREW PRODUCT DETAIL PAGE
 * Displays full product information with detailed descriptions
 * Design: "Braai Fire & Blue Star" — dark theme with fire orange accents
 */

import { useLocation, useRoute } from "wouter";
import { PRODUCTS } from "@/config/products";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { getSpiceFlames } from "@/config/products";
import { ChevronLeft } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();

  // Find the product variant by ID
  let product = null;
  let categoryName = "";

  for (const category of PRODUCTS) {
    const variant = category.variants.find((v) => v.id === params?.id);
    if (variant) {
      product = variant;
      categoryName = category.name;
      break;
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.13 0.005 60)" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
            Product Not Found
          </h1>
          <Button onClick={() => navigate("/")} style={{ backgroundColor: "var(--accent)" }}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...product.sizes.map((s) => s.price));
  const maxPrice = Math.max(...product.sizes.map((s) => s.price));
  const priceRange = minPrice === maxPrice ? `₪${minPrice}` : `₪${minPrice} - ₪${maxPrice}`;

  const handleOrder = () => {
    const message = `Hi Shweet Brew! I'm interested in ${categoryName} - ${product.name}. Can you send me more details?`;
    window.open(getWhatsAppLink(message), "_blank");
  };

  return (
    <div style={{ backgroundColor: "oklch(0.13 0.005 60)" }} className="min-h-screen py-12">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-8 transition-colors"
          style={{ color: "var(--accent)" }}
        >
          <ChevronLeft size={20} />
          <span>Back to Products</span>
        </button>

        {/* Product Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-md rounded-lg shadow-2xl"
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Category Badge */}
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
              }}
            >
              {categoryName}
            </span>

            {/* Product Name */}
            <h1 className="font-display text-5xl font-bold mb-2" style={{ color: "oklch(0.97 0.005 260)" }}>
              {product.name}
            </h1>

            {/* Tagline */}
            <p className="text-lg mb-6" style={{ color: "var(--accent)" }}>
              {product.tagline}
            </p>

            {/* Spice Level */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: "oklch(0.80 0.020 75)" }}>Spice Level</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: product.spiceLevel }).map((_, idx) => (
                  <span key={idx} className="text-2xl">
                    🔥
                  </span>
                ))}
              </div>
            </div>

            {/* Kosher Badge */}
            {product.isKosher && (
              <div className="mb-6 flex items-center gap-2">
                <span className="text-xl">✡️</span>
                <span style={{ color: "oklch(0.80 0.020 75)" }}>Kosher Certified</span>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-8">
              <p className="text-sm mb-2" style={{ color: "oklch(0.80 0.020 75)" }}>
                Price Range
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                {priceRange}
              </p>
            </div>

            {/* Size Options */}
            <div className="mb-8">
              <p className="text-sm font-bold mb-4 tracking-widest" style={{ color: "oklch(0.80 0.020 75)" }}>
                AVAILABLE SIZES
              </p>
              <div className="space-y-3">
                {product.sizes.map((size, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 rounded-lg"
                    style={{
                      backgroundColor: "oklch(0.21 0.006 285.885)",
                      border: "1px solid oklch(0.70 0.015 65)",
                    }}
                  >
                    <div>
                      <p className="font-bold" style={{ color: "oklch(0.97 0.005 260)" }}>
                        {size.size}
                      </p>
                      <p className="text-sm" style={{ color: "oklch(0.80 0.020 75)" }}>
                        {size.weight}
                      </p>
                    </div>
                    <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>
                      ₪{size.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Button */}
            <Button
              onClick={handleOrder}
              className="w-full py-6 text-lg font-bold"
              style={{
                backgroundColor: "var(--accent)",
                color: "oklch(0.97 0.005 260)",
              }}
            >
              🛒 Order on WhatsApp
            </Button>
          </div>
        </div>

        {/* Full Description */}
        <div
          className="rounded-lg p-8"
          style={{
            backgroundColor: "oklch(0.21 0.006 285.885)",
            border: "2px solid var(--accent)",
          }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "oklch(0.97 0.005 260)" }}>
            About This Product
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "oklch(0.80 0.020 75)" }}>
            {product.description}
          </p>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-bold mb-2 tracking-widest" style={{ color: "var(--accent)" }}>
                100% BEEF
              </p>
              <p style={{ color: "oklch(0.80 0.020 75)" }}>
                No fillers, no nonsense. Pure, authentic South African beef.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2 tracking-widest" style={{ color: "var(--accent)" }}>
                AUTHENTIC SPICES
              </p>
              <p style={{ color: "oklch(0.80 0.020 75)" }}>
                Traditional SA recipes with a Shweet Brew twist for maximum flavour.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2 tracking-widest" style={{ color: "var(--accent)" }}>
                MADE IN ISRAEL
              </p>
              <p style={{ color: "oklch(0.80 0.020 75)" }}>
                Crafted with Israeli pride and South African soul.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "oklch(0.97 0.005 260)" }}>
            Explore More Products
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="w-full py-4 text-lg font-bold"
            style={{
              backgroundColor: "oklch(0.21 0.006 285.885)",
              color: "var(--accent)",
              border: "2px solid var(--accent)",
            }}
          >
            Browse All Products
          </Button>
        </div>
      </div>
    </div>
  );
}
