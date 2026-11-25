/*
 * SHWEETBREW DELIVERY ZONES CONFIGURATION
 * 7-zone delivery system for Israel
 * We make everything on Wednesday; orders close on Tuesday 12:00 (business owner, 2026-11-25).
 *
 * The next delivery: find the Wednesday this order makes (this week's until Tuesday
 * 12:00, then next week's), then the area's first delivery day AFTER that Wednesday.
 * Jerusalem and Shfela can go out that same Wednesday (business owner, 2026-11-25).
 * Days and hours are Israel's, wherever the visitor is.
 */

export interface DeliveryZone {
  id: string;
  name: string;
  cities: string[];
  price: number;
  deliveryDays: string[];
  specialRules?: string;
  icon: string;
}

/**
 * South and Kiryat Gat: every second Monday, counted from this one. The business owner
 * let us pick the start (2026-11-25), so the checkout adds "Delivery date to be confirmed".
 */
const SECOND_MONDAY_START = "2026-12-07";

/** Areas that get their order on the Wednesday it's made; the others wait for a later day */
const SAME_WEDNESDAY = ["zone_4_jerusalem", "zone_3_shfela"];

export const PRODUCTION_DAY = 3; // 0=Sunday, 3=Wednesday
/** Orders close the day before, at 12:00 */
export const CUTOFF_HOUR = 12;

export const deliveryZones: DeliveryZone[] = [
  // MODIIN (HQ) - FREE PICKUP OR SAME DAY
  {
    id: "modiin",
    name: "Modiin (HQ)",
    cities: ["Modiin"],
    price: 0,
    deliveryDays: ["Today"],
    icon: "🏠",
  },

  // ZONE 1 - TEL AVIV AREA (₪65)
  {
    id: "zone_1_tel_aviv",
    name: "Tel Aviv Area",
    cities: [
      "Tel Aviv",
      "Ramat Gan",
      "Givatayim",
      "Petach Tikva",
      "Holon",
      "Bat Yam",
      "Jaffa",
      "Rishon LeZion",
      "Lod",
      "Rehovot",
      "Yavne",
    ],
    price: 65,
    deliveryDays: ["Tuesday", "Thursday"],
    icon: "🌆",
  },

  // ZONE 2 - HASHARON AREA (₪55)
  {
    id: "zone_2_hasharon",
    name: "Hasharon Area",
    cities: [
      "Ra'anana",
      "Kfar Saba",
      "Hod HaSharon",
      "Herzliya",
      "Kfar Yona",
    ],
    price: 55,
    deliveryDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    // Tel Mond, Even Yehuda and Netanya are North only (owner, 2026-11-23)
    icon: "🌊",
  },

  // ZONE 3 - SHFELA (₪80)
  {
    id: "zone_3_shfela",
    name: "Shfela",
    cities: ["Shoham", "Rosh HaAyin", "Gedera"],
    price: 80,
    deliveryDays: ["Tuesday", "Wednesday", "Thursday"],
    icon: "📍",
  },

  // ZONE 4 - JERUSALEM AREA (₪90)
  {
    id: "zone_4_jerusalem",
    name: "Jerusalem Area",
    cities: ["Jerusalem", "Beit Shemesh", "Hashmonaim", "Efrat", "Gush Etzion"],
    price: 90,
    deliveryDays: ["Wednesday"],
    icon: "🕍",
  },

  // ZONE 5 - NORTH (₪95)
  {
    id: "zone_5_north",
    name: "North",
    cities: [
      "Tel Mond",
      "Even Yehuda",
      "Netanya",
      "Zichron Yaakov",
      "Hadera",
      "Pardes Chana",
      "Binyamina",
      "Caesarea",
      "Harish",
      "Haifa",
      "Yokneam",
    ],
    price: 95,
    deliveryDays: ["Monday"],
    icon: "⛵",
  },

  // ZONE 6 - SOUTH (₪90)
  {
    id: "zone_6_south",
    name: "South",
    cities: ["Ashdod", "Ashkelon", "Yad Binyamin"], // Gedera is Shfela only (owner, 2026-11-23)
    price: 90,
    deliveryDays: ["Every second Monday"],
    specialRules: "Bi-weekly delivery - Every second Monday",
    icon: "🌵",
  },

  // ZONE 7 - KIRYAT GAT (₪115)
  {
    id: "zone_7_kiryat_gat",
    name: "Kiryat Gat",
    cities: ["Kiryat Gat"],
    price: 115,
    deliveryDays: ["Every second Monday"],
    specialRules: "Bi-weekly delivery - Every second Monday",
    icon: "🌵",
  },

  // EVERYWHERE ELSE
  {
    id: "zone_everywhere_else",
    name: "Everywhere Else",
    cities: [],
    price: -1, // -1 indicates "Please contact us"
    deliveryDays: [],
    specialRules: "Delivery by arrangement - Please contact us for pricing",
    icon: "📍",
  },
];

