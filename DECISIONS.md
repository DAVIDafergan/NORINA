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

---

## Stage 5 — Storefront basics (home, product page, cart)

- **מטבע: ₪ (ILS) קבוע, בלי המרה לפי שפה:** המסמך עצמו מסמן את זה כשאלה פתוחה (סעיף 10: "מטבע ברירת מחדל... עם המרה ל-€/$?"). לפי כלל "לבחור את הפתרון הכי בטוח, לתעד, להמשיך" - בחרתי להציג ₪ בכל השפות (רק הפורמט המספרי מתחלף לפי locale דרך `Intl.NumberFormat`, לא הערך/המטבע עצמו) כי זה העסק הישראלי הראשי (Tranzila/Cardcom/U-PAY מחייבים ₪ ממילא) וכי המרת מטבעות בזמן אמת דורשת שער חליפין חי ומדיניות תמחור - זו החלטה עסקית, לא טכנית, ולכן לא ניחשתי אותה. **את זה כדאי שתחליטי בעצמך** - אם תרצי הצגת מחירים ב-€/$ ללקוחות דוברי צרפתית/אנגלית, זו תוספת נפרדת (שכבת המרה + מדיניות עדכון שער) שאפשר להוסיף בהמשך.
- **מבנה Route Groups:** פיצלתי את `[locale]` לשלושה קבוצות ניתוב: `(storefront)` (חנות, עם header+footer קבועים), `(auth)` (בלי header/footer, כבר משלב 4). `(admin)` יתווסף בשלב 7 עם layout נפרד לגמרי (סיידבר ניהול).
- **State לעגלה: Zustand + persist ל-localStorage, בלי טבלת DB:** תואם להחלטה שתועדה כבר בשלב 2 (אין טבלת Cart בסכמה) ולרוח המסמך (עגלה היא session-local עד ה-checkout). `zustand` הוא הבחירה הסטנדרטית הקלה ביותר לניהול state כזה ב-React/Next בלי boilerplate של Context. פריטי העגלה שומרים "תמונת מצב" (שם/צבע/מידה/מחיר) בזמן ההוספה כדי שהעגלה תישאר תקינה גם אם המוצר משתנה אחר כך בפאנל הניהול.
- **הידרציה בטוחה ל-SSR:** נעשה שימוש ב-`persist.hasHydrated()`/`onFinishHydration` של zustand דרך `useSyncExternalStore` (ולא ב-`useEffect` + `setState` פשוט) - חוק ESLint חדש בפרויקט (`react-hooks/set-state-in-effect`) חסם את התבנית הנאיבית, וזה בכל מקרה ה-pattern הרשמי המומלץ של zustand לעבודה עם Next.js SSR.
- **תמונות פלייסהולדר לפיתוח:** נוצר `prisma/seed.ts` עם 2 קטגוריות, 5 מידות, ו-3 מוצרים לדוגמה (עם צבעים/וריאנטים/מלאי), עם תמונות מ-`picsum.photos` (שירות placeholder ציבורי ומוכר) - כדי שאפשר יהיה לבדוק ולהדגים את החנות בלי לחכות לתמונות מוצר אמיתיות. `next.config.ts` מוגדר להתיר את הדומיין הזה בלבד; יוחלף בדומיין האחסון האמיתי (Supabase/S3/R2) בשלב 7. הרצה: `npx prisma db seed`.
- **מלאי מוצג בעדינות:** "נשארו רק X!" מוצג רק כשהמלאי בין 1 ל-3 יחידות (כדי לא להציף בהודעות דחיפות מיותרות); מידה עם מלאי 0 מוצגת אבל disabled.
- **מה עדיין placeholder בכוונה (מתוכנן לשלבים הבאים):**
  - כפתור "לתשלום" בעגלה מושבת (`disabled`) - ה-checkout עצמו הוא שלב 6.
  - אין עדיין "מדריך מידות" אינטראקטיבי מלא (section 7, פיצ'ר עתידי) - רק תווית `product.sizeGuide` מוכנה בתרגומים.
  - "sticky add to cart" למובייל ופוליש עיצובי כללי - שלב 10.
- **בדיקת קצה-לקצה אמיתית:** דף בית, דף קטגוריה, דף מוצר (כולל בחירת צבע/מידה) ועגלה נבדקו בפועל מול Postgres זמני עם נתוני seed, בעברית ואנגלית. תוך כדי התגלתה ותוקנה תקלה של cache ישן בין `next build` ל-`next dev` (`.next` דורש ניקוי בין השניים ב-Turbopack) - לא קשור לקוד עצמו, נרשם כאן ליתר ביטחון להמשך.

---

## Stage 6 — Checkout, orders & inventory logic (הכי קריטי - תשלומים + מלאי)

- **סכמה הורחבה (migration שנייה, `checkout_order_fields`):** גיליתי תוך כדי בנייה שהסכמה המקורית של `Order` (שלב 2) לא תמכה ב-checkout בפועל: `Address.userId` היה חובה (בלתי אפשרי ל-guest checkout בלי חשבון), ול-`Order` לא היה שדה כתובת/נקודת איסוף אמיתי (`shippingCity` היה string חופשי, לא FK). תיקנתי: `Address.userId` נהיה אופציונלי (כתובת חד-פעמית ל-guest), ול-`Order` נוספו `contactName/contactEmail/contactPhone` (snapshot תמיד, גם למשתמש מחובר - הנמען יכול להיות שונה מבעל החשבון), `addressId` (FK אמיתי ל-Address, לא רק ל-shipping), ו-`pickupLocationId` (FK אמיתי ל-PickupLocation במקום מחרוזת עיר חופשית - תואם יותר לדרישת "בחירת עיר מרשימה שהמנהלת הגדירה" בסעיף 6). נוצרה עם `prisma migrate dev` מול Postgres זמני (שוב - container חד-פעמי, נהרס בסוף), לא squash של המיגרציה הראשונה, כדי לשמור היסטוריה אמיתית.
- **תשלומים - U-PAY/Summit:** בהתאם להנחיה שלך, נבנתה שכבת adapter מלאה (`src/lib/payments/`): `PaymentProvider` interface (`createPayment`, `parseWebhook`), ו-`UPaySummitProvider` הוא **placeholder טהור** - שתי המתודות שלו זורקות שגיאה מפורשת עם TODO מפורט (מה בדיוק חסר: endpoint ליצירת עסקה, סכמת webhook signature, האם Bit נתמך כאמצעי נפרד או כשורה באותו hosted page). לא ניחשתי שום endpoint או פורמט - כי המשמעות היתה קוד שנראה כאילו עובד אבל לא באמת מתקשר עם U-PAY.
- **MockPaymentProvider - כלי פיתוח, לא הטמעה אמיתית:** כדי שאפשר יהיה לבנות ולבדוק את כל שרשרת ה-checkout (כולל הלוגיקה הקריטית של מלאי) בלי credentials אמיתיים של U-PAY, נוסף ספק "מדומה" שמדמה הצלחת תשלום מיידית דרך redirect ל-`/api/payments/mock/complete` - שמפעיל בדיוק את אותה פונקציית אישור תשלום (`confirmOrderPayment`) שגם webhook אמיתי יפעיל. ברירת המחדל (`PAYMENT_PROVIDER=mock` ב-`.env.example`) - **חובה לשנות ל-`upay` ולהשלים את המימוש לפני production**, אחרת ה-checkout לא באמת גובה כסף.
- **לוגיקת המלאי - בדיוק לפי "כלל הזהב" בסעיף 8 של המסמך:** המלאי **לא** יורד ביצירת ההזמנה (סטטוס PENDING) - רק במעבר ל-PAID, בטרנזקציה אטומית אחת (`src/lib/orders/confirm-payment.ts`) שמשתמשת ב-`updateMany` עם תנאי `stockQuantity: { gte: quantity }`. אם התנאי נכשל (המלאי כבר נלקח על ידי מישהו אחר) - הטרנזקציה כולה נכשלת וההזמנה עוברת ל-`CANCELLED` אוטומטית. **נבדק בפועל בתנאי race אמיתי**: הרצתי שתי בקשות checkout+תשלום *במקביל* על אותה יחידת מלאי אחרונה (stock=1) - התוצאה: הזמנה אחת PAID, השנייה CANCELLED אוטומטית, מלאי סופי = 0 (לא שלילי). זו בדיוק הדרישה מהמסמך למניעת Overselling.
- **מחירים תמיד מהשרת, לא מהלקוח:** ה-API של `/api/checkout` מקבל מהלקוח רק `variantId` + `quantity` - המחיר נגזר תמיד מה-DB (`priceOverride ?? basePrice`) בזמן יצירת ההזמנה, כדי שלא יהיה אפשר לזייף מחיר מהדפדפן.
- **Guest checkout נתמך** (`userId: null` על ה-Order) - תואם לדרישת "Guest checkout אופציונלי" בסעיף 6.
- **מה עדיין TODO בכוונה:**
  - כל מימוש U-PAY בפועל (endpoints, חתימת webhook, Bit) - ממתין למסמכי API.
  - החזר כספי אוטומטי כשהזמנה מתבטלת מחוסר מלאי אחרי תשלום - כרגע רק מסומנת `CANCELLED`, טיפול ידני דרך פאנל הניהול (שלב 8) + חוסר יכולת להחזיר כסף בלי API אמיתי של U-PAY.
  - עמוד "checkout נכשל/בוטל" (cancelUrl כבר מוגדר וזורם ל-`/checkout`, אבל אין הודעת שגיאה ייעודית עדיין).

**מה עוד צריך ממך:** מסמכי API של U-PAY/Summit (endpoints, אימות, webhook signature) כדי להשלים את `src/lib/payments/upay-summit-provider.ts` ואת `PAYMENT_PROVIDER=upay` ב-env - **בלי זה החנות לא יכולה לגבות תשלום אמיתי**, זו החסימה המרכזית להשקה.


