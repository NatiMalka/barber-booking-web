import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translations directly
const heTranslation = {
  common: {
    appName: 'מספרת בר ארזי',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצלחה',
    cancel: 'ביטול',
    save: 'שמור',
    confirm: 'אישור',
    back: 'חזרה',
    next: 'הבא',
    submit: 'שלח',
  },
  booking: {
    title: 'הזמנת תור',
    date: 'תאריך',
    time: 'שעה',
    service: 'שירות',
    people: 'מספר אנשים',
    notification: 'אופן קבלת עדכונים',
    email: 'אימייל',
    sms: 'SMS',
    whatsapp: 'וואטסאפ',
    name: 'שם מלא',
    phone: 'טלפון',
    notes: 'הערות',
    contactInfo: 'פרטי התקשרות',
    confirmation: 'אישור הזמנה',
  },
  hours: {
    sundayToWednesday: 'ימי א - ד | 09:00 - 20:00',
    thursday: 'יום ה | 08:00 - 21:00',
    friday: 'יום ו | 08:00 - 15:00',
    holidayEve: 'ערבי חג המספרה פתוחה במתכונת ימי שישי',
    holidayAndSaturday: 'ימי שבת וחגים המספרה סגורה',
  },
};

// the translations
const resources = {
  he: {
    translation: heTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he',
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n; 