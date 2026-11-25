/*
 * The legal pages: cancellations and refunds, terms, privacy, accessibility.
 *
 * DRAFTS, HIDDEN. [[double brackets]] are gaps only the business owner can fill.
 * A page is public only when LEGAL_LIVE is true AND it has no gaps left in either
 * language; on the dev server they all open, with the gaps marked. Someone who
 * knows the law should read them before LEGAL_LIVE is switched on.
 */

import { CONTACT_INFO } from "./constants";

export const LEGAL_LIVE = false;

type Text = { en: string; he: string };
export type LegalPage = { path: string; title: Text; sections: { title: Text; text: Text }[] };

// kept left to right inside Hebrew text, or the number would read backwards
const ltr = (t: string) => `\u2066${t}\u2069`;
const MAIL = ltr(CONTACT_INFO.email);
const PHONE = ltr(CONTACT_INFO.whatsappDisplay.replace(/ /g, " ")); // never split over two lines

const OSEK = ltr("346919780"); // he agreed to show it (2026-11-25)

// While they're hidden, the build leaves the drafts out completely
export const LEGAL_PAGES: LegalPage[] = !(import.meta.env.DEV || LEGAL_LIVE) ? [] : [
  {
    path: "/refunds",
    title: { en: "Cancellations and refunds", he: "ביטולים והחזרים" },
    sections: [
      {
        title: { en: "Cancelling an order", he: "ביטול הזמנה" },
        text: {
          en: `You can cancel until your order has been handed to the courier. Write to ${MAIL} or message ${PHONE} with your order number. You get all your money back within 5 days.`,
          he: `אפשר לבטל עד שההזמנה נמסרה לשליח. כתבו אל ${MAIL} או שלחו הודעה אל ${PHONE} עם מספר ההזמנה. תקבלו את כל הכסף בחזרה תוך 5 ימים.`,
        },
      },
      {
        title: { en: "Spoiled food", he: "אוכל מקולקל" },
        text: {
          en: `If something arrives spoiled, send us photos as soon as you can and we'll replace it.`,
          he: `אם משהו הגיע מקולקל, שלחו לנו תמונות בהקדם האפשרי ונחליף אותו.`,
        },
      },
      {
        title: { en: "Wrong or missing items", he: "מוצרים שגויים או חסרים" },
        text: { en: "If something is wrong or missing, send us photos and we'll replace it.", he: "אם משהו שגוי או חסר, שלחו לנו תמונות ונחליף אותו." },
      },
      {
        title: { en: "Late deliveries", he: "משלוחים מאוחרים" },
        text: { en: "[[To be checked against the law before we write it]]", he: "[[לבדוק מול החוק לפני שכותבים]]" },
      },
      {
        title: { en: "Your rights", he: "הזכויות שלכם" },
        text: {
          en: "Nothing on this page takes away rights you have under Israeli consumer law.",
          he: "שום דבר בעמוד הזה לא גורע מהזכויות שלכם לפי חוק הגנת הצרכן.",
        },
      },
    ],
  },
  {
    path: "/terms",
    title: { en: "Terms", he: "תקנון" },
    sections: [
      {
        title: { en: "Who we are", he: "מי אנחנו" },
        text: {
          en: `Shweet Brew, Uri Marks, Modiin, Israel.\nOsek Patur ${OSEK}.\nPhone: ${PHONE}. Email: ${MAIL}.`,
          he: `שוויט ברו, אורי מרקס, מודיעין.\nעוסק פטור ${OSEK}.\nטלפון: ${PHONE}. מייל: ${MAIL}.`,
        },
      },
      {
        title: { en: "Ordering and paying", he: "הזמנה ותשלום" },
        text: {
          en: "Orders are placed on this website, without an account. Prices are in shekels. Delivery is added at checkout, and you see the total before you order. You can pay by Bit, PayBox or bank transfer, or in cash in Modiin. Nothing is charged on the website itself. We email you the details of your order.\n\n[[How is a receipt sent?]]",
          he: "מזמינים באתר, בלי חשבון. המחירים בשקלים. המשלוח מתווסף לפני ההזמנה, ורואים את הסכום הכולל לפני שמזמינים. אפשר לשלם ב-Bit, ב-PayBox, בהעברה בנקאית, או במזומן במודיעין. באתר עצמו לא מתבצע חיוב. אנחנו שולחים לכם במייל את פרטי ההזמנה.\n\n[[איך נשלחת קבלה?]]",
        },
      },
      {
        title: { en: "Delivery", he: "משלוחים" },
        text: {
          en: "Delivery areas, days and fees are listed on the home page. Order by Tuesday 12:00 to make the next delivery run. There is no minimum order. We confirm the delivery time with you.",
          he: "אזורי המשלוח, הימים והמחירים מופיעים בעמוד הבית. הזמינו עד יום שלישי ב-12:00 כדי להיכנס לסבב המשלוחים הקרוב. אין הזמנה מינימלית. אנחנו מאשרים איתכם את זמן המשלוח.",
        },
      },
      {
        title: { en: "Alcohol", he: "אלכוהול" },
        text: {
          en: "Shweet Brew Shots contain alcohol. They are sold only to people aged 18 or over, who confirm it when ordering.\n\n[[Rules and licence to be checked]]",
          he: "השוטס של שוויט ברו מכילים אלכוהול ונמכרים רק לבני 18 ומעלה, שמאשרים זאת בהזמנה.\n\n[[לבדוק את הכללים והרישיון]]",
        },
      },
      {
        title: { en: "Food", he: "אוכל" },
        text: {
          en: "Ingredients and allergens are on each product's info card. If you have an allergy, ask us before ordering. Nutrition values are estimates. Our ingredients are kosher; we have no kosher certificate.",
          he: "המרכיבים והאלרגנים מופיעים בכרטיס המידע של כל מוצר. אם יש לכם אלרגיה, שאלו אותנו לפני ההזמנה. הערכים התזונתיים הם הערכה. הרכיבים שלנו כשרים; אין לנו תעודת כשרות.",
        },
      },
    ],
  },
  {
    path: "/privacy",
    title: { en: "Privacy", he: "פרטיות" },
    sections: [
      {
        title: { en: "What we keep", he: "מה אנחנו שומרים" },
        text: {
          en: "When you order: your name, email, address, your phone and note if you give them, what you ordered, your language and how you chose to pay. To stop fake orders, we also log the internet address an order came from for a short time. We never see card or bank logins.",
          he: "כשאתם מזמינים: שם, מייל, כתובת, טלפון והערה אם נתתם, מה הזמנתם, השפה ודרך התשלום שבחרתם. כדי למנוע הזמנות מזויפות, אנחנו רושמים לזמן קצר גם את כתובת האינטרנט שממנה הגיעה ההזמנה. אנחנו לא רואים פרטי כרטיס או כניסה לבנק.",
        },
      },
      {
        title: { en: "Why, and who else", he: "למה, ומי עוד" },
        text: {
          en: "We use it to make, deliver and confirm your order. Supabase stores the orders, Resend sends the emails and Netlify hosts the website. We don't sell your details or use them for ads. The delivery person gets your name, phone and address for your order.",
          he: "אנחנו משתמשים בזה כדי להכין, למסור ולאשר את ההזמנה. Supabase שומרת את ההזמנות, Resend שולחת את המיילים ו-Netlify מארחת את האתר. אנחנו לא מוכרים את הפרטים ולא משתמשים בהם לפרסום. השליח מקבל את השם, הטלפון והכתובת שלכם לצורך ההזמנה.",
        },
      },
      {
        title: { en: "On your device", he: "במכשיר שלכם" },
        text: {
          en: "The website remembers your language. After an order, this tab remembers the order for two hours so you can pay. There are no advertising or tracking cookies.",
          he: "האתר זוכר את השפה שלכם. אחרי הזמנה, הלשונית זוכרת אותה לשעתיים כדי שתוכלו לשלם. אין עוגיות פרסום או מעקב.",
        },
      },
      {
        title: { en: "How long, and your rights", he: "כמה זמן, והזכויות שלכם" },
        text: {
          en: `We keep order details with no end date. You can ask to see, correct or delete your details: ${MAIL}.`,
          he: `אנחנו שומרים את פרטי ההזמנות ללא הגבלת זמן. אפשר לבקש לראות, לתקן או למחוק את הפרטים שלכם: ${MAIL}.`,
        },
      },
    ],
  },
  {
    path: "/accessibility",
    title: { en: "Accessibility", he: "הצהרת נגישות" },
    sections: [
      {
        title: { en: "What we did", he: "מה עשינו" },
        text: {
          en: "We want everyone to be able to use this website. It works in English and Hebrew, can be used with a keyboard, has labels for screen readers and stands still if your device asks for less motion.\n\n[[Which accessibility level was checked, by whom and when?]]",
          he: "אנחנו רוצים שכולם יוכלו להשתמש באתר. הוא עובד בעברית ובאנגלית, אפשר להשתמש בו במקלדת, יש בו תוויות לקוראי מסך, והוא עומד במקום אם המכשיר מבקש פחות תנועה.\n\n[[איזו רמת נגישות נבדקה, על ידי מי ומתי?]]",
        },
      },
      {
        title: { en: "Something doesn't work for you?", he: "משהו לא עובד לכם?" },
        text: {
          en: `Tell Uri Marks and we'll help: ${PHONE}, ${MAIL}.`,
          he: `פנו לאורי מרקס ונעזור: ${PHONE}, ${MAIL}.`,
        },
      },
    ],
  },
];

const hasGaps = (p: LegalPage) => p.sections.some((s) => (s.title.en + s.title.he + s.text.en + s.text.he).includes("[["));

/** Pages customers may see (footer links and routes) */
export const PUBLIC_LEGAL_PAGES = LEGAL_PAGES.filter((p) => LEGAL_LIVE && !hasGaps(p));
/** Pages that open: the public ones, or all of them on the dev server */
export const OPEN_LEGAL_PAGES = import.meta.env.DEV ? LEGAL_PAGES : PUBLIC_LEGAL_PAGES;
