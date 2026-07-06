/*
 * SHWEET BREW LANGUAGE CONFIGURATION
 * Centralized translations for English and Hebrew
 * All UI text except logos and review boxes
 */

export const languages = {
  en: "English",
  he: "עברית",
};

export type Language = keyof typeof languages;

export const translations = {
  // Navigation
  navbar: {
    products: { en: "PRODUCTS", he: "מוצרים" },
    order: { en: "ORDER", he: "הזמנה" },
    reviews: { en: "REVIEWS", he: "ביקורות" },
    about: { en: "ABOUT", he: "אודות" },
    faq: { en: "FAQ", he: "שאלות נפוצות" },
    delivery: { en: "DELIVERY", he: "משלוח" },
    contact: { en: "CONTACT", he: "יצירת קשר" },
    orderOnWhatsApp: { en: "Order on WhatsApp", he: "הזמן ב-WhatsApp" },
  },

  // Hero Section
  hero: {
    title1Word1: { en: "PLAY", he: "תיתן" },
    title1Word2: { en: "HARD.", he: "בראש." },
    title2Word1: { en: "SNACK", he: "תתפרע" },
    title2Word2: { en: "HARDER.", he: "על הנשנוש." },
    tagline: { en: `Authentic South African Biltong and Boerewors.
Mouthwatering American Jerky.
And more — crafted with`, he: "בילטונג דרום אפריקאי אותנטי, בוארווורס ועוד — עשוי עם" },    israeliPride: { en: "Israeli pride", he: "גאווה ישראלית" },
    and: { en: "and", he: "ו" },
    saSoul: { en: "SA soul ", he: "נשמה דרום אפריקאית" },
    taglineEnd: { en: "Delivered across Israel. No nonsense. Just meat.", he: "מסופק בכל רחבי ישראל. אין טעויות. רק בשר." },
    browseProducts: { en: "Browse Products", he: "עיין במוצרים" },
    madeInIsrael: { en: "🇮🇱 Made in Israel", he: "🇮L תוצרת הארץ" },
    saRoots: { en: "🇿🇦 SA Roots", he: "🇿🇦 שורשים דרום אפריקאיים" },
    kosherOptions: { en: "✡ All Kosher Ingredients", he: "✡ רכבים כשרים" },
    // Stats section
    products: { en: "Products", he: "מוצרים" },
    beef: { en: "Beef", he: "בשר בקר" },
    israelWideDelivery: { en: "Israel-wide Delivery", he: "משלוח בכל רחבי ישראל" },
    authenticRecipes: { en: "Authentic Recipes", he: "מתכונים אותנטיים" },
    // CTA buttons
    orderOnWhatsApp: { en: "Order on WhatsApp", he: "הזמן ב-WhatsApp" },
    orderNow: { en: "Order Now", he: "הזמן עכשיו" },
  },

  // Products Section
  products: {
    sectionTitle: { en: "PRODUCTS THAT HIT DIFFERENT", he: "מוצרים שמכים אחרת" },
    sectionSubtitle: { en: "Every product is made with 100% beef, authentic SA spices, and the kind of love only a South African in Israel can understand.", he: "כל מוצר עשוי מ-100% בשר בקר, תבליני SA אותנטיים, וסוג האהבה שרק דרום אפריקאי בישראל יכול להבין." },
    theRange: { en: "THE SHWEET BREW RANGE", he: "טווח שוויט ברו" },
    filterAll: { en: "All", he: "הכל" },
    
    // BILTONG CATEGORY
    biltong: { en: "Biltong", he: "בילטונג" },
    biltongDesc: { en: "Authentic South African air-dried beef biltong", he: "בילטונג בקר מיובש באוויר אותנטי דרום אפריקאי" },
    biltongCategoryName: { en: "BILTONG", he: "בילטונג" },
    
    // Biltong - Traditional
    biltongTraditional: { en: "Traditional", he: "מסורתי" },
    biltongTraditionalDesc: { en: "Air-dried beef biltong made to the original SA recipe. Spiced with coriander, black pepper, and vinegar.", he: "בילטונג בקר מיובש באוויר לפי המתכון המקורי של דרום אפריקה. תובל בכוסברה, פלפל שחור וחומץ." },
    biltongTraditionalTagline: { en: "The OG. The Legend.", he: "המקורי. האגדה." },
    
    // Biltong - Teriyaki
    biltongTeriyaki: { en: "Teriyaki", he: "טריאקי" },
    biltongTeriyakiDesc: { en: "Sweet, savoury, and slightly sticky. Teriyaki-spiced biltong that bridges South African tradition with Asian flavours.", he: "מתוק, מלוח וקצת דביק. בילטונג בטעם טריאקי המחבר בין טעמים דרום אפריקאיים לאסיאתיים." },
    biltongTeriyakiTagline: { en: "East meets braai.", he: "המזרח פוגש ברייי." },
    
    // Biltong - Sweet Chilli
    sweetChilli: { en: "Sweet Chilli", he: "צ'ילי מתוק" },
    sweetChilliDesc: { en: "Sweet heat with a kick. Perfect for those who want flavour without going full nuclear.", he: "חום מתוק עם כיסה. מושלם למי שרוצה טעם בלי להיות גרעיני." },
    sweetChilliTagline: { en: "Sweet with a bite.", he: "מתוק עם כיסה." },
    
    // Biltong - Chilli
    biltongChilli: { en: "Chilli", he: "צ'ילי" },
    biltongChilliDesc: { en: "Seriously spicy. For people who think mild is a personality trait.", he: "חריף בהחלט. לאנשים שחושבים שעדין הוא תכונת אישיות." },
    biltongChilliTagline: { en: "Bring the heat.", he: "הביאו את החום." },
    
    // Biltong - Wasabi
    wasabi: { en: "Wasabi", he: "וואסבי" },
    wasabiDesc: { en: "Absolutely wild. Wasabi-spiced biltong that will make your eyes water and your taste buds sing.", he: "לחלוטין פרוע. בילטונג בטעם וואסבי שיגרום לעיניים שלך להיות רטובות וטעם הברעם שלך לשיר." },
    wasabiTagline: { en: "Not for the faint-hearted.", he: "לא לחלשי לב." },

    // BOEREWORS CATEGORY
    boerewors: { en: "Boerewors", he: "בוארווורס" },
    boereworsDesc: { en: "Coiled beef sausage spiced with coriander, cloves, and nutmeg", he: "נקניקייה בקר מתפתלת תובלה בכוסברה, ציפורנים וגוזנוג" },
    boereworsCategory: { en: "BOEREWORS", he: "בוארווורס" },
    boereworsClassic: { en: "Classic", he: "קלאסי" },
    boereworsClassicDesc: { en: "The classic South African style sausage. Coiled beef sausage spiced with coriander, coarse salt and black pepper. Ready to grill. Go on, make yourself a delicious Boerie Roll.", he: "הנקניקייה הדרום אפריקאית הקלאסית. נקניקייה בקר מתפתלת תובלה בכוסברה, מלח גס ופלפל שחור. מוכנה לצלייה. בואו, תכינו לעצמכם בוארי רול טעים." },
    boereworsClassicTagline: { en: "The Braai King.", he: "מלך הברייי." },

    // DRYWORS CATEGORY
    drywors: { en: "Drywors", he: "דרייוורס" },
    dryworDesc: { en: "Thin, dried beef wors — the ultimate road-trip snack", he: "נקניקייה בקר דקה ומיובשת - החטיף המושלם לנסיעה" },
    dryworCategory: { en: "DRYWORS", he: "דרייוורס" },
    dryworClassic: { en: "Classic", he: "קלאסי" },
    dryworClassicDesc: { en: "Thin, dried beef wors — the ultimate road-trip snack. Spiced just right. Dangerously addictive. Classic South African style sausage, dried to perfection.", he: "נקניקייה בקר דקה ומיובשת - החטיף המושלם לנסיעה. תובל בצורה מושלמת. כמוסה מסוכנת. נקניקייה דרום אפריקאית קלאסית, מיובשת לשלמות." },
    dryworClassicTagline: { en: "Snack. Anywhere. Always.", he: "חטיף. בכל מקום. תמיד." },

    // JERKY CATEGORY
    jerky: { en: "Jerky", he: "ג'רקי" },
    jerkyDesc: { en: "Thin-sliced, marinated, and dried to perfection", he: "פרוסות דקות, מתובלות ומיובשות לשלמות" },
    jerkyCategory: { en: "JERKY", he: "ג'רקי" },
    jerkyClassic: { en: "Classic", he: "קלאסי" },
    jerkyClassicDesc: { en: "Thin-sliced, marinated, and dried to perfection. Our take on beef jerky — smoky, slightly sweet, with that Shweet Brew signature.", he: "פרוסות דקות, מתובלות ומיובשות לשלמות. הגרסה שלנו של ג'רקי בקר - מעושנת, קצת מתוקה, עם החתימה של שוויט ברו." },
    jerkyClassicTagline: { en: "American vibes. SA quality.", he: "רוח אמריקאית. איכות דרום אפריקאית." },

    // HOLY LAND JERKY CATEGORY
    holyLandJerky: { en: "Holy Land Jerky", he: "ג'רקי הארץ הקדושה" },
    holyLandJerkyDesc: { en: "Experience the perfect balance of tradition and craft. Holy Land Jerky, by Shweet Brew, delivers authentic jerky flavors and premium quality in every bite.", he: "חוו את האיזון המושלם בין מסורת וכישוריות. ג'רקי הארץ הקדושה, על ידי שוויט ברו, מספק טעמי ג'רקי אותנטיים ואיכות פרימיום בכל כיסה." },
    holyLandJerkyCowboy: { en: "Traditional Cowboy", he: "קאובוי מסורתי" },
    holyLandJerkyCowboyDesc: { en: "The rugged classic. Soya sauce, salt and pepper with hints of onion and garlic.", he: "הקלאסי הגס. רוטב סויה, מלח ופלפל עם רמזים של בצל ושום." },
    holyLandJerkyCowboyTagline: { en: "The classic that started it all.", he: "הקלאסי שהתחיל הכל." },
    holyLandJerkyTeriyaki: { en: "Teriyaki", he: "טריאקי" },
    holyLandJerkyTeriyakiDesc: { en: "A savory-sweet glazed favorite.", he: "אהדה מזוגגת מלוחה-מתוקה." },
    holyLandJerkyTeriyakiTagline: { en: "Sweet meets savory.", he: "מתוק פוגש מלוח." },
    holyLandJerkySweetChilli: { en: "Sweet Chilli", he: "צ'ילי מתוק" },
    holyLandJerkySweetChilliDesc: { en: "The perfect blend of heat and sweet.", he: "תערובט מושלמת של חום ומתוק." },
    holyLandJerkySweetChilliTagline: { en: "Sweet Heat. Bold Bite.", he: "חריף מתוק. טעם רציני." },
    holyLandJerkyChilli: { en: "Chilli", he: "צ'ילי" },
    holyLandJerkyChilliDesc: { en: "For those who crave a serious, authentic burn.", he: "למי שמכמה כוויה רצינית ואותנטית." },
    holyLandJerkyChilliTagline: { en: "Serious heat. Serious flavor.", he: "חום רציני. טעם רציני." },

    // CHILLI BITES
    chilliBites: { en: "Chilli Bites", he: "ביטות צ'ילי" },
    chilliBitesDesc: { en: "Bite-sized biltong pieces with a serious chilli kick. Gym bag essential.", he: "חתיכות בילטונג בגודל ביס עם כיסה צ'ילי רציני. הכרחי לתיק ההדרכה." },
    chilliBitesCategory: { en: "CHILLI BITES", he: "ביטות צ'ילי" },
    chilliBitesTagline: { en: "Not for the faint-hearted.", he: "לא לחלשי לב." },

    // SHOTS CATEGORY
    shots: { en: "Shweet Brew Shots", he: "שוטות שוויט ברו" },
    shotsDesc: { en: "Vodka infused with chilli, cinnamon, and vanilla. The shot that starts the braai and ends the night. Serve ice cold.", he: "וודקה מעובדת עם צ'ילי, קינמון וניל. השוט שמתחיל את הברייי ומסיים את הלילה. הגש קר מאוד." },
    shotsCategory: { en: "SHOTS", he: "שוטות" },
    shotsTagline: { en: "Chilli. Cinnamon. Vanilla. Chaos.", he: "צ'ילי. קינמון. ניל. כאוס." },

    // SAUCES CATEGORY
    sauces: { en: "Sauces", he: "רטבים" },
    saucesDesc: { en: "House-made chilli sauce — put it on everything", he: "רטב צ'ילי בעבודת יד - שים אותו על הכל" },
    saucesCategory: { en: "SAUCES", he: "רטבים" },
    chilliSauce: { en: "Chilli Sauce", he: "רטב צ'ילי" },
    chilliSauceDesc: { en: "House-made chilli sauce. Thick, fiery, and deeply flavoured. Good with biltong, eggs, your finger — honestly anything.", he: "רטב צ'ילי בעבודת יד. עבה, בוער וטעם עמוק. טוב עם בילטונג, ביצים, האצבע שלך - בכנות כל דבר." },
    chilliSauceTagline: { en: "Put it on everything.", he: "שים אותו על הכל." },

    // Common product UI
    addToCart: { en: "Add to Cart", he: "הוסף לעגלה" },
    selectSize: { en: "Select size", he: "בחר גודל" },
    spiceLevel: { en: "SPICE LEVEL", he: "רמת תבל" },
    kosher: { en: "✡ KOSHER", he: "✡ כשר" },
    passoverKosher: { en: "✡ KOSHER FOR PASSOVER ", he: "✡ כשר לפסח" },
    notAvailable: { en: "NOT AVAILABLE", he: "לא זמין" },
    
    // Product Info Modal
    nutrition: { en: "NUTRITION", he: "תזונה" },
    ingredients: { en: "INGREDIENTS", he: "מרכיבים" },
    protein: { en: "Protein", he: "חלבון" },
    fat: { en: "Fat", he: "שומן" },
    carbs: { en: "Carbs", he: "פחמימות" },
    calories: { en: "Calories", he: "קלוריות" },
    allergens: { en: "ALLERGENS", he: "אלרגנים" },
    close: { en: "Close", he: "סגור" },
  },

  // Delivery Section
  delivery: {
    sectionTitle: { en: "FAST DELIVERY", he: "— משלוח מהיר —" },
    sectionSubtitle: { en: "Across Israel", he: "אנחנו משלחים בכל רחבי ישראל" },
    description: { en: "We deliver fresh, quality products across Israel with reliable timelines and competitive pricing.", he: "אנחנו משלחים מוצרים טריים באיכות גבוהה בכל רחבי ישראל עם לוחות זמנים אמינים ומחירים תחרותיים." },
    
    // Zones
    selectArea: { en: "SELECT YOUR DELIVERY AREA", he: "בחר את אזור המשלוח שלך" },
    modiin: { en: "Modiin (HQ)", he: "מודיעין (ראש הממשלה)" },
    modiin_time: { en: "Same day / Next day", he: "באותו יום / למחרת" },
    modiin_fee: { en: "₪0 (Free pickup)", he: "₪0 (איסוף חינם)" },
    telAviv: { en: "Tel Aviv & Gush Dan", he: "תל אביב וגוש דן" },
    telAviv_time: { en: "1–2 days", he: "1–2 ימים" },
    telAviv_fee: { en: "₪25", he: "₪25" },
    jerusalem: { en: "Jerusalem", he: "ירושלים" },
    jerusalem_time: { en: "2–3 days", he: "2–3 ימים" },
    jerusalem_fee: { en: "₪35", he: "₪35" },
    haifa: { en: "Haifa & North", he: "חיפה וצפון" },
    haifa_time: { en: "2–3 days", he: "2–3 ימים" },
    haifa_fee: { en: "₪40", he: "₪40" },
    beerSheva: { en: "Beer Sheva & South", he: "באר שבע ודרום" },
    beerSheva_time: { en: "2–3 days", he: "2–3 ימים" },
    beerSheva_fee: { en: "₪45", he: "₪45" },
    everywhere: { en: "Everywhere Else", he: "בכל מקום אחר" },
    everywhere_time: { en: "Varies", he: "משתנה" },
    everywhere_fee: { en: "Contact for quote", he: "צור קשר לציטוט" },
    
    // Delivery info cards
    minimumOrderTitle: { en: "Minimum Order", he: "הזמנה מינימלית" },
    minimumOrderDesc: { en: "₪80 minimum for delivery. No minimum for pickup in Modiin.", he: "₪80 מינימום למשלוח. אין מינימום לאיסוף במודיעין." },
    cutoffTitle: { en: "Order Cutoff", he: "סגירה הזמנות" },
    cutoffDesc: { en: "Order by 12pm for same-day delivery in Modiin. Contact us for delivery days in other areas.", he: "הזמנו עד 12:00 למשלוח באותו יום במודיעין. צור קשר לימי משלוח באזורים אחרים." },
    paymentTitle: { en: "Payment", he: "תשלום" },
    paymentDesc: { en: "Cash, bank transfer, or Bit. Payment on delivery or in advance.", he: "מזומניט, העברה בנקאית, או Bit. תשלום עם המשלוח או מראש." },
    pickupTitle: { en: "Pickup Available", he: "איסוף זמין" },
    pickupDesc: { en: "Prefer to collect? Pickup available in Modiin. WhatsApp us to arrange.", he: "בדרך לאסוף בעצמך? איסוף זמין במודיעין. שלח לנו ב-WhatsApp לעריכה." },
    
    contactForQuote: { en: "Contact for quote", he: "צור קשר לציטוט" },
    
    // Delivery zone names for dropdown
    zoneModiin: { en: "Modiin (HQ)", he: "מודיעין (ראש הממשלה)" },
    zoneTelAviv: { en: "Tel Aviv & Gush Dan", he: "תל אביב וגוש דן" },
    zoneJerusalem: { en: "Jerusalem", he: "ירושלים" },
    zoneHaifa: { en: "Haifa & North", he: "חיפה וצפון" },
    zoneBeerSheva: { en: "Beer Sheva & South", he: "באר שבע ודרום" },
    zoneEverywhere: { en: "Everywhere Else", he: "בכל מקום אחר" },
  },

  // Order Section (Checkout)
  checkout: {
    title: { en: "CHECKOUT", he: "קופה" },
    reviewYourOrder: { en: "Review your order and complete checkout", he: "בדוק את הזמנתך והשלם" },
    orderSummary: { en: "ORDER SUMMARY", he: "סיכום הזמנה" },
    yourDetails: { en: "YOUR DETAILS", he: "הפרטים שלך" },
    fullName: { en: "FULL NAME", he: "שם מלא" },
    phone: { en: "PHONE", he: "טלפון" },
    deliveryArea: { en: "DELIVERY AREA", he: "אזור משלוח" },
    selectDeliveryArea: { en: "Select your delivery area", he: "בחר את אזור המשלוח שלך" },
    city: { en: "CITY", he: "עיר" },
    address: { en: "ADDRESS", he: "כתובת" },
    specialRequests: { en: "SPECIAL REQUESTS", he: "בקשות מיוחדות" },
    subtotal: { en: "Subtotal:", he: "סה\"כ ביניים:" },
    delivery: { en: "Delivery:", he: "משלוח:" },
    total: { en: "Total:", he: "סה\"כ:" },
    completeOrder: { en: "Complete Order on WhatsApp", he: "השלם הזמנה ב-WhatsApp" },
    addProducts: { en: "Add Products", he: "הוסף מוצרים" },
    cartEmpty: { en: "Your cart is empty. Add products to get started!", he: "העגלה שלך ריקה. הוסף מוצרים כדי להתחיל!" },
  },

  // Reviews Section (titles only, not review boxes)
  reviews: {
    title: { en: "The People", he: "האנשים" },
    haveSpoken: { en: "Have Spoken", he: "דברו" },
    subtitle: { en: "What People Are Saying", he: "מה אנשים אומרים" },
    happyCustomers: { en: "from 200+ happy customers", he: "מ-200+ לקוחות שמחים" },
    joinHundreds: { en: "Join hundreds of happy customers across Israel.", he: "הצטרף למאות לקוחות שמחים בכל רחבי ישראל." },
    beNext: { en: "Be the next happy customer →", he: "היה הלקוח השמח הבא →" },
  },

  // About Section
  about: {
    sectionTitle: { en: "OUR STORY", he: "הסיפור שלנו" },
    tagline: { en: "Born in South Africa. Proud to be Israeli.", he: "נולדנו בדרום אפריקה. גאים להיות ישראלים." },
    bornInSa: { en: "Born in South Africa.", he: "נולדנו בדרום אפריקה." },
    proudIsraeli: { en: "Proud to be Israeli.", he: "גאים להיות ישראלים." },
    twoNations: { en: "TWO NATIONS", he: "שתי אומות" },
    oneBraai: { en: "ONE BRAAI", he: "ברייי אחד" },
    headlineHe: { en: "Bringing South African Braai Culture to Israel", he: "הבאת תרבות ברייי דרום אפריקאית לישראל" },
    storyHe: { en: "We're a team of South Africans who grew up eating authentic biltong, boerewors, and braai. When we moved to Israel, we realized there was no place making it the right way. So we did it ourselves. Every product is made with 100% beef, traditional SA spices, and the kind of care that only comes from people who grew up on this stuff. No shortcuts. No compromises. Just meat, done right.", he: "אנחנו צוות של דרום אפריקאים שגדלו על אכילת בילטונג אותנטי, בוארווורס וברייי. כשעברנו לישראל, הבנו שאין מקום שעושה את זה בצורה הנכונה. אז עשינו זאת בעצמנו. כל מוצר עשוי מ-100% בשר בקר, תבליני SA מסורתיים, וסוג הטיפול שמגיע רק מאנשים שגדלו על הדברים האלה. אין קיצורי דרך. אין פשרות. רק בשר, עשוי כמו שצריך." },
    
    // Story section
    storyTitle: { en: "The Shweet Brew Story", he: "סיפור שוויט ברו" },
    storyParagraph1: { en: "We're South Africans who fell in love with Israel. And we couldn't let go of home.", he: "אנחנו דרום אפריקאים שהתאהבנו בישראל. ולא יכולנו לשחרר את הבית." },
    storyParagraph2: { en: "When we moved to Israel, we missed the braai culture, the authentic flavours, the community. So we decided to bring it here.", he: "כשעברנו לישראל, חמקנו לתרבות הברייי, לטעמים האותנטיים, לקהילה. אז החלטנו להביא את זה לכאן." },
    storyParagraph3: { en: "Shweet Brew is our love letter to both nations. Every product is made with 100% beef, authentic SA spices, and the kind of pride that only comes from bridging two homes.", he: "שוויט ברו היא מכתב אהבה שלנו לשתי אומות. כל מוצר עשוי מ-100% בשר בקר, תבליני SA אותנטיים, וסוג הגאווה שמגיע רק מחיבור שני בתים." },
    
    // Values
    valuesTitle: { en: "OUR VALUES", he: "הערכים שלנו" },
    beef100: { en: "100% Beef", he: "100% בשר בקר" },
    beef100Desc: { en: "No fillers, no nonsense", he: "אין מילוי, אין טעויות" },
    kosherCert: { en: "Kosher Ingredients", he: "רכיבים כשרים" },
    kosherCertDesc: { en: "Always Available", he: "תמיד זמין" },
    authenticRecipes: { en: "Authentic Recipes", he: "מתכונים אותנטיים" },
    authenticRecipesDesc: { en: "Straight from SA", he: "ישירות מדרום אפריקה" },
    israeliPride: { en: "Israeli Pride", he: "גאווה ישראלית" },
    israeliPrideDesc: { en: "Made with love in Israel", he: "עשוי באהבה בישראל" },
    
    // Mission
    missionTitle: { en: "OUR MISSION", he: "המשימה שלנו" },
    missionDesc: { en: "To bring authentic South African braai culture to Israel while celebrating both nations. We believe in quality, authenticity, and community. Every product we make is a bridge between two homes, two cultures, and one shared love of great food.", he: "להביא את תרבות הברייי הדרום אפריקאית האותנטית לישראל תוך חגיגת שתי אומות. אנחנו מאמינים באיכות, באותנטיות ובקהילה. כל מוצר שאנחנו עושים הוא גשר בין שני בתים, שתי תרבויות, ואהבה משותפת לאוכל מעולה." },
    
    chatWithUs: { en: "Chat with Us", he: "שוחח איתנו" },
  },

  // Contact Section
  contact: {
    title: { en: "GET IN TOUCH", he: "צור קשר" },
    subtitle: { en: "Questions? We're here to help.", he: "שאלות? אנחנו כאן כדי לעזור." },
    whatsappHeader: { en: "Chat with Us on WhatsApp", he: "שוחח איתנו ב-WhatsApp" },
    whatsappDesc: { en: "The fastest way to reach us. We'll respond within a few hours.", he: "הדרך המהירה ביותר להגיע אלינו. נענה תוך כמה שעות." },
    messageNow: { en: "Message Us Now", he: "שלח לנו הודעה עכשיו" },
    emailUs: { en: "EMAIL US", he: "שלח לנו דואל" },
    inquiryTypes: { en: "INQUIRY TYPES", he: "סוגי בירורים" },
    sectionTitle: { en: "GET IN TOUCH", he: "צור קשר" },
    whatsappUs: { en: "WHATSAPP US", he: "שלח לנו ב-WhatsApp" },
  },

  // Cart & Floating Button
  cart: {
    yourCart: { en: "YOUR CART", he: "העגלה שלך" },
    cartEmpty: { en: "Your cart is empty", he: "העגלה שלך ריקה" },
    name: { en: "Name", he: "שם" },
    phone: { en: "Phone", he: "טלפון" },
    selectDeliveryArea: { en: "Select delivery area...", he: "בחר אזור משלוח..." },
    city: { en: "City", he: "עיר" },
    address: { en: "Address", he: "כתובת" },
    specialRequests: { en: "Special requests...", he: "בקשות מיוחדות..." },
    subtotal: { en: "Subtotal", he: "סה\"כ ביניים" },
    delivery: { en: "Delivery", he: "משלוח" },
    total: { en: "Total", he: "סה\"כ" },
    orderOnWhatsApp: { en: "Order on WhatsApp", he: "הזמן ב-WhatsApp" },
    clearCart: { en: "Clear Cart", he: "נקה עגלה" },
  },

  // Floating WhatsApp Button
  floatingButton: {
    orderOnWhatsApp: { en: "Order on WhatsApp", he: "הזמן ב-WhatsApp" },
    orderNow: { en: "Order Now", he: "הזמן עכשיו" },
  },

  // Footer
  footer: {
    tagline: { en: "Made with SA love in Israel", he: "עשוי באהבה דרום אפריקאית בישראל" },
  },
};
