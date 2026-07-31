# NORINA

חנות אונליין (E-commerce) לביגוד נשים יוקרתי, בשלוש שפות: עברית (RTL, ברירת מחדל), צרפתית ואנגלית.

מסמך האפיון המלא של הפרויקט נמצא אצל בעלת הפרויקט - כל שלב פיתוח מתבצע לפי תוכנית העבודה שמפורטת שם.

## סטאק טכנולוגי

- **Next.js 16 (App Router) + TypeScript** - Frontend + API Routes
- **Tailwind CSS v4** - עיצוב
- **Prisma + PostgreSQL** - ORM ומסד נתונים
- בהמשך: next-intl (i18n), NextAuth.js (Auth), Stripe/סליקה ישראלית (תשלומים), Resend (מייל)

## מבנה הפרויקט

```
norina-website/
├── prisma/
│   └── schema.prisma        # סכמת ה-DB (עדיין ריקה - נבנה בשלב הבא)
├── public/                  # קבצים סטטיים
├── src/
│   ├── app/                 # דפי Next.js App Router (routes, layouts)
│   ├── components/
│   │   ├── ui/               # רכיבי UI כלליים (כפתורים, שדות וכו')
│   │   └── layout/            # רכיבי מבנה (header, footer, nav...)
│   ├── lib/
│   │   └── prisma.ts         # Prisma client singleton
│   └── generated/prisma/     # קוד ה-Prisma client שנוצר אוטומטית (לא לערוך ידנית, לא ב-git)
├── .env.example              # רשימת משתני הסביבה הנדרשים (להעתיק ל-.env)
└── prisma.config.ts           # קונפיגורציית Prisma
```

## הרצה מקומית

```bash
npm install
cp .env.example .env   # ולמלא ערכים אמיתיים
npx prisma generate
npm run dev
```

האתר יעלה בכתובת [http://localhost:3000](http://localhost:3000).

## סטטוס נוכחי

זהו שלב 1 מתוך תוכנית העבודה: **הקמת השלד הטכני בלבד**.
עדיין אין סכמת DB, i18n, Auth, עמודי חנות או פאנל ניהול - אלה יתווספו בשלבים הבאים.
