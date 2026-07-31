# NORINA — Progress Log

לוג קצר של כל שלב שהושלם. לפירוט טכני ראו commit history ו-DECISIONS.md.

## 2026-07-31 — שלב 1: הקמת פרויקט
Next.js 16 + TypeScript + Tailwind v4 + Prisma 6.19.3 (datasource בלבד, בלי סכמה) + מבנה תיקיות + README + .env.example.

## 2026-07-31 — שלב 2: סכמת Prisma מלאה
כל הטבלאות מסעיף 3 של המסמך (Product/ProductVariant/Color/ColorImage/Size/Category, User/Account/Session/VerificationToken/Address, Order/OrderItem, ShippingSetting/PickupLocation) + migration ראשוני שנוצר ואומת מול Postgres זמני ב-docker. הנמקות מלאות ב-DECISIONS.md.

## 2026-07-31 — שלב 3: i18n (עברית/צרפתית/אנגלית, RTL/LTR)
next-intl עם ניתוב `[locale]`, עברית כברירת מחדל ב-`/` (בלי prefix), `dir="rtl"/"ltr"` אוטומטי, קבצי תרגום `messages/{he,fr,en}.json`, בורר שפה. תוך כדי גילינו ותיעדנו breaking change אמיתי של Next.js 16 (`middleware.ts` -> `proxy.ts`) והתאמנו אליו.
