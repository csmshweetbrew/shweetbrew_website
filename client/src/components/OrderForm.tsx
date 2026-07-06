/*
 * SHWEETBREW ORDER FORM COMPONENT
 * Displays cart items and customer info, sends order via WhatsApp
 */

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { deliveryZones, getNextDeliveryDate, formatDeliveryDate } from "@/config/deliveryZones";
import { ArrowUp } from "lucide-react";

export default function OrderForm() {
  const { language } = useLanguage();
  const { items, subtotal, selectedArea, setSelectedArea, name, setName, phone, setPhone, notes, setNotes } = useCart();
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Calculate delivery fee and next delivery date from new deliveryZones config
  const selectedZone = deliveryZones.find((z) => z.id === selectedArea);
  const deliveryFee = selectedZone?.price || 0;
  const total = subtotal + deliveryFee;
  const nextDeliveryDate = selectedZone ? getNextDeliveryDate(selectedZone) : null;

  const handleSubmitOrder = () => {
    if (items.length === 0) {
      alert("Your cart is empty. Please add products first.");
      return;
    }

    if (!name || !phone) {
      alert("Please enter your name and phone number.");
      return;
    }

    if (!selectedArea) {
      alert("Please select a delivery area.");
      return;
    }

    const orderSummary = items
      .map((item) => `${item.categoryName} - ${item.productName} (${item.size}) x${item.quantity} - ₪${item.price * item.quantity}`)
      .join("\n");

    const fullShippingDetails = [city, address].filter(Boolean).join(", ");
    const zoneName = typeof selectedZone?.name === "string" ? selectedZone.name : selectedArea;
    const deliveryDays = selectedZone?.deliveryDays.join(", ") || "";
    const nextDeliveryDateStr = selectedZone?.id !== "zone_everywhere_else" && nextDeliveryDate ? formatDeliveryDate(nextDeliveryDate) : "";

    const message = [
      `*Shweet Brew Order*`,
      ``,
      `*Customer Details*`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      fullShippingDetails ? `Location: ${fullShippingDetails}` : "",
      `Delivery Zone: ${zoneName}${selectedZone?.id === "zone_everywhere_else" ? " (By arrangement)" : ` (${deliveryDays})`}`,
      nextDeliveryDateStr ? `Next Delivery: ${nextDeliveryDateStr}` : selectedZone?.id === "zone_everywhere_else" ? "Delivery: By arrangement - Please contact us for pricing and dates" : "",
      ``,
      `*Order Items*`,
      orderSummary,
      ``,
      `*Subtotal: ₪${subtotal}*`,
      deliveryFee === -1 ? "*Delivery Fee: By arrangement*" : deliveryFee > 0 ? `*Delivery Fee: ₪${deliveryFee}*` : "*Pickup - FREE*",
      deliveryFee === -1 ? "*Total: By arrangement*" : `*Total: ₪${total}*`,
      ``,
      notes ? `*Special Requests:*\n${notes}` : "",
      ``,
      `Please confirm and arrange delivery/pickup.`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(getWhatsAppLink(message), "_blank");
  };

  const handleAddProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="order"
      className="py-16 px-4"
      style={{
        backgroundColor: "oklch(0.13 0.005 60)",
        borderTop: "3px solid var(--accent)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "oklch(0.97 0.005 260)",
              letterSpacing: "0.05em",
            }}
          >
            {translations.checkout.title[language]}
          </h2>
          <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-base md:text-lg">
            {translations.checkout.reviewYourOrder[language]}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="space-y-6">
            {/* Order Summary */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                borderColor: "oklch(0.62 0.20 42 / 0.5)",
              }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: "oklch(0.97 0.005 260)",
                  letterSpacing: "0.05em",
                }}
              >
                {translations.checkout.orderSummary[language]}
              </h3>

              <div className="space-y-3 mb-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderLeft: "3px solid var(--accent)",
                    }}
                  >
                    <div>
                      <p style={{ color: "var(--accent)" }} className="font-bold text-xs mb-1">
                        {item.categoryName}
                      </p>
                      <p style={{ color: "oklch(0.97 0.005 260)" }} className="font-bold text-sm">
                        {item.productName}
                      </p>
                      <p style={{ color: "oklch(0.80 0.020 75)" }} className="text-xs">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p style={{ color: "var(--accent)" }} className="font-bold">
                      ₪{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div
                className="pt-4 border-t space-y-2"
                style={{ borderColor: "oklch(0.62 0.20 42 / 0.5)" }}
              >
                <div className="flex justify-between" style={{ color: "oklch(0.80 0.020 75)" }}>
                  <span>{translations.checkout.subtotal[language]}</span>
                  <span>₪{subtotal}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between" style={{ color: "oklch(0.80 0.020 75)" }}>
                    <span>{translations.checkout.delivery[language]}</span>
                    <span>+₪{deliveryFee}</span>
                  </div>
                )}
                {deliveryFee === 0 && selectedArea && (
                  <div className="flex justify-between" style={{ color: "oklch(0.65 0.15 120)" }}>
                    <span>{translations.checkout.delivery[language]}</span>
                    <span>{language === "en" ? "FREE" : "חינם"}</span>
                  </div>
                )}
                <div
                  className="flex justify-between text-lg font-bold pt-2"
                  style={{
                    color: "var(--accent)",
                    borderTop: "1px solid oklch(0.62 0.20 42 / 0.5)",
                  }}
                >
                  <span>{translations.checkout.total[language]}</span>
                  <span>₪{total}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div
              className="p-6 rounded-lg border space-y-4"
              style={{
                backgroundColor: "oklch(0.21 0.006 285.885)",
                borderColor: "oklch(0.62 0.20 42 / 0.5)",
              }}
            >
              <h3
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: "oklch(0.97 0.005 260)",
                  letterSpacing: "0.05em",
                }}
              >
                {translations.checkout.yourDetails[language]}
              </h3>

              {/* Full Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-bold mb-1"
                    style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                  >
                    {translations.checkout.fullName[language]} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                      border: "1px solid var(--accent)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold mb-1"
                    style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                  >
                    {translations.checkout.phone[language]} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone"
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                      border: "1px solid var(--accent)",
                    }}
                  />
                </div>
              </div>

              {/* Delivery Area */}
              <div>
                <label
                  className="block text-xs font-bold mb-1"
                  style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                >
                  {translations.checkout.deliveryArea[language]} *
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  <option value="">{translations.checkout.selectDeliveryArea[language]}...</option>
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
                {selectedZone && nextDeliveryDate && selectedZone.id !== "zone_everywhere_else" && (
                  <p style={{ color: "oklch(0.65 0.15 120)", fontSize: "0.875rem" }} className="mt-2">
                    {language === "en" ? "Next available delivery: " : "משלוח זמין הבא: "}
                    <strong>{formatDeliveryDate(nextDeliveryDate)}</strong>
                  </p>
                )}
                {selectedZone && selectedZone.id === "zone_everywhere_else" && (
                  <p style={{ color: "oklch(0.65 0.15 120)", fontSize: "0.875rem" }} className="mt-2">
                    {language === "en" ? "Delivery by arrangement - Contact us for pricing and delivery dates" : "משלוח לפי הסכמה - צור איתנו קשר לתמחור ותאריכי משלוח"}
                  </p>
                )}
              </div>

              {/* City & Address Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-bold mb-1"
                    style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                  >
                    {translations.checkout.city[language]}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                      border: "1px solid var(--accent)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold mb-1"
                    style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                  >
                    {translations.checkout.address[language]}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    className="w-full px-3 py-2 rounded text-sm"
                    style={{
                      backgroundColor: "oklch(0.13 0.005 60)",
                      borderColor: "var(--accent)",
                      color: "oklch(0.97 0.005 260)",
                      border: "1px solid var(--accent)",
                    }}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label
                  className="block text-xs font-bold mb-1"
                  style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.05em" }}
                >
                  {translations.checkout.specialRequests[language]}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  className="w-full px-3 py-2 rounded text-sm resize-none"
                  rows={3}
                  style={{
                    backgroundColor: "oklch(0.13 0.005 60)",
                    borderColor: "var(--accent)",
                    color: "oklch(0.97 0.005 260)",
                    border: "1px solid var(--accent)",
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                className="w-full py-3 rounded font-bold text-sm transition-all"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "oklch(0.13 0.005 60)",
                  letterSpacing: "0.05em",
                }}
              >
                {translations.checkout.completeOrder[language]}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-8 rounded-lg border text-center"
            style={{
              backgroundColor: "oklch(0.21 0.006 285.885)",
              borderColor: "oklch(0.62 0.20 42 / 0.5)",
            }}
          >
            <p style={{ color: "oklch(0.80 0.020 75)" }} className="mb-6">
              {translations.checkout.cartEmpty[language]}
            </p>
            <button
              onClick={handleAddProducts}
              className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition-all"
              style={{
                backgroundColor: "var(--accent)",
                color: "oklch(0.13 0.005 60)",
                letterSpacing: "0.05em",
              }}
            >
              <ArrowUp className="w-4 h-4" />
              {translations.checkout.addProducts[language]}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
