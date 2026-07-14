/*
 * SHWEETBREW PRODUCT CONFIGURATION
 * Centralized product registry system - easily add/remove products by managing the PRODUCT_REGISTRY
 * 
 * HOW TO ADD/REMOVE PRODUCTS:
 * 1. Define product data in PRODUCT_REGISTRY below
 * 2. Add translations to languages.ts for the product ID
 * 3. To remove a product, simply delete or comment out its entry in PRODUCT_REGISTRY
 * 4. All product mappings will automatically update
 */

import { translations } from "./languages";

export type Language = "en" | "he";

export type SizeOption = {
  size: string;
  weight: string;
  price: number; // in NIS
};

export type Nutrition = {
  protein: string;
  fat: string;
  carbs: string;
  calories: string;
};

export type ProductVariant = {
  id: string;
  name: string; // e.g., "Traditional", "Teriyaki"
  description: string;
  tagline: string;
  image: string;
  spiceLevel: number; // 1-5 (1 = mild, 5 = nuclear)
  isKosher: boolean;
  isAvailable?: boolean; // defaults to true
  unavailableReason?: string; // reason for unavailability
  sizes: SizeOption[];
  nutrition?: Nutrition;
  ingredients?: string;
  allergens?: string;
};

export type ProductCategory = {
  id: string;
  name: string; // e.g., "Biltong", "Drywors"
  description: string;
  image: string;
  variants: ProductVariant[];
};

// ============================================================================
// PRODUCT IMAGES - Define all product images here
// ============================================================================
const BILTONG_IMG = "/manus-storage/biltong-image_8b84022b.png";
const BOEREWORS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/shweetbrew-boerewors-HH3YRHnsYSGBPy5kcrdoBT.webp";
const SHOTS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/shweetbrew-shots-Hb6gfTMf6mhbGddvFT325c.webp";
const DRYWORS_IMG = "/manus-storage/Gemini_Generated_Image_1z1zlf1z1zlf1z1z_6a6c0aa1.png";
const CHILLI_BITES_IMG = "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80";
const CHILLI_SAUCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/shweetbrew_sweet_chili_sauce_1_fec07e64.jpeg";
const HOLY_LAND_JERKY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491314336/GHvX6FS9zEwj9cBKkXQgeg/shweetbrew_jerky_8e61172e.jpeg";

