# NORINA — Progress Log

לוג קצר של כל שלב שהושלם. לפירוט טכני ראו commit history ו-DECISIONS.md.

## 2026-07-31 — שלב 1: הקמת פרויקט
Next.js 16 + TypeScript + Tailwind v4 + Prisma 6.19.3 (datasource בלבד, בלי סכמה) + מבנה תיקיות + README + .env.example.

## 2026-07-31 — שלב 2: סכמת Prisma מלאה
כל הטבלאות מסעיף 3 של המסמך (Product/ProductVariant/Color/ColorImage/Size/Category, User/Account/Session/VerificationToken/Address, Order/OrderItem, ShippingSetting/PickupLocation) + migration ראשוני שנוצר ואומת מול Postgres זמני ב-docker. הנמקות מלאות ב-DECISIONS.md.

## 2026-07-31 — שלב 3: i18n (עברית/צרפתית/אנגלית, RTL/LTR)
next-intl עם ניתוב `[locale]`, עברית כברירת מחדל ב-`/` (בלי prefix), `dir="rtl"/"ltr"` אוטומטי, קבצי תרגום `messages/{he,fr,en}.json`, בורר שפה. תוך כדי גילינו ותיעדנו breaking change אמיתי של Next.js 16 (`middleware.ts` -> `proxy.ts`) והתאמנו אליו.

## 2026-07-31 — שלב 4: Auth (Google + Email)
NextAuth v4 + Prisma adapter, Google OAuth provider (placeholder credentials) + Credentials provider (email+password, bcryptjs). זרימות אימות מייל ואיפוס סיסמה מלאות מעל `VerificationToken`, שכבת מייל מודולרית (`src/lib/email`) עם Resend + fallback ל-console בפיתוח. עמודי sign-in/sign-up/forgot/reset עם תרגום מלא לשלוש שפות. כל ה-flow נבדק קצה-לקצה מול Postgres זמני. הנמקות ו-TODOs (Google OAuth app, Resend domain, NEXTAUTH_SECRET אמיתי) ב-DECISIONS.md.

## 2026-07-31 — שלב 5: חנות בסיסית (בית, מוצר, עגלה)
דף בית עם "הגעות חדשות", דף קטגוריה, דף מוצר (גלריה לפי צבע, בורר מידות עם מלאי בזמן אמת, "נשארו רק X!"), עגלה (Zustand + localStorage). Header/Footer קבועים ב-route group `(storefront)` חדש. נוסף `prisma/seed.ts` עם נתוני דמו (2 קטגוריות, 3 מוצרים, תמונות placeholder) לצורך פיתוח ובדיקות. כל הזרימה נבדקה בפועל (עברית ואנגלית) מול Postgres זמני עם seed. החלטה עסקית פתוחה (מטבע יחיד ₪ בלי המרה) מתועדת ב-DECISIONS.md לבדיקתך.

## 2026-07-31 — שלב 6: Checkout + הזמנות + לוגיקת מלאי
עמוד checkout מלא (פרטי קשר, משלוח/איסוף עצמי, סיכום הזמנה), שכבת תשלומים מודולרית (`src/lib/payments`) עם `PaymentProvider` interface, placeholder ברור ל-U-PAY/Summit (זורק שגיאה עם TODO מפורט - לא בודה API), ו-`MockPaymentProvider` לבדיקות מקומיות. לוגיקת המלאי הקריטית (ירידת מלאי אטומית רק במעבר ל-PAID, מניעת Overselling) מומשה ונבדקה בפועל בתנאי race אמיתי - שתי הזמנות מקבילות על יחידת המלאי האחרונה: אחת PAID, השנייה בוטלה אוטומטית, מלאי לא ירד מתחת לאפס. גם עמוד אישור הזמנה + מייל אישור. **חסימה מרכזית לפני production:** צריך מסמכי API אמיתיים של U-PAY (ר' DECISIONS.md).

## 2026-07-31 — שלב 7: פאנל ניהול - מוצרים/צבעים/מידות/תמונות
נוסף `/admin` (עברית בלבד, שתי שכבות הרשאה: page guard + API guard) עם ניהול מוצרים מלא: טבלה עם חיפוש/סינון (קטגוריה/סטטוס/מלאי נמוך), יצירה ועריכה עם טאבים HE/FR/EN, ניהול צבעים (שם רב-לשוני + hex + גלריית תמונות לפי URL), ניהול מידות ומלאי לכל צבע עם עריכה inline, שכפול מוצר. הועלאת תמונות היא כרגע לפי קישור URL (לא file upload אמיתי) כי אין עדיין ספק אחסון מוגדר - מתועד ב-DECISIONS.md. כל הזרימה נבדקה בפועל מול Postgres זמני, כולל בדיקת הרשאות (CUSTOMER חסום מה-UI וגם מה-API).

## 2026-07-31 — שלב 8: פאנל ניהול - הזמנות/משתמשים/הגדרות משלוח
ניהול הזמנות (רשימה עם סינון סטטוס, עמוד פרטים עם פריטים+תמונה+כתובת/נקודת איסוף, עדכון סטטוס, הדפסת תעודת משלוח דרך הדפדפן), ניהול משתמשים (רשימה עם סה"כ הזמנות/הוצאה, חסימה/ביטול חסימה, היסטוריית הזמנות לכל משתמש), הגדרות משלוח (מחיר ארצי + סף למשלוח חינם) ונקודות איסוף (הוספה/הסרה/הפעלה-כיבוי). נבדק קצה-לקצה כולל אימות שחסימת משתמש חוסמת התחברות מיידית בפועל.

## 2026-07-31 — שלב 9: דשבורד ניהול + גרפים
דף `/admin` הוחלף בדשבורד אמיתי: 4 כרטיסי KPI (הזמנות היום, מכירות החודש, מלאי נמוך, ממתינות לטיפול), גרף מכירות יומי ל-14 יום אחרונים (recharts), ורשימת "מוצרים חמים" (הכי נמכרים). נבדק מול Postgres זמני עם הזמנות אמיתיות - כל המספרים אומתו ישירות מול שאילתות SQL.
