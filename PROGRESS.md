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
