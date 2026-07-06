/*
 * SHWEETBREW FAQ SECTION
 * Design: "Braai Fire & Blue Star" — clean dark layout with red accents for questions
 * Accordion-style FAQ with smooth interactions
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  question: { en: string; he: string };
  answer: { en: string; he: string };
}

const faqItems: FAQItem[] = [
  {
    question: {
      en: "What is the difference between Biltong and Jerky?",
      he: "מה ההבדל בין בילטונג לג'רקי?",
    },
    answer: {
      en: `Biltong: In short, spiced and air dried. The meat is cured in a vinegar and spice bath (traditionally featuring coriander and black pepper) and then hung to air-dry naturally over several days.

Jerky: In short, marinated and slow cooked. The meat is usually marinated, then cooked or smoked at low temperatures to dehydrate it quickly, which gives it that classic tough, chewy bite.`,
      he: `בילטונג: בקיצור, תובלי ומיובש באוויר. הבשר מתובל בחומץ ותבליים (בעיקר כוסברה ופלפל שחור) ואז תלוי להתייבש באוויר טבעי במשך כמה ימים.

ג'רקי: בקיצור, מתובל ובישול איטי. הבשר בדרך כלל מתובל, ואז מבושל או מעושן בטמפרטורות נמוכות כדי להתייבש במהירות, מה שנותן לו את הטעם הקלאסי הקשה והגומי.`,
    },
  },
  {
    question: {
      en: "How should I store my Biltong and Jerky?",
      he: "איך אני צריך לאחסן את הבילטונג וג'רקי שלי?",
    },
    answer: {
      en: `Biltong and Jerky are delicious, healthy, protein-packed snacks. First prize is that they should be eaten, not stored. Shweet Brew Biltong and Jerky are fresh, preservative-free, and are made to be enjoyed. But, if you need to store them before eating:

Few days: Can be kept out of the fridge, unless it is extremely hot or humid.

More than a few days: Keep in fridge and take out a few minutes before to eat at room temperature.

Few weeks or months: They will freeze perfectly. Remove from freezer, thaw and eat at room temperature.`,
      he: `בילטונג וג'רקי הם חטיפים טעימים, בריאים ועשירים בחלבון. הפרס הראשון הוא שהם צריכים להיאכל, לא להיאחסן. בילטונג וג'רקי של Shweet Brew טריים, ללא משמרים, ועשויים להנאה. אך אם אתה צריך לאחסן אותם לפני האכילה:

כמה ימים: ניתן להשאיר בחוץ מהמקרר, אלא אם כן חם או לח מאוד.

יותר מכמה ימים: שמור במקרר וצא כמה דקות לפני כדי לאכול בטמפרטורת החדר.

כמה שבועות או חודשים: הם יתקפלו בצורה מושלמת. הוציא מהמקפיא, הפשר ואכול בטמפרטורת החדר.`,
    },
  },
  {
    question: {
      en: "How should I cook the Boerewors?",
      he: "איך אני צריך לבשל את הבוארווורס?",
    },
    answer: {
      en: `Boerewors is best eaten after cooking on the braai, aka BBQ aka grill.

Low and Slow: Best cooked on a low heat to reduce the chance of the casing splitting. To keep it juicy and not dried out, do not overcook and remove from the fire sooner rather than later.

Top Tips:

Medium Heat: Braai/BBQ over medium-hot coals. Too much heat will split the casing and dry out the meat.

Turn Frequently: Turn the boerewors every few minutes using tongs rather than a fork, which prevents the casing from puncturing and letting the juices leak.`,
      he: `בוארווורס הוא הטוב ביותר לאכול לאחר בישול על הברייי, aka BBQ aka grill.

נמוך ובאיטיות: הטוב ביותר מבושל בחום נמוך כדי להפחית את הסיכוי לפיצול הקליפה. כדי שיישאר רטוב ולא יתייבש, אל תבשל יותר מדי והסר מהאש מוקדם יותר.

טיפים מובילים:

חום בינוני: Braai/BBQ על פחמים בחום בינוני-חם. יותר מדי חום יפצל את הקליפה ויתייבש את הבשר.

הפוך לעתים קרובות: הפוך את הבוארווורס כל כמה דקות באמצעות צבטים ולא מזלג, מה שמונע את הקליפה מנקיבה ולתן לרוסות להיזלל.`,
    },
  },
  {
    question: {
      en: "What is Boerewors?",
      he: "מה זה בוארווורס?",
    },
    answer: {
      en: `Boerewors is a legendary, coiled South African sausage. Meaning "farmer's sausage" in Afrikaans, it is famous for its signature spiral shape, chunky coarse texture, and rich blend of spices—with roasted coriander being the star of the show.`,
      he: `בוארווורס הוא נקניקייה דרום אפריקאית אגדית ומתפתלת. משמעות "נקניקיית חקלאי" באפריקאנס, היא מפורסמת בצורתה הספירלית החתימה, המרקם גס וחזק, וערבוב עשיר של תבליים - כשכוסברה קלויה היא כוכבת ההופעה.`,
    },
  },
  {
    question: {
      en: "How do I pronounce Boerewors?",
      he: "איך אני מבטא בוארווורס?",
    },
    answer: {
      en: `Boerewors (pronounced Boo-Ruh-Vors). This isn't your average, run-of-the-mill hot dog. It is a South African culinary treasure that takes backyard barbecues (or as the locals call it, a braai) to a whole new level.`,
      he: `בוארווורס (מבוטא Boo-Ruh-Vors). זה לא הנקניקייה הממוצעת שלך. זה אוצר קולינרי דרום אפריקאי שלוקח ברביקיו בחצר האחורית (או כפי שהמקומיים קוראים לזה, ברייי) לרמה חדשה לחלוטין.`,
    },
  },
];

export default function FAQSection() {
  const { language } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-background"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-accent/30 bg-accent/5">
            <p className="text-xs font-bold tracking-widest uppercase text-accent">
              {language === "en" ? "COMMON QUESTIONS" : "שאלות נפוצות"}
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {language === "en" ? "Frequently Asked Questions" : "שאלות שנשאלות לעתים קרובות"}
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            {language === "en"
              ? "Everything you need to know about our products and how to enjoy them."
              : "כל מה שאתה צריך לדעת על המוצרים שלנו וכיצד ליהנות מהם."}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
                        <div
              key={index}
              className="border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-accent/50"
            >
              {/* Question Button */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between transition-colors hover:bg-accent/5"
              >
                <h3
                  className={`text-left font-bold text-lg transition-colors ${
                    expandedIndex === index ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.question[language]}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedIndex === index ? "rotate-180 text-accent" : "text-muted-foreground"
                  }`}
                />
              </button>
              {/* Answer */}
              {expandedIndex === index && (
                <div className="px-6 py-5 border-t border-border bg-card">
                  <p
                    className="text-base leading-relaxed whitespace-pre-line text-card-foreground"
                  >
                    {item.answer[language]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-base mb-4 text-muted-foreground">
            {language === "en"
              ? "Can't find your answer? Reach out to us on WhatsApp!"
              : "לא מוצא את התשובה שלך? צור קשר איתנו ב-WhatsApp!"}
          </p>
          <a
            href="https://wa.me/972502000000?text=Hi%20Shweet%20Brew!%20I%20have%20a%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm tracking-wide transition-all hover:scale-105"
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              boxShadow: "0 0 15px rgba(37,211,102,0.35)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {language === "en" ? "Contact Us on WhatsApp" : "צור קשר ב-WhatsApp"}
          </a>
        </div>
      </div>
    </section>
  );
}