// ============================================================================
// PRODUCT REGISTRY - Add/remove products here
// Format: { categoryId, categoryName, description, image, variants: [...] }
// To remove a product category, simply comment out or delete its entry
// ============================================================================
const PRODUCT_REGISTRY = [
  {
    categoryId: "biltong",
    categoryName: "Biltong",
    description: "Authentic South African air-dried beef biltong",
    image: BILTONG_IMG,
    variants: [
      {
        id: "biltong-traditional",
        name: "Traditional",
        description: "Air-dried beef biltong made to the original SA recipe. Spiced with coriander, black pepper, and vinegar.",
        tagline: "The OG. The Legend.",
        image: BILTONG_IMG,
        spiceLevel: 0,
        isKosher: true,
        isAvailable: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "51g",
          fat: "8g",
          carbs: "1g",
          calories: "260",
        },
      },
      {
        id: "biltong-teriyaki",
        name: "Teriyaki",
        description: "Sweet, savoury, and slightly sticky. Teriyaki-spiced biltong that bridges South African tradition with Asian flavours.",
        tagline: "East meets braai.",
        image: BILTONG_IMG,
        spiceLevel: 0,
        isKosher: true,

        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "51g",
          fat: "8g",
          carbs: "1g",
          calories: "260",
        },
      },
      {
        id: "biltong-sweet-chilli",
        name: "Sweet Chilli",
        description: "Sweet heat with a kick. Perfect for those who want flavour without going full nuclear.",
        tagline: "Sweet with a bite.",
        image: BILTONG_IMG,
        spiceLevel: 2,
        isKosher: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "51g",
          fat: "8g",
          carbs: "1g",
          calories: "260",
        },
      },
      {
        id: "biltong-chilli",
        name: "Chilli",
        description: "For the brave. Seriously spiced biltong that'll make your taste buds stand at attention.",
        tagline: "Not for the faint-hearted.",
        image: BILTONG_IMG,
        spiceLevel: 4,
        isKosher: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "51g",
          fat: "8g",
          carbs: "1g",
          calories: "260",
        },
      },
    ],
  },
  {
    categoryId: "boerewors",
    categoryName: "Boerewors",
    description: "Authentic South African sausage — the braai essential",
    image: BOEREWORS_IMG,
    variants: [
      {
        id: "boerewors-classic",
        name: "Classic",
        description: "The classic South African style sausage. Coiled beef sausage spiced with coriander, coarse salt and black pepper. Ready to grill. Go on, make yourself a delicious Boerie Roll.",
        tagline: "The braai essential.",
        image: BOEREWORS_IMG,
        spiceLevel: 0,
        isKosher: true,
        sizes: [
          { size: "500g", weight: "500g", price: 85 },
          { size: "1kg", weight: "1kg", price: 150 },
        ],
        nutrition: {
          protein: "18g",
          fat: "21g",
          carbs: "2g",
          calories: "280",
        },
      },
    ],
  },
  {
    categoryId: "drywors",
    categoryName: "Drywors",
    description: "Thin, dried beef sausage — the ultimate road-trip snack",
    image: DRYWORS_IMG,
    variants: [
      {
        id: "drywors-classic",
        name: "Classic",
        description: "Thin, dried beef wors — the ultimate road-trip snack. Spiced just right. Dangerously addictive. Classic South African style sausage, dried to perfection.",
        tagline: "Snack. Anywhere. Always.",
        image: DRYWORS_IMG,
        spiceLevel: 0,
        isKosher: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "50g",
          fat: "8g",
          carbs: "1g",
          calories: "280",
        },
      },
    ],
  },
  {
    categoryId: "HOLY LAND JERKY",
    categoryName: "Holy Land Jerky",
    description: "Experience the perfect balance of tradition and craft. Holy Land Jerky, by Shweet Brew, delivers authentic jerky flavors and premium quality in every bite.",
    image: HOLY_LAND_JERKY_IMG,
    variants: [
      {
        id: "holy-land-jerky-cowboy",
        name: "Traditional Cowboy",
        description: "The rugged classic. Soya sauce, salt and pepper with hints of onion and garlic.",
        tagline: "The classic that started it all.",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 0,
        isKosher: false,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "38g",
          fat: "25g",
          carbs: "10g",
          calories: "410",
        },
      },
      {
        id: "holy-land-jerky-teriyaki",
        name: "Teriyaki",
        description: "A savory-sweet glazed favorite.",
        tagline: "Sweet meets savory.",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 0,
        isKosher: false,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "50g",
          fat: "8g",
          carbs: "5g",
          calories: "300",
        },
      },
      {
        id: "holy-land-jerky-sweet-chilli",
        name: "Sweet Chilli",
        description: "The perfect blend of sweet and heat.",
        tagline: "Sweet Heat. Bold Bite",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 2,
        isKosher: false,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "52g",
          fat: "7.5g",
          carbs: "4g",
          calories: "290",
        },
      },
      {
        id: "holy-land-jerky-chilli",
        name: "Chilli",
        description: "For those who crave a serious, authentic burn.",
        tagline: "Serious heat. Serious flavor.",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 4,
        isKosher: false,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "53g",
          fat: "6.5g",
          carbs: "1g",
          calories: "270",
        },
      },
      {
        id: "holy-land-jerky-chicken-sweet-chilli",
        name: "Sweet Chilli Chicken Jerky",
        description: "Lean, protein-packed chicken jerky with a perfect blend of sweet heat and authentic braai spices.",
        tagline: "Lean Heat. Protein Packed.",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 2,
        isKosher: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "58g",
          fat: "3g",
          carbs: "2g",
          calories: "245",
        },
      },
      {
        id: "holy-land-jerky-chicken-teriyaki",
        name: "Teriyaki Chicken Jerky",
        description: "Lean, protein-packed chicken jerky with a savory-sweet teriyaki glaze and authentic braai spices.",
        tagline: "Sweet Savory. Protein Packed.",
        image: HOLY_LAND_JERKY_IMG,
        spiceLevel: 0,
        isKosher: true,
        sizes: [
          { size: "250g", weight: "250g", price: 100 },
          { size: "500g", weight: "500g", price: 185 },
          { size: "1kg", weight: "1kg", price: 360 },
        ],
        nutrition: {
          protein: "57g",
          fat: "3g",
          carbs: "3g",
          calories: "250",
        },
      },
    ],
  },

  {
    categoryId: "SHOTS",
    categoryName: "Shots",
    description: "Vodka infused with chilli, cinnamon, and vanilla. The shot that starts the braai and ends the night.",
    image: SHOTS_IMG,
    variants: [
      {
        id: "shweetbrew-shots",
        name: "Shweet Brew Shots",
        description: "Vodka infused with chilli, cinnamon, and vanilla. The shot that starts the braai and ends the night. Serve ice cold.",
        tagline: "Chilli. Cinnamon. Vanilla. Chaos.",
        image: SHOTS_IMG,
        spiceLevel: 4,
        isKosher: true,
        sizes: [
          { size: "550ml", weight: "550ml", price: 60 },
        ],
        nutrition: {
          protein: "0g",
          fat: "0g",
          carbs: "2g",
          calories: "110",
        },
      },
    ],
  },
  {
    categoryId: "sauces",
    categoryName: "Sauces",
    description: "House-made chilli sauce — put it on everything",
    image: CHILLI_SAUCE_IMG,
    variants: [
      {
        id: "chilli-sauce",
        name: "Sweet Chilli Sauce",
        description: "House-made sweet chilli sauce. Thick, fiery, and deeply flavoured. Good with biltong, eggs, your finger — honestly anything.",
        tagline: "Put it on everything.",
        image: CHILLI_SAUCE_IMG,
        spiceLevel: 2,
        isKosher: true,
        sizes: [
          { size: "130ml", weight: "130ml", price: 15 },
          { size: "250ml", weight: "250ml", price: 35 },
          { size: "500ml", weight: "500ml", price: 60 },
        ],
        nutrition: {
          protein: "1g",
          fat: "0.5g",
          carbs: "8g",
          calories: "35",
        },
      },
    ],
  },
];

