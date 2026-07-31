# NORINA — Technical Decisions Log

מסמך זה מתעד החלטות טכניות משמעותיות שהתקבלו במהלך הפיתוח העצמאי (שלבים 2-10), כולל ההנמקה. נכתב לפי כלל העבודה: כשיש כמה כיוונים אפשריים - נבחר הפתרון הכי סטנדרטי/בטוח, מתועד כאן, וממשיכים הלאה בלי לעצור.

---

## Stage 1 (recap)

- **Package manager:** npm
- **Folder layout:** `src/` directory
- **Tailwind:** v4
- **Prisma version:** פינד ל-6.19.3 (לא latest 7.x) כי `@prisma/streams-local` דורש Node >=22, והמכונה הזו מריצה Node 20. יש לשקול שדרוג כש-Node 22 יהיה זמין.
- **DB provider:** PostgreSQL

---

## Stage 2 — Prisma schema

- **ID strategy:** `String @id @default(cuid())` בכל הטבלאות. סטנדרטי, בטוח, לא חושף IDs עוקבים.
- **i18n בשדות טקסט:** שדה `Json` יחיד לכל טקסט רב-לשוני (למשל `Product.name`), עם השייפ `{ he, fr, en }` בשכבת האפליקציה (`src/lib/types.ts` -> `LocalizedText`). Prisma לא תומך ב-typed JSON validation ברמת ה-DB, אז האכיפה תהיה בקוד (Zod וכו') בשלבים הבאים.
- **כסף:** כל שדה מחיר הוא `Decimal @db.Decimal(10,2)` ולא `Float`, כדי למנוע שגיאות עיגול בכסף - best practice סטנדרטי.
- **Category.slug:** נוסף שדה `slug` שלא הופיע במפורש במסמך, כי צריך URL-ים יציבים לקטגוריות בחנות. באותה רוח `Product.slug` שכבר היה במסמך.
- **ColorImage כטבלה נפרדת (ולא `String[]`):** המסמך כתב `images[]`, אבל כדי לתמוך בסדר תצוגה (drag-reorder בפאנל ניהול, שלב 7) ובהרחבות עתידיות (alt text וכו'), זו טבלה נפרדת עם `order`. Postgres תומך גם ב-`String[]` native אבל זה פחות גמיש להרחבה.
- **Size הוא גלובלי (לא per-product):** בדיוק כפי שהמסמך הגדיר - `id, label, order_index` בלי `product_id`. הזמינות בפועל של מידה למוצר/צבע נקבעת דרך `ProductVariant`. `@@unique([colorId, sizeId])` מוודא שאין כפילות של אותו שילוב.
- **NextAuth Prisma Adapter:** נוספו המודלים `Account`, `Session`, `VerificationToken` בדיוק בשם ובשדות שה-Prisma Adapter הרשמי של NextAuth.js דורש (ר' תיעוד next-auth), כדי שהאדפטר יעבוד בלי מיפוי מותאם אישית. `VerificationToken` ישמש גם ל-magic link וגם לאיפוס סיסמה.
- **`User.password`:** שדה נוסף (nullable) שלא קיים בסכימת NextAuth הסטנדרטית, כי תמיכה ב-Email+Password (לא רק Google) דורשת שמירת hash. ריק למשתמשי Google בלבד.
- **`User.role`/`isBlocked`:** תואם לדרישת פאנל הניהול (הרשאות אדמין, חסימת משתמש).
- **בלי snapshot לשדות היסטוריים ב-`OrderItem`:** לא הוספתי שכפול (denormalization) של שם/צבע/מידה בזמן הרכישה, למרות שזו תוספת נפוצה בחנויות (מגנה מפני שינוי/מחיקת מוצר בעתיד). נשארתי צמוד למסמך (`product_variant_id, quantity, price_at_purchase`) כדי לא לחרוג מהיקף השלב. אפשר להוסיף בעתיד אם תרצי.
- **שדות תשלום ב-`Order`:** נוספו `paymentProvider`, `paymentReference`, `paidAt` (nullable) כהכנה לשכבת האדפטר של U-PAY בשלב 6, כדי לא לעשות migration נוסף רק בשביל זה.
- **`ShippingSetting` כ-singleton:** טבלה בלי unique constraint על "יש רק שורה אחת" (Prisma לא תומך בזה ישירות) - האכיפה תהיה בשכבת האפליקציה (תמיד לקרוא/לעדכן את השורה הראשונה) בשלב 8.
- **תכונות מסעיף 7 (Wishlist, ביקורות, קופונים, מועדון לקוחות, "מוצרים קשורים", התראת מלאי) לא נכללו בסכמה:** המסמך מגדיר את שלב 2 כ"כל הטבלאות מסעיף 3" בלבד - סעיף 7 הוא רשימת פיצ'רים מומלצים לעתיד, לא חלק מהיקף השלב.
- **ולידציה של הסכמה:** הרצתי `prisma migrate dev` מול קונטיינר Postgres זמני (docker, לא שירות אמיתי) רק כדי ליצור ולבדוק migration אמיתי, ואז הרסתי את הקונטיינר. זה לא "credentials מזויפים" - זה תשתית dev חד-פעמית שלא נשארת בשום מקום. ה-migration שנוצר (`prisma/migrations/20260731150958_init/`) מחכה עכשיו ל-`DATABASE_URL` אמיתי כדי שתריצי `prisma migrate deploy` (או `migrate dev`) מולו.

**מה עוד צריך ממך:** DATABASE_URL אמיתי (Supabase/Neon) כדי להריץ את ה-migration הזה בפועל מול DB אמיתי.