// ---------------------------------------------------------------------------
// HEBREW NAMES
// Area names, towns (same order as `cities` above) and delivery days in Hebrew.
// When you add a zone or a town above, add its Hebrew name here too.
// ---------------------------------------------------------------------------
const ZONES_HE: Record<string, { name: string; cities: string[] }> = {
  modiin: { name: "מודיעין (מטה)", cities: ["מודיעין"] },
  zone_1_tel_aviv: {
    name: "אזור תל אביב",
    cities: ["תל אביב", "רמת גן", "גבעתיים", "פתח תקווה", "חולון", "בת ים", "יפו", "ראשון לציון", "לוד", "רחובות", "יבנה"],
  },
  zone_2_hasharon: {
    name: "אזור השרון",
    cities: ["רעננה", "כפר סבא", "הוד השרון", "הרצליה", "כפר יונה"],
  },
  zone_3_shfela: { name: "שפלה", cities: ["שוהם", "ראש העין", "גדרה"] },
  zone_4_jerusalem: { name: "אזור ירושלים", cities: ["ירושלים", "בית שמש", "חשמונאים", "אפרת", "גוש עציון"] },
  zone_5_north: {
    name: "צפון",
    cities: ["תל מונד", "אבן יהודה", "נתניה", "זכרון יעקב", "חדרה", "פרדס חנה", "בנימינה", "קיסריה", "חריש", "חיפה", "יקנעם"],
  },
  zone_6_south: { name: "דרום", cities: ["אשדוד", "אשקלון", "יד בנימין"] },
  zone_7_kiryat_gat: { name: "קריית גת", cities: ["קריית גת"] },
  zone_everywhere_else: { name: "מקום אחר", cities: [] },
};

const DAYS_HE: Record<string, string> = {
  Today: "היום",
  Sunday: "ראשון",
  Monday: "שני",
  Tuesday: "שלישי",
  Wednesday: "רביעי",
  Thursday: "חמישי",
  Friday: "שישי",
  "Every second Monday": "שני, פעם בשבועיים",
};

type Lang = "en" | "he";

/** Area name in the visitor's language */
export function zoneName(zone: DeliveryZone, lang: Lang): string {
  return lang === "he" ? ZONES_HE[zone.id]?.name ?? zone.name : zone.name;
}

/** Towns in the visitor's language (falls back to English per town) */
export function zoneCities(zone: DeliveryZone, lang: Lang): string[] {
  if (lang !== "he") return zone.cities;
  const he = ZONES_HE[zone.id]?.cities ?? [];
  return zone.cities.map((c, i) => he[i] ?? c);
}

/** All town names in both languages, for search */
export function zoneSearchTerms(zone: DeliveryZone): { en: string; he: string }[] {
  const he = ZONES_HE[zone.id]?.cities ?? [];
  return zone.cities.map((c, i) => ({ en: c, he: he[i] ?? c }));
}

export function zoneNameBoth(zone: DeliveryZone): string[] {
  return [zone.name, ZONES_HE[zone.id]?.name ?? ""];
}

/** One delivery day in the visitor's language */
export function dayName(day: string, lang: Lang): string {
  return lang === "he" ? DAYS_HE[day] ?? day : day;
}

/** All delivery days of a zone, joined for display */
export function zoneDays(zone: DeliveryZone, lang: Lang): string {
  return zone.deliveryDays.map((d) => dayName(d, lang)).join(", ");
}

// Create a city-to-zone mapping for quick lookup
export const cityToZoneMap: Record<string, string> = {};
deliveryZones.forEach((zone) => {
  zone.cities.forEach((city) => {
    cityToZoneMap[city.toLowerCase()] = zone.id;
  });
});

/**
 * Get zone by city name
 */
export function getZoneByCity(cityName: string): DeliveryZone | null {
  const zoneId = cityToZoneMap[cityName.toLowerCase()];
  if (!zoneId) return null;
  return deliveryZones.find((z) => z.id === zoneId) || null;
}

/** The date and time in Israel, as a plain local Date */
function israelNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
}

/** The Wednesday an order placed now is made on: this week's until Tuesday 12:00, then next week's */
export function productionWednesday(now: Date): Date {
  const ahead = (PRODUCTION_DAY - now.getDay() + 7) % 7; // 0 on Wednesday
  const missed = ahead === 0 || (ahead === 1 && now.getHours() >= CUTOFF_HOUR);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead + (missed ? 7 : 0));
}

/** The next delivery for an area */
export function getNextDeliveryDate(zone: DeliveryZone): Date {
  // Special case: Modiin is always today (same-day delivery)
  if (zone.id === "modiin") {
    return israelNow();
  }

  // Special case: Everywhere Else - return a placeholder date
  if (zone.id === "zone_everywhere_else") {
    return israelNow(); // Return today as placeholder
  }

  // Start searching from that Wednesday, or the day after it
  const searchStartDate = productionWednesday(israelNow());
  if (!SAME_WEDNESDAY.includes(zone.id)) searchStartDate.setDate(searchStartDate.getDate() + 1);

  // Find the next delivery day for this zone
  return findNextDeliveryDay(searchStartDate, zone);
}

/**
 * Find the next delivery day starting from a given date
 */
function findNextDeliveryDay(startDate: Date, zone: DeliveryZone): Date {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Handle special cases for "every second Monday"
  if (isEverySecondMonday(zone)) {
    return nextSecondMonday(startDate);
  }

  // Standard delivery day matching
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);
    const dayName = dayNames[checkDate.getDay()];

    if (zone.deliveryDays.includes(dayName)) {
      return checkDate;
    }
  }

  // If no delivery day found in this week, move to next week and try again
  const nextWeekStart = new Date(startDate);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  return findNextDeliveryDay(nextWeekStart, zone);
}

/** Their dates aren't certain yet: the checkout says so */
export function isEverySecondMonday(zone: DeliveryZone): boolean {
  return !!zone.specialRules?.includes("Bi-weekly");
}

/** The first of every second Monday on or after startDate */
export function nextSecondMonday(startDate: Date): Date {
  const [y, m, d] = SECOND_MONDAY_START.split("-").map(Number);
  let date = new Date(y, m - 1, d);
  while (date < startDate) date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 14);
  return date;
}

/**
 * Format delivery date for display
 */
export function formatDeliveryDate(date: Date, lang: "en" | "he" = "en"): string {
  // Next delivery is today (e.g. same-day Modiin): just say so
  const now = israelNow();
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    return lang === "he" ? "היום" : "Today";
  }
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", options);
}