// ============================================================================
// AUTO-GENERATED PRODUCTS ARRAY - Do not edit manually
// This is automatically generated from PRODUCT_REGISTRY
// ============================================================================
export const PRODUCTS: ProductCategory[] = PRODUCT_REGISTRY.map((product) => ({
  id: product.categoryId,
  name: product.categoryName,
  description: product.description,
  image: product.image,
  variants: product.variants,
}));

// ============================================================================
// HELPER FUNCTIONS - Automatically work with all products in PRODUCT_REGISTRY
// ============================================================================

export function getSpiceFlames(spiceLevel: number): string {
  if (spiceLevel === 0) {
    return "Mild";
  }
  
  const fullFlames = Math.floor(spiceLevel);
  const hasHalfFlame = spiceLevel % 1 === 0.5;
  
  let result = "🔥".repeat(fullFlames);
  if (hasHalfFlame) {
    result += "🔥";
  }
  
  return result;
}

export function getTranslatedProductName(variantId: string, language: Language): string {
  const translationMap: Record<string, Record<Language, string>> = {};

  // Auto-generate translation map from PRODUCT_REGISTRY
  PRODUCT_REGISTRY.forEach((product) => {
    product.variants.forEach((variant) => {
      translationMap[variant.id] = {
        en: variant.name,
        he: (translations.products as any)[variant.id]?.he || variant.name,
      };
    });
  });

  return translationMap[variantId]?.[language] || "";
}

