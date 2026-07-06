/*
 * SHWEETBREW DELIVERY ZONES CONFIGURATION
 * 7-zone delivery system for Israel
 * Production Day: Wednesday 12:00 PM
 * 
 * CORRECTED DELIVERY LOGIC:
 * 1. Find the closest Wednesday (today if Wed, this week if before, next week if after)
 * 2. Products available AFTER that Wednesday
 * 3. Choose first valid delivery day AFTER the closest Wednesday based on zone
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

// Production day: Wednesday 12:00 PM
export const PRODUCTION_DAY = 3; // 0=Sunday, 3=Wednesday
export const PRODUCTION_HOUR = 12;

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
      "Tel Mond",
      "Even Yehuda",
      "Netanya",
      "Kfar Yona",
    ],
    price: 55,
    deliveryDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    specialRules: "Netanya: Monday. Others: Any day except Wednesday",
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
    cities: ["Ashdod", "Ashkelon", "Yad Binyamin", "Gedera"],
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

/**
 * Find the closest Wednesday
 * - If today is before Wednesday: return this week's Wednesday
 * - If today is Wednesday: return today
 * - If today is after Wednesday: return next week's Wednesday
 */
function getClosestWednesday(referenceDate: Date = new Date()): Date {
  const now = new Date(referenceDate);
  now.setHours(0, 0, 0, 0);
  
  const currentDay = now.getDay(); // 0=Sunday, 3=Wednesday
  
  if (currentDay < PRODUCTION_DAY) {
    // Before Wednesday: use this week's Wednesday
    const daysUntilWednesday = PRODUCTION_DAY - currentDay;
    const wednesday = new Date(now);
    wednesday.setDate(wednesday.getDate() + daysUntilWednesday);
    return wednesday;
  } else if (currentDay === PRODUCTION_DAY) {
    // Today is Wednesday
    return now;
  } else {
    // After Wednesday: use next week's Wednesday
    const daysUntilNextWednesday = 7 - currentDay + PRODUCTION_DAY;
    const wednesday = new Date(now);
    wednesday.setDate(wednesday.getDate() + daysUntilNextWednesday);
    return wednesday;
  }
}

/**
 * Calculate next available delivery date based on corrected logic:
 * 1. Find closest Wednesday
 * 2. Products available AFTER that Wednesday
 * 3. Find first valid delivery day AFTER the closest Wednesday for the zone
 */
export function getNextDeliveryDate(zone: DeliveryZone): Date {
  // Special case: Modiin is always today (same-day delivery)
  if (zone.id === "modiin") {
    return new Date();
  }

  // Special case: Everywhere Else - return a placeholder date
  if (zone.id === "zone_everywhere_else") {
    return new Date(); // Return today as placeholder
  }

  const now = new Date();
  const closestWednesday = getClosestWednesday(now);
  
  // Start searching from the day AFTER the closest Wednesday
  const searchStartDate = new Date(closestWednesday);
  searchStartDate.setDate(searchStartDate.getDate() + 1);

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
  if (zone.specialRules?.includes("Bi-weekly")) {
    return getNextSecondMonday(startDate);
  }

  // Special handling for Jerusalem (always next Wednesday after closest Wednesday)
  if (zone.id === "zone_4_jerusalem") {
    // Find the next Wednesday after startDate
    let checkDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      if (checkDate.getDay() === PRODUCTION_DAY) {
        return checkDate;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
  }

  // Special handling for Hasharon Netanya (always Monday)
  if (zone.id === "zone_2_hasharon") {
    // Check if city is Netanya - for now, treat all Hasharon as flexible
    // Find next valid day
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      const dayName = dayNames[checkDate.getDay()];

      if (zone.deliveryDays.includes(dayName)) {
        return checkDate;
      }
    }
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

/**
 * Get the next "every second Monday" from a given date
 * Returns the first Monday that occurs after startDate
 */
function getNextSecondMonday(startDate: Date): Date {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let mondayCount = 0;
  let checkDate = new Date(startDate);
  checkDate.setHours(0, 0, 0, 0);

  // Find the 1st Monday from the start date (since we're already after the closest Wednesday)
  for (let i = 0; i < 30; i++) {
    const testDate = new Date(checkDate);
    testDate.setDate(testDate.getDate() + i);

    if (dayNames[testDate.getDay()] === "Monday") {
      return testDate;
    }
  }

  // Fallback: return 7 days from start
  const fallback = new Date(startDate);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

/**
 * Format delivery date for display
 */
export function formatDeliveryDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Get next South delivery date for banner
 */
export function getNextSouthDeliveryDate(): Date {
  const now = new Date();
  const closestWednesday = getClosestWednesday(now);
  const searchStartDate = new Date(closestWednesday);
  searchStartDate.setDate(searchStartDate.getDate() + 1);
  return getNextSecondMonday(searchStartDate);
}

/**
 * Get next South delivery date formatted for banner
 */
export function getNextSouthDeliveryDateFormatted(): string {
  return formatDeliveryDate(getNextSouthDeliveryDate());
}

/**
 * Get zone with formatted next delivery date for dropdown display
 */
export function getZoneWithDeliveryInfo(zone: DeliveryZone): {
  zone: DeliveryZone;
  nextDeliveryDate: string;
  displayText: string;
} {
  const nextDate = getNextDeliveryDate(zone);
  const formattedDate = formatDeliveryDate(nextDate);
  const priceText =
    zone.price === -1
      ? "Please contact us"
      : zone.price === 0
        ? "FREE"
        : `₪${zone.price}`;

  const displayText = `${zone.name} — ${priceText} — ${formattedDate}`;

  return {
    zone,
    nextDeliveryDate: formattedDate,
    displayText,
  };
}
