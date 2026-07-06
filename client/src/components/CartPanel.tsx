/*
 * SHWEETBREW CART PANEL COMPONENT
 * Floating cart drawer with checkout form
 */

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, X, Trash2, Check } from "lucide-react";
import { getWhatsAppLink } from "@/config/site";
import { PRODUCTS } from "@/config/products";
import { translations } from "@/config/languages";
import { deliveryZones, getNextDeliveryDate, formatDeliveryDate } from "@/config/deliveryZones";

export default function CartPanel() {
  const { language } = useLanguage();
  const { items, removeItem, updateQuantity, updateSize, subtotal, selectedArea, setSelectedArea, clearCart, name, setName, phone, setPhone, notes, setNotes } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Calculate delivery fee from new deliveryZones config
  const selectedZone = deliveryZones.find((z) => z.id === selectedArea);
  const deliveryFee = selectedZone?.price || 0;
  const total = subtotal + deliveryFee;
  const nextDeliveryDate = selectedZone ? getNextDeliveryDate(selectedZone) : null;

  // Listen for cart added events
  useEffect(() => {
    const handleCartAdded = (event: any) => {
      setToastMessage(`✓ Added ${event.detail.product} (${event.detail.size}) to cart`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    };

    window.addEventListener("cartAdded", handleCartAdded);
    return () => window.removeEventListener("cartAdded", handleCartAdded);
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      alert(language === "en" ? "Your cart is empty!" : "העגלה שלך ריקה!");
      return;
    }

    if (!name || !phone) {
      alert(language === "en" ? "Please enter your name and phone number." : "אנא הזן את שמך ומספר הטלפון שלך.");
      return;
    }

    if (!selectedArea) {
      alert(language === "en" ? "Please select a delivery area." : "אנא בחר אזור משלוח.");
      return;
    }

    const orderSummary = items
      .map((item) => `${item.categoryName} - ${item.productName} (${item.size}) x${item.quantity} - ₪${item.price * item.quantity}`)
      .join("\n");

    const fullShippingDetails = [city, address].filter(Boolean).join(", ");
    const zoneName = typeof selectedZone?.name === "string" ? selectedZone.name : selectedArea;
    const deliveryDays = selectedZone?.deliveryDays.join(", ") || "";

    const message = [
      `*Shweet Brew Order*`,
      ``,
      `*Customer Details*`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      fullShippingDetails ? `Location: ${fullShippingDetails}` : "",
      `Delivery Zone: ${zoneName} (${deliveryDays})`,
      ``,
      `*Order Items*`,
      orderSummary,
      ``,
      `*Subtotal: ₪${subtotal}*`,
      deliveryFee > 0 ? `*Delivery Fee: ₪${deliveryFee}*` : "*Pickup - FREE*",
      `*Total: ₪${total}*`,
      ``,
      notes ? `*Special Requests:*\n${notes}` : "",
      ``,
      `Please confirm and arrange delivery/pickup.`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(getWhatsAppLink(message), "_blank");
    clearCart();
    setCity("");
    setAddress("");
    setIsOpen(false);
  };

  // Get available sizes for a product
  const getAvailableSizes = (categoryName: string, productName: string) => {
    const category = PRODUCTS.find((c) => c.name === categoryName);
    const variant = category?.variants.find((v) => v.name === productName);
    return variant?.sizes.map((s) => s.size) || [];
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg flex items-center gap-2 animate-bounce"
          style={{
            backgroundColor: "var(--accent)",
            color: "oklch(0.97 0.005 260)",
            boxShadow: "0 0 20px oklch(0.62 0.20 42 / 0.6)",
          }}
        >
          <Check className="w-5 h-5" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-40 p-4 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          backgroundColor: "var(--accent)",
          boxShadow: "0 0 30px oklch(0.62 0.20 42 / 0.5)",
        }}
      >
        <ShoppingCart className="w-6 h-6" style={{ color: "oklch(0.97 0.005 260)" }} />
        {items.length > 0 && (
          <span
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: "oklch(0.80 0.020 75)",
              color: "oklch(0.13 0.005 60)",
            }}
          >
            {items.length}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 md:bottom-24 md:right-8 md:left-auto z-40 md:w-96 rounded-t-lg md:rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: "oklch(0.13 0.005 60)",
            border: "2px solid var(--accent)",
            boxShadow: "0 0 40px oklch(0 0 0 / 0.6)",
            maxHeight: "calc(100vh - 100px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0" style={{ borderColor: "var(--accent)" }}>
            <h3
              className="font-bold text-base"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: "oklch(0.97 0.005 260)",
                letterSpacing: "0.05em",
              }}
            >
              {language === "en" ? "YOUR CART" : "עגלה שלי"}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-800 rounded">
              <X className="w-4 h-4" style={{ color: "oklch(0.97 0.005 260)" }} />
            </button>
          </div>

          {/* Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {items.length === 0 ? (
              <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-center py-6 text-sm">
                {language === "en" ? "Your cart is empty" : "העגלה שלך ריקה"}
              </p>
            ) : (
              items.map((item, idx) => {
                const availableSizes = getAvailableSizes(item.categoryName, item.productName);
                return (
                  <div
                    key={idx}
                    className="p-2 rounded border text-sm"
                    style={{
                      backgroundColor: "oklch(0.21 0.006 285.885)",
                      borderColor: "oklch(0.62 0.20 42 / 0.5)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p style={{ color: "var(--accent)" }} className="font-bold text-xs mb-0.5">
                          {language === "en" ? item.categoryName : (item.categoryName === "Biltong" ? "בילטונג" : item.categoryName === "Boerewors" ? "בוארווורס" : item.categoryName === "Drywors" ? "דרייוורס" : item.categoryName === "Jerky" ? "ג'רקי" : item.categoryName === "Chilli Bites" ? "ביטות צ'ילי" : item.categoryName === "Shots" ? "שוטות" : item.categoryName === "Sauces" ? "רטבים" : item.categoryName)}
                        </p>
                        <p style={{ color: "oklch(0.97 0.005 260)" }} className="font-bold text-xs">
                          {item.productName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="p-0.5 hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-3 h-3" style={{ color: "var(--accent)" }} />
                      </button>
                    </div>

                    {/* Size Selector */}
                    <div className="mb-1">
                      <select
                        value={item.size}
                        onChange={(e) => {
                          const newSize = e.target.value;
                          updateSize(item.id, item.size, newSize);
                        }}
                        className="w-full px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: "oklch(0.13 0.005 60)",
                          borderColor: "var(--accent)",
                          color: "oklch(0.97 0.005 260)",
                          border: "1px solid var(--accent)",
                        }}
                      >
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ backgroundColor: "oklch(0.13 0.005 60)", color: "oklch(0.97 0.005 260)" }}
                        >
                          −
                        </button>
                        <span style={{ color: "oklch(0.97 0.005 260)" }} className="w-6 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ backgroundColor: "oklch(0.13 0.005 60)", color: "oklch(0.97 0.005 260)" }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ color: "var(--accent)" }} className="font-bold text-xs">
                        ₪{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Section (Fixed) */}
          {items.length > 0 && (
            <div className="border-t p-3 space-y-2 flex-shrink-0" style={{ borderColor: "var(--accent)" }}>
              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === "en" ? "Name" : "שם"}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === "en" ? "Phone" : "טלפון"}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                />
              </div>

              {/* Delivery Area Dropdown */}
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-2 py-1.5 rounded text-xs font-bold"
                style={{
                  backgroundColor: "oklch(0.13 0.005 60)",
                  borderColor: "var(--accent)",
                  color: "oklch(0.97 0.005 260)",
                  border: "1px solid var(--accent)",
                }}
              >
                <option value="">{language === "en" ? "Select delivery area..." : "בחר אזור משלוח..."}</option>
                {deliveryZones.map((zone) => {
                  const zoneName = typeof zone.name === "string" ? zone.name : zone.name[language === "en" ? "en" : "he"];
                  const deliveryDays = zone.deliveryDays.length > 0 ? zone.deliveryDays.join(", ") : (language === "en" ? "By arrangement" : "לפי הסכמה");
                  let priceDisplay: string;
                  if (zone.price === -1) {
                    priceDisplay = language === "en" ? "(Please contact us)" : "(אנא צור איתנו קשר)";
                  } else if (zone.price === 0) {
                    priceDisplay = "(FREE)";
                  } else {
                    priceDisplay = `(₪${zone.price})`;
                  }
                  return (
                    <option key={zone.id} value={zone.id}>
                      {zoneName} {priceDisplay} - {deliveryDays}
                    </option>
                  );
                })}
              </select>
              {selectedZone && nextDeliveryDate && (
                <p style={{ color: "oklch(0.65 0.15 120)", fontSize: "0.75rem" }} className="mt-1">
                  {language === "en" ? "Next available delivery: " : "משלוח זמין הבא: "}
                  <strong>{formatDeliveryDate(nextDeliveryDate)}</strong>
                </p>
              )}

              {/* City & Address Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={language === "en" ? "City" : "עיר"}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === "en" ? "Address" : "כתובת"}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                />
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === "en" ? "Special requests..." : "בקשות מיוחדות..."}
                className="w-full px-2 py-1 rounded text-xs resize-none"
                rows={2}
                style={{
                  backgroundColor: "oklch(0.13 0.005 60)",
                  borderColor: "var(--accent)",
                  color: "oklch(0.97 0.005 260)",
                  border: "1px solid var(--accent)",
                }}
              />

              {/* Pricing Breakdown */}
              <div className="text-xs space-y-1 border-t pt-2" style={{ borderColor: "oklch(0.62 0.20 42 / 0.5)" }}>
                <div className="flex justify-between" style={{ color: "oklch(0.80 0.020 75)" }}>
                  <span>{language === "en" ? "Subtotal:" : "סה\"כ ביניים:"}</span>
                  <span>₪{subtotal}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between" style={{ color: "oklch(0.80 0.020 75)" }}>
                    <span>{language === "en" ? "Delivery:" : "משלוח:"}</span>
                    <span>+₪{deliveryFee}</span>
                  </div>
                )}
                {deliveryFee === 0 && selectedArea && (
                  <div className="flex justify-between" style={{ color: "oklch(0.65 0.15 120)" }}>
                    <span>{language === "en" ? "Delivery:" : "משלוח:"}</span>
                    <span>{language === "en" ? "FREE" : "חינם"}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold" style={{ color: "var(--accent)" }}>
                  <span>{language === "en" ? "Total:" : "סה\"כ:"}</span>
                  <span className="text-base">₪{total}</span>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-2 rounded font-bold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: "#25D366",
                  color: "#fff",
                }}
              >
                {language === "en" ? "Order on WhatsApp" : "הזמן ב-WhatsApp"}
              </button>

              {/* Clear Cart Button */}
              <button
                onClick={() => clearCart()}
                className="w-full py-1.5 rounded font-bold text-xs"
                style={{
                  backgroundColor: "oklch(0.21 0.006 285.885)",
                  color: "oklch(0.80 0.020 75)",
                  border: "1px solid var(--accent)",
                }}
              >
                {language === "en" ? "Clear Cart" : "נקה עגלה"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