export function getTranslatedProductDescription(variantId: string, language: Language): string {
  const translationMap: Record<string, Record<Language, string>> = {
    "biltong-traditional": translations.products.biltongTraditionalDesc,
    "biltong-teriyaki": translations.products.biltongTeriyakiDesc,
    "biltong-sweet-chilli": translations.products.sweetChilliDesc,
    "biltong-chilli": translations.products.biltongChilliDesc,
    "biltong-wasabi": translations.products.wasabiDesc,
    "boerewors-classic": translations.products.boereworsClassicDesc,
    "drywors-classic": translations.products.dryworClassicDesc,
    "holy-land-jerky-cowboy": translations.products.holyLandJerkyCowboyDesc,
    "holy-land-jerky-teriyaki": translations.products.holyLandJerkyTeriyakiDesc,
    "holy-land-jerky-sweet-chilli": translations.products.holyLandJerkySweetChilliDesc,
    "holy-land-jerky-chilli": translations.products.holyLandJerkyChilliDesc,
    "chilli-bites": translations.products.chilliBitesDesc,
    "shweetbrew-shots": translations.products.shotsDesc,
    "chilli-sauce": translations.products.chilliSauceDesc,
  };
  return translationMap[variantId]?.[language] || "";
}

export function getTranslatedProductTagline(variantId: string, language: Language): string {
  const translationMap: Record<string, Record<Language, string>> = {
    "biltong-traditional": translations.products.biltongTraditionalTagline,
    "biltong-teriyaki": translations.products.biltongTeriyakiTagline,
    "biltong-sweet-chilli": translations.products.sweetChilliTagline,
    "biltong-chilli": translations.products.biltongChilliTagline,
    "biltong-wasabi": translations.products.wasabiTagline,
    "boerewors-classic": translations.products.boereworsClassicTagline,
    "drywors-classic": translations.products.dryworClassicTagline,
    "holy-land-jerky-cowboy": translations.products.holyLandJerkyCowboyTagline,
    "holy-land-jerky-teriyaki": translations.products.holyLandJerkyTeriyakiTagline,
    "holy-land-jerky-sweet-chilli": translations.products.holyLandJerkySweetChilliTagline,
    "holy-land-jerky-chilli": translations.products.holyLandJerkyChilliTagline,
    "chilli-bites": translations.products.chilliBitesTagline,
    "shweetbrew-shots": translations.products.shotsTagline,
    "chilli-sauce": translations.products.chilliSauceTagline,
  };
  return translationMap[variantId]?.[language] || "";
}

export function getCategoryNameHebrew(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    "BILTONG": "בילטונג",
    "BOEREWORS": "בוארווורס",
    "DRYWORS": "דרייוורס",
    "HOLY LAND JERKY": "ג'רקי הארץ הקדושה",
    "CHILLI BITES": "ביטות צ'ילי",
    "DOPPE": "שטיות",
    "SAUCES": "רטבים",
  };
  return categoryMap[categoryName] || categoryName;
}

