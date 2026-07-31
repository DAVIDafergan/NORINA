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

---

## Stage 3 — i18n (HE/FR/EN, RTL/LTR)

- **ספריית i18n: `next-intl`** (ולא `next-i18next`) - זו הבחירה הסטנדרטית והמומלצת היום לפרויקטי App Router (תומכת Server Components, `generateStaticParams` לכל שפה, וניתוב מבוסס `[locale]` מובנה). המסמך הציע את שתיהן; `next-i18next` מיועדת בעיקר ל-Pages Router הישן.
- **מבנה ניתוב:** `src/app/[locale]/...` עם `localePrefix: "as-needed"` - עברית (ברירת המחדל) מוגשת ב-`/` בלי prefix, וצרפתית/אנגלית ב-`/fr` ו-`/en`. גישה מפורשת ל-`/he` מפנה (307) לנתיב הקנוני `/`. זו ההתנהגות הסטנדרטית של next-intl ומתאימה לדרישת "עברית כברירת מחדל" מהמסמך.
- **RTL/LTR אוטומטי:** `src/i18n/routing.ts` מגדיר מיפוי `localeDirections` (he=rtl, fr/en=ltr), וה-layout (`src/app/[locale]/layout.tsx`) שם את זה על `<html dir="...">` לפי השפה הנוכחית - מתחלף אוטומטית עם ניווט/בורר שפה, בלי JS צד לקוח נוסף.
- **Next.js 16 breaking change שגילינו תוך כדי:** קובץ ה-middleware הישן (`middleware.ts`) הוחלף רשמית ב-`proxy.ts` (הפונקציה נקראת `proxy` במקום `middleware`) - זה תועד ב-`node_modules/next/dist/docs/.../file-conventions/proxy.md` ובמדריך השדרוג לגרסה 16. next-intl עדיין מספק `createMiddleware`, אבל קראנו לקובץ `src/proxy.ts` ולפונקציה `proxy` כדי להתאים למוסכמה החדשה (הישנה עדיין עובדת אך מוצגת כ-deprecated).
- **קבצי תרגום:** `messages/{he,fr,en}.json` עם namespaces לפי תחום (`common`, `nav`, `home` בשלב הזה). בהמשך כל שלב שמוסיף פיצ'ר יוסיף namespace תואם (למשל `product`, `cart`, `checkout`, `admin`) - כדי לעמוד בדרישת המסמך שכל טקסט (כולל הודעות שגיאה ומיילים) יהיה בשלוש שפות.
- **בורר שפה:** קומפוננטת `LanguageSwitcher` (`src/components/layout/language-switcher.tsx`) - `<select>` פשוט שמנווט עם `next-intl`'s `useRouter`/`usePathname` שמכבד את ה-locale prefix. זה placeholder פונקציונלי; העיצוב הסופי (שלב 10) יחליף אותו ברכיב מותאם למיתוג היוקרתי.

---

## Stage 4 — Auth (NextAuth Google + Email)

