import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { PRODUCTS } from "@/config/products";
import { X, ShoppingCart } from "lucide-react";

type ProductModalProps = {
  categoryName: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ProductModal({ categoryName, productName, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const category = PRODUCTS.find((c) => c.name === categoryName);
  const product = category?.variants.find((p: any) => p.name === productName);

  if (!isOpen || !product) return null;

  const selectedVariant = product?.sizes?.find(
    (v: any) => v.size === selectedSize
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select size");
      return;
    }

    const variant = product?.sizes?.find(
      (v: any) => v.size === selectedSize
    );

    if (variant) {
      addItem({
        id: `${categoryName}-${productName}`,
        categoryName,
        productName,
        flavor: selectedFlavor || undefined,
        size: selectedSize,
        price: variant.price,
        quantity,
        image: product.image,
      });
      onClose();
      setSelectedSize("");
      setSelectedFlavor("");
      setQuantity(1);
    }
  };

  const flavorOptions: string[] = []; // No flavors in this structure
  const sizeOptions = Array.from(new Set(product?.sizes?.map((v: any) => v.size) || [])) as string[];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "oklch(0.13 0.005 60)", border: "2px solid var(--accent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--accent)" }}>
          <h2
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "oklch(0.97 0.005 260)",
              letterSpacing: "0.05em",
            }}
          >
            {productName}
          </h2>
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
            <img src={product.image} alt={productName} className="w-full h-full object-cover" />
          </div>

          {/* Description */}
          <div>
            <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Spice Level */}
          <div>
            <p
              className="text-sm font-bold tracking-widest mb-3"
              style={{ color: "var(--accent)", letterSpacing: "0.15em" }}
            >
              SPICE LEVEL
            </p>
            <div className="flex gap-2">
              {Array(product.spiceLevel)
                .fill(0)
                .map((_, i) => (
                  <span key={i} className="text-2xl">
                    🔥
                  </span>
                ))}
            </div>
          </div>

          {/* Kosher Badge */}
          {product.isKosher && (
            <div
              className="inline-block px-4 py-2 rounded"
              style={{ backgroundColor: "oklch(0.21 0.006 285.885)", border: "2px solid oklch(0.50 0.18 260)" }}
            >
              <span style={{ color: "oklch(0.50 0.18 260)", fontWeight: 700 }}>✡ KOSHER</span>
            </div>
          )}



          {/* Size Selection */}
          <div>
            <label
              className="block text-sm font-bold mb-3"
              style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
            >
              SIZE & PRICE
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-4 py-2 rounded border"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                borderColor: "var(--accent)",
                color: "oklch(0.97 0.005 260)",
              }}
            >
              <option value="">Select size</option>
              {sizeOptions.map((size: string) => {
                const variant = product?.sizes?.find(
                  (v: any) => v.size === size
                );
                return (
                  <option key={size} value={size}>
                    {size} — ₪{variant?.price}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label
              className="block text-sm font-bold mb-3"
              style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
            >
              QUANTITY
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 rounded font-bold"
                style={{ backgroundColor: "oklch(0.21 0.006 285.885)", color: "oklch(0.97 0.005 260)" }}
              >
                −
              </button>
              <span style={{ color: "oklch(0.97 0.005 260)" }} className="text-xl font-bold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 rounded font-bold"
                style={{ backgroundColor: "oklch(0.21 0.006 285.885)", color: "oklch(0.97 0.005 260)" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{
              backgroundColor: "var(--accent)",
              color: "oklch(0.97 0.005 260)",
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
