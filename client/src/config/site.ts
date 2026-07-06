/*
 * SHWEETBREW SITE CONFIGURATION
 * Central configuration for contact details, delivery zones, and site-wide settings
 */

export const SITE_CONFIG = {
  name: "Shweet Brew",
  tagline: "Authentic South African biltong, boerewors & more — made with Israeli pride and SA soul.",
  
  // Contact Details
  contact: {
    whatsapp: "+972584132576", // WhatsApp number (with country code)
    whatsappDisplay: "058 413 2576", // Display format
    email: "shweetbrew@gmail.com",
    phone: "+972584132576",
  },

  // Social Links
  social: {
    instagram: "https://instagram.com/shweetbrew",
    facebook: "https://facebook.com/shweetbrew",
    tiktok: "https://tiktok.com/@shweetbrew",
  },

  // Delivery Zones
  deliveryZones: [
    {
      name: "Modiin (HQ)",
      daysMin: 0,
      daysMax: 1,
      fee: 0,
      label: "Same day / Next day",
      icon: "🏠",
    },
    {
      name: "Tel Aviv & Gush Dan",
      daysMin: 1,
      daysMax: 2,
      fee: 20,
      label: "1–2 days",
      icon: "🌆",
    },
    {
      name: "Jerusalem",
      daysMin: 1,
      daysMax: 2,
      fee: 25,
      label: "1–2 days",
      icon: "🕍",
    },
    {
      name: "Haifa & North",
      daysMin: 2,
      daysMax: 3,
      fee: 30,
      label: "2–3 days",
      icon: "⛵",
    },
    {
      name: "Beer Sheva & South",
      daysMin: 2,
      daysMax: 3,
      fee: 30,
      label: "2–3 days",
      icon: "🌵",
    },
    {
      name: "Everywhere Else",
      daysMin: 2,
      daysMax: 5,
      fee: null, // Variable
      label: "Varies",
      icon: "📍",
    },
  ],

  // Delivery Info
  delivery: {
    minimumOrder: 80, // NIS
    minimumOrderPickup: 0, // NIS
    orderCutoff: "12pm", // For same-day delivery in Modiin
    paymentMethods: ["Cash", "Bank Transfer", "Bit"],
    pickupAvailable: true,
    pickupLocation: "Modiin",
  },

  // About Us
  about: {
    headline: "The Shweet Brew Story: Flavours with a Vibe",
    story: `It started with a simple obsession: why settle for fine when you can have legendary?

At Shweet Brew, we believe that food should be an experience, not just a snack. We're not just making food; we're crafting the fuel for your next adventure, your weekend sundowners, and those late-night kitchen raids. Our story is rooted in authenticity, a dash of rebellion, and a whole lot of soul.

The Craft Behind the Yum

We take our meat seriously so you don't have to. Our Biltong, Boerewors, and Jerky aren't mass-produced in a nameless factory. They are the result of precision, patience, and a deep respect for tradition.

• Authentic Roots: We use time-honored methods and the finest cuts to ensure every bite of biltong carries that rich, deep flavor you crave.
• The Sizzle: Our Boerewors is packed with the perfect spice blend—no fillers, no nonsense—just the snap and juice of a real, premium sausage.
• The Edge: Our Jerky and signature Sauces are where we let our creativity run wild, balancing heat, sweet, and tang to create something truly addictive.

What's in a Name? (The Shweet Spot)

You might be wondering: What is a Shweet Brew? In our world, Shweet is more than just a word—it's a state of mind. It's that feeling when the music is right, the company is better, and the food is perfect. It's the sweet life with a sharp edge.

The Brew represents the magic that happens when you mix passion with process. Whether it's the slow-drying of our meats or the careful infusion of our sauces, everything we do is brewed to perfection.

Fun, Funky, and Unapologetically Bold

We don't do boring. From our kitchen to your table, Shweet Brew is about a funky, vibey energy. We think food tastes better when it's made by people who love what they do and aren't afraid to push the boundaries of flavor.

When you see the Shweet Brew label, you know you're getting:
1. Uncompromising Quality: Authentic ingredients and artisanal methods.
2. Bold Innovation: Funky flavor profiles you won't find anywhere else.
3. Good Times Only: Products designed to be shared, celebrated, and enjoyed.

Everything is good. Everything is Shweet. Welcome to the family. Grab a bag, fire up the grill, and let's get the vibe going.`,
    values: [
      { icon: "🥩", title: "100% Beef", description: "No fillers, no nonsense" },
      { icon: "✡", title: "Kosher Options", description: "Certified & available" },
      { icon: "🇿🇦", title: "Authentic Recipes", description: "Straight from SA" },
      { icon: "🇮🇱", title: "Israeli Pride", description: "Made with love in Israel" },
    ],
  },

  // Order Form
  orderForm: {
    minimumProducts: 1,
    successMessage: "Order sent! We'll confirm via WhatsApp within 1 hour.",
  },
};

// Helper functions
export function getWhatsAppLink(message?: string): string {
  const encoded = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^\d]/g, "")}${message ? `?text=${encoded}` : ""}`;
}

export function getDeliveryZoneByName(name: string) {
  return SITE_CONFIG.deliveryZones.find((z) => z.name === name);
}
