# מספרת בר ארזי - מערכת הזמנת תורים

מערכת מודרנית להזמנת תורים למספרת בר ארזי, עם ממשק משתמש אינטואיטיבי ותמיכה מלאה בעברית.

## תכונות עיקריות

### צד לקוח
- הזמנת תור בתהליך פשוט ואינטואיטיבי
- בחירת תאריך ושעה
- בחירת שירות ומספר אנשים
- בחירת אמצעי התראה (אימייל, SMS, וואטסאפ)
- צפייה בסטטוס ההזמנה
- ביטול תורים

### צד מנהל (ספר)
- לוח בקרה עם סקירה של התורים הקרובים
- ניהול בקשות תורים (אישור או דחייה)
- ניהול לוח זמנים וזמינות
- ניהול לקוחות וצפייה בהיסטוריית תורים

## טכנולוגיות

- **Frontend**: React.js (Next.js) עם Material UI
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Notifications**: Firebase Cloud Messaging, WhatsApp API

## התקנה והפעלה

### דרישות מקדימות
- Node.js (גרסה 18 ומעלה)
- npm או yarn

### שלבי התקנה

1. שכפל את המאגר:
```bash
git clone https://github.com/NatiMalka/barber-booking-web.git
cd barber-booking-web
```

2. התקן את התלויות:
```bash
npm install
```

3. הפעל את הפרויקט במצב פיתוח:
```bash
npm run dev
```

4. פתח את הדפדפן בכתובת [http://localhost:3000](http://localhost:3000)

## בנייה לייצור

כדי לבנות את האפליקציה לסביבת ייצור:

```bash
npm run build
```

להפעלת גרסת הייצור:

```bash
npm run start
```

## פריסה

הפרויקט מוגדר לפריסה ב-GitHub Pages. כדי לפרוס את האפליקציה:

```bash
npm run deploy
```

## מבנה הפרויקט

```
barbar-booking-web/
├── public/             # קבצים סטטיים
├── src/                # קוד המקור
│   ├── app/            # דפי האפליקציה (Next.js App Router)
│   │   ├── admin/      # דפי מנהל
│   │   ├── client/     # דפי לקוח
│   │   ├── auth/       # דפי אימות
│   ├── components/     # רכיבים משותפים
│   ├── firebase/       # הגדרות Firebase
│   ├── hooks/          # React Hooks מותאמים אישית
│   ├── locales/        # קבצי תרגום
│   ├── utils/          # פונקציות עזר
├── package.json        # תלויות והגדרות
└── README.md           # תיעוד
```

## רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים.