- **NextAuth.js גרסה 4 (יציבה), לא v5/Auth.js:** נכון לזמן הכתיבה v5 עדיין ב-beta (`5.0.0-beta.32` ב-npm, אחרי עשרות iterations בלי GA). לפי כלל "לבחור את הפתרון הכי בטוח/סטנדרטי" - v4.24.15 (יציבה, GA) עדיפה לאתר איקומרס בפרודקשן על פני beta ארוך-טווח. v4 עובדת מצוין עם App Router (route handler ב-`src/app/api/auth/[...nextauth]/route.ts`, `getServerSession` בקומפוננטות שרת).
- **Adapter:** `@next-auth/prisma-adapter` (המקביל היציב ל-v4; לא `@auth/prisma-adapter` שמיועד ל-v5).
- **Session strategy: JWT** (לא database sessions) - חובה כש-CredentialsProvider בשימוש (מגבלה של NextAuth עצמו).
- **סיסמאות:** `bcryptjs` (מימוש JS טהור) ולא `bcrypt` (שדורש קומפילציית native/node-gyp) - נמנע מבעיות build בפריסה ל-serverless/Vercel. 12 salt rounds.
- **אימות מייל + איפוס סיסמה - זרימה עצמאית, לא חלק מ-NextAuth:** בנינו את זה ידנית מעל טבלת `VerificationToken` הקיימת (טוקן רנדומלי 32-byte, נשמר ב-DB רק בתור hash של SHA-256, עם תפוגה של שעה) - כי NextAuth v4 עם CredentialsProvider לא כולל flow כזה מובנה (ה-EmailProvider המובנה הוא magic-link, לא מתאים לדרישת "התחברות עם סיסמה + אימות מייל" מהמסמך). ה-identifier בטבלה מבחין בין `verify-email:<email>` ל-`reset-password:<email>` כדי שלא יתנגשו.
- **אימות מייל לא חוסם התחברות:** נרשם `emailVerified=null` בהרשמה, ונשלח מייל אימות, אבל `authorize()` לא בודק `emailVerified` לפני התחברות. המסמך מבקש "הרשמה... כולל אימות מייל" כפיצ'ר, לא במפורש חסימת כניסה - שמרתי על UX פשוט יותר. אפשר להקשיח בעתיד אם תרצי לחייב אימות לפני קנייה.
- **מניעת user enumeration:** `/api/auth/forgot-password` תמיד מחזיר תשובה זהה בין אם המייל קיים או לא, ושולח מייל רק אם המשתמש קיים וכן יש לו סיסמה (משתמש Google-only לא מקבל מייל reset). practice סטנדרטי לאבטחה.
- **שכבת מייל מודולרית (`src/lib/email/`):** בדיוק כמו שביקשת לגבי תשלומים - `EmailSender` interface, מימוש אמיתי מול **Resend** (ה-provider הראשון שהמסמך מציע, וה-API שלו מתועד פומבית כך שאפשר לממש נכון בלי לנחש), ומימוש `ConsoleSender` שרץ אוטומטית כש-`RESEND_API_KEY` לא מוגדר - כך שסביבת הפיתוח לא נתקעת בלי credentials אמיתיים. כתובת השולח (`FROM_ADDRESS`) היא placeholder עם TODO - צריך דומיין שולח מאומת ב-Resend.
- **עמודי Auth (`sign-in`, `sign-up`, `forgot-password`, `reset-password`):** נבנו תחת route group `(auth)` בתוך `[locale]`, עם כל הטקסטים דרך namespace `auth` בקבצי התרגום (שלוש שפות מלאות, כולל תוכן המיילים).
- **מגבלה ידועה - `pages.signIn` הסטטי מול locale:** NextAuth v4 מגדיר `pages.signIn: "/sign-in"` כמחרוזת קבועה בלי גישה ל-locale של הבקשה. זה עובד נכון לעברית (ברירת המחדל, בלי prefix), אבל אם NextAuth עצמו יפנה (redirect) משתמש לא-מחובר לעמוד ההתחברות, זה יקרה תמיד ל-`/sign-in` (עברית) גם למשתמשי FR/EN. כרגע אין עדיין נתיבים מוגנים (Admin מגיע בשלבים 7-8), אז זה לא משפיע בפועל. **TODO לשלב 7/8:** לבנות guard ל-locale-aware redirect בעצמנו (ב-`proxy.ts` או ב-layout של ה-admin) במקום להסתמך על `pages.signIn` הגלובלי.
- **בדיקת קצה-לקצה:** כל ה-flow (הרשמה → אימות מייל → התחברות → שכחתי סיסמה → איפוס → התחברות עם הסיסמה החדשה) נבדק בפועל מול Postgres זמני ב-docker ו-`npm run dev` אמיתי, כולל בדיקת ה-DB וה-session cookies. הקונטיינר נהרס בסיום.

**מה עוד צריך ממך:**
1. **Google OAuth:** ליצור פרויקט ב-Google Cloud Console, להגדיר OAuth consent screen, וליצור OAuth Client ID (Web application) עם Authorized redirect URI: `https://<הדומיין-שלך>/api/auth/callback/google` (ולסביבת פיתוח: `http://localhost:3000/api/auth/callback/google`). את ה-Client ID וה-Client Secret יש להכניס ל-`.env` כ-`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
2. **NEXTAUTH_SECRET אמיתי:** לייצר ערך רנדומלי חזק (למשל `openssl rand -base64 32`) ל-production - זה לא credential חיצוני אלא סוד שנוצר מקומית, אבל חייב להיות שונה מכל ערך פיתוח/דוגמה.
3. **Resend:** ליצור חשבון, לאמת דומיין שולח, ולהחליף את `FROM_ADDRESS` הפלייסהולדר ב-`src/lib/email/resend-sender.ts` בכתובת אמיתית מהדומיין המאומת, ולהכניס `RESEND_API_KEY` אמיתי.