export function getTranslatedIngredients(variantId: string, language: Language): string {
  const ingredientsMap: Record<string, Record<Language, string>> = {
    "biltong-traditional": { en: "Premium beef, salt, coriander, black pepper, vinegar, garlic, and spices.", he: "בשר בקר פרימיום, מלח, כוסברה, פלפל שחור, חומץ, שום ותבלינים." },
    "biltong-teriyaki": { en: "Premium beef, teriyaki sauce, soy sauce, ginger, garlic, and spices.", he: "בשר בקר פרימיום, רטב טריאקי, רטב סויה, ג'ינג'ר, שום ותבלינים." },
    "biltong-sweet-chilli": { en: "Premium beef, sweet chilli seasoning, garlic, and spices.", he: "בשר בקר פרימיום, תיבול צ'ילי מתוק, שום ותבלינים." },
    "biltong-chilli": { en: "Premium beef, chilli powder, black pepper, garlic, and spices.", he: "בשר בקר פרימיום, אבקת צ'ילי, פלפל שחור, שום ותבלינים." },
    "biltong-wasabi": { en: "Premium beef, wasabi powder, ginger, garlic, and spices.", he: "בשר בקר פרימיום, אבקת וואסבי, ג'ינג'ר, שום ותבלינים." },
    "boerewors-classic": { en: "Premium beef, coriander, cloves, nutmeg, garlic, and spices.", he: "בשר בקר פרימיום, כוסברה, ציפורנים, גוזנוג, שום ותבלינים." },
    "drywors-classic": { en: "Premium beef, coriander, black pepper, garlic, and spices.", he: "בשר בקר פרימיום, כוסברה, פלפל שחור, שום ותבלינים." },
    "holy-land-jerky-cowboy": { en: "Premium beef, salt, black pepper, onion powder, garlic powder, and spices.", he: "בשר בקר פרימיום, מלח, פלפל שחור, אבקט בצל, אבקט שום ותבלינים." },
    "holy-land-jerky-teriyaki": { en: "Premium beef, teriyaki sauce, soy sauce, ginger, garlic, and spices.", he: "בשר בקר פרימיום, רטב טריאקי, רטב סויה, ג'ינג'ר, שום ותבלינים." },
    "holy-land-jerky-sweet-chilli": { en: "Premium beef, sweet chilli seasoning, honey, garlic, and spices.", he: "בשר בקר פרימיום, תיבול צ'ילי מתוק, דבש, שום ותבלינים." },
    "holy-land-jerky-chilli": { en: "Premium beef, chilli powder, cayenne pepper, black pepper, garlic, and spices.", he: "בשר בקר פרימיום, אבקט צ'ילי, פלפל קיינה, פלפל שחור, שום ותבלינים." },
    "chilli-bites": { en: "Premium beef, chilli powder, black pepper, garlic, and spices.", he: "בשר בקר פרימיום, אבקט צ'ילי, פלפל שחור, שום ותבלינים." },
    "shweetbrew-shots": { en: "Vodka, chilli, cinnamon, vanilla, and natural flavors.", he: "וודקה, צ'ילי, קינמון, ניל וטעמים טבעיים." },
    "chilli-sauce": { en: "Red chillies, garlic, vinegar, salt, and spices.", he: "צ'ילי אדום, שום, חומץ, מלח ותבלינים." },
  };
  return ingredientsMap[variantId]?.[language] || "";
}

export function getTranslatedAllergens(variantId: string, language: Language): string {
  const allergensMap: Record<string, Record<Language, string>> = {
    "biltong-traditional": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "biltong-teriyaki": { en: "Contains soy. May contain traces of nuts.", he: "מכיל סויה. עלול להכיל עקבות של אגוזים." },
    "biltong-sweet-chilli": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "biltong-chilli": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "biltong-wasabi": { en: "May contain traces of nuts, soy, and sesame.", he: "עלול להכיל עקבות של אגוזים, סויה וסומסום." },
    "boerewors-classic": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "drywors-classic": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "holy-land-jerky-cowboy": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "holy-land-jerky-teriyaki": { en: "Contains soy. May contain traces of nuts and sesame.", he: "מכיל סויה. עלול להכיל עקבות של אגוזים וסומסום." },
    "holy-land-jerky-sweet-chilli": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "holy-land-jerky-chilli": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "chilli-bites": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
    "shweetbrew-shots": { en: "Contains alcohol. May contain traces of nuts.", he: "מכיל אלכוהול. עלול להכיל עקבות של אגוזים." },
    "chilli-sauce": { en: "May contain traces of nuts and soy.", he: "עלול להכיל עקבות של אגוזים וסויה." },
  };
  return allergensMap[variantId]?.[language] || "";
}

export function getAvailableSizes(categoryName: string, productName: string): string[] {
  const product = PRODUCTS.find((cat) => cat.name === categoryName);
  if (!product) return [];
  const variant = product.variants.find((v) => v.name === productName);
  return variant ? variant.sizes.map((s) => s.size) : [];
}
