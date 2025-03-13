'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Check, 
  Close, 
  CalendarMonth, 
  AccessTime, 
  Person, 
  Phone, 
  Email,
  Notifications,
  ChildCare,
  Search,
  Delete,
  Edit,
  Dashboard as DashboardIcon,
  EventAvailable,
  EventBusy,
  PendingActions,
  Refresh,
  TrendingUp,
  ClearAll,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format, isToday, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  getAllAppointments, 
  getAppointmentsByStatus, 
  updateAppointmentStatus, 
  deleteAppointment,
  Appointment as AppointmentType,
  createAppointment,
  getAppointmentById,
  findAppointmentInAllCollections,
  getAllAppointmentsFromAllCollections
} from '@/firebase/services/appointmentService';
import { Timestamp } from 'firebase/firestore';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  getDoc,
  doc,
  setDoc,
  deleteDoc as firestoreDeleteDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Define services map for display
const servicesMap: Record<string, string> = {
  'haircut': 'תספורת גברים',
  'kids': 'תספורת ילדים',
  'beard': 'עיצוב זקן',
  'combo': 'תספורת + עיצוב זקן'
};

// Define notification methods map for display
const notificationMethodsMap: Record<string, string> = {
  'whatsapp': 'וואטסאפ',
  'sms': 'SMS',
  'email': 'אימייל'
};

// Define status colors
const statusColors: Record<string, string> = {
  'pending': 'warning',
  'approved': 'success',
  'rejected': 'error',
  'cancelled': 'error'
};

// Define status labels
const statusLabels: Record<string, string> = {
  'pending': 'ממתין לאישור',
  'approved': 'מאושר',
  'rejected': 'נדחה',
  'cancelled': 'בוטל'
};

// Define appointment status type
type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Extended appointment type for mock data
interface ExtendedAppointment {
  id?: string;
  date: Date;
  time: string;
  service: string;
  people: number;
  notificationMethod: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  withChildren?: boolean;
  childrenCount?: number;
}

// Mock data for appointments (will be replaced with real data)
const mockAppointments: ExtendedAppointment[] = [
  {
    id: '1',
    date: new Date(2025, 2, 15, 10, 0),
    time: '10:00',
    service: 'haircut',
    people: 1,
    withChildren: true,
    childrenCount: 2,
    notificationMethod: 'whatsapp',
    name: 'ישראל ישראלי',
    phone: '0501234567',
    email: 'israel@example.com',
    notes: '',
    status: 'pending'
  },
  {
    id: '2',
    date: new Date(2025, 2, 15, 11, 0),
    time: '11:00',
    service: 'combo',
    people: 1,
    withChildren: false,
    childrenCount: 0,
    notificationMethod: 'sms',
    name: 'משה כהן',
    phone: '0521234567',
    email: '',
    notes: 'מבקש תספורת קצרה',
    status: 'pending'
  },
  {
    id: '3',
    date: new Date(2025, 2, 16, 14, 30),
    time: '14:30',
    service: 'kids',
    people: 2,
    withChildren: true,
    childrenCount: 3,
    notificationMethod: 'whatsapp',
    name: 'דוד לוי',
    phone: '0531234567',
    email: 'david@example.com',
    notes: 'שני ילדים',
    status: 'approved'
  },
  {
    id: '4',
    date: new Date(2025, 2, 17, 16, 0),
    time: '16:00',
    service: 'beard',
    people: 1,
    withChildren: false,
    childrenCount: 0,
    notificationMethod: 'email',
    name: 'יעקב אברהם',
    phone: '0541234567',
    email: 'yaakov@example.com',
    notes: '',
    status: 'approved'
  }
];

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not admin, redirect to home
    if (!authLoading && !isAdmin) {
      router.push('/auth/login');
    }
  }, [isAdmin, authLoading, router]);

  // הוספת רענון אוטומטי כל דקה
  useEffect(() => {
    // רענון ראשוני בטעינה
    refreshData();
    
    // הגדרת רענון אוטומטי כל דקה
    const intervalId = setInterval(() => {
      console.log('מרענן נתונים אוטומטית...');
      refreshData();
    }, 60000); // כל דקה
    
    // ניקוי ה-interval בעת עזיבת הדף
    return () => clearInterval(intervalId);
  }, []);

  // פונקציית עזר לרענון
  const refreshData = () => {
    handleRefresh();
  };

  // שיפור פונקציית טעינת התורים
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        console.log('מתחיל טעינת תורים מהשרת...');
        
        // Get appointments from Firebase
        console.log('קורא לפונקציה getAllAppointmentsFromAllCollections()...');
        const fetchedAppointments = await getAllAppointmentsFromAllCollections();
        console.log('תוצאת הקריאה ל-getAllAppointmentsFromAllCollections():', fetchedAppointments);
        console.log(`נטענו ${fetchedAppointments?.length || 0} תורים מכל הקולקציות`);
        
        if (fetchedAppointments && fetchedAppointments.length > 0) {
          // Create a new array with the correct types
          const typedAppointments: ExtendedAppointment[] = [];
          
          // Process each appointment and add it to the typed array
          fetchedAppointments.forEach(appointment => {
            try {
              // Log the raw date value for debugging
              console.log(`מעבד תור ${appointment.id} מקולקציה ${appointment._collection}, ערך תאריך:`, appointment.date, 'סטטוס:', appointment.status);
              
              // Check if date exists
              if (!appointment.date) {
                console.error(`תור ${appointment.id} חסר שדה תאריך`);
                // במקום לדלג על התור, נוסיף אותו עם תאריך ברירת מחדל
                typedAppointments.push({
                  ...appointment,
                  status: 'pending' as AppointmentStatus,
                  date: new Date(), // תאריך ברירת מחדל - היום
                });
                console.log(`תור ${appointment.id} נוסף עם תאריך ברירת מחדל לאחר שגיאה`);
                return;
              }
              
              // Ensure date is a valid Date object
              let appointmentDate;
              let appointmentStatus = appointment.status;
              
              // Make sure status is one of the valid values
              if (!['pending', 'approved', 'rejected', 'cancelled'].includes(appointmentStatus)) {
                console.warn(`תור ${appointment.id} מכיל סטטוס לא תקין: "${appointmentStatus}", מתקן ל-"pending"`);
                appointmentStatus = 'pending';
              }
              
              if (appointment.date instanceof Date) {
                appointmentDate = appointment.date;
              } else if (typeof appointment.date === 'object' && appointment.date !== null) {
                // Check if it's a Firestore Timestamp (has toDate method)
                const dateObj = appointment.date as any;
                if (dateObj.toDate && typeof dateObj.toDate === 'function') {
                  try {
                    appointmentDate = dateObj.toDate();
                  } catch (e) {
                    console.error(`נכשל בהמרת חותמת זמן Firestore עבור תור ${appointment.id}:`, e);
                    appointmentDate = new Date(); // תאריך ברירת מחדל
                  }
                } else if (dateObj.seconds !== undefined && dateObj.nanoseconds !== undefined) {
                  // Handle serialized Firestore Timestamp
                  try {
                    // Convert seconds and nanoseconds to milliseconds
                    const milliseconds = dateObj.seconds * 1000 + dateObj.nanoseconds / 1000000;
                    appointmentDate = new Date(milliseconds);
                  } catch (e) {
                    console.error(`נכשל בהמרת חותמת זמן מסודרת Firestore עבור תור ${appointment.id}:`, e);
                    appointmentDate = new Date(); // תאריך ברירת מחדל
                  }
                } else {
                  // Try to create a date from the object
                  try {
                    appointmentDate = new Date(appointment.date as any);
                  } catch (e) {
                    console.error(`נכשל בהמרת אובייקט תאריך עבור תור ${appointment.id}:`, e);
                    appointmentDate = new Date(); // תאריך ברירת מחדל
                  }
                }
              } else if (typeof appointment.date === 'string' || typeof appointment.date === 'number') {
                // Handle string or number timestamps
                try {
                  appointmentDate = new Date(appointment.date);
                } catch (e) {
                  console.error(`נכשל בהמרת מחרוזת/מספר תאריך עבור תור ${appointment.id}:`, e);
                  appointmentDate = new Date(); // תאריך ברירת מחדל
                }
              } else {
                console.error(`תור ${appointment.id} מכיל סוג תאריך לא נתמך:`, typeof appointment.date);
                appointmentDate = new Date(); // תאריך ברירת מחדל
              }
              
              // Validate that the date is valid before adding it
              if (!isNaN(appointmentDate.getTime())) {
                // Create a copy of the appointment with the validated date
                const validStatus = ['pending', 'approved', 'rejected', 'cancelled'].includes(appointment.status) 
                  ? appointment.status as AppointmentStatus 
                  : 'pending' as AppointmentStatus;
                
                typedAppointments.push({
                  ...appointment,
                  status: validStatus,
                  date: appointmentDate,
                });
                console.log(`תור ${appointment.id} נוסף בהצלחה עם תאריך:`, appointmentDate, 'וסטטוס:', validStatus);
              } else {
                console.error(`נמצא תאריך לא תקין בתור: ${appointment.id}`, 
                  'ערך גולמי:', JSON.stringify(appointment.date),
                  'ערך מומר:', appointmentDate);
                // במקום לדלג על התור, נוסיף אותו עם תאריך ברירת מחדל
                typedAppointments.push({
                  ...appointment,
                  status: 'pending' as AppointmentStatus,
                  date: new Date(), // תאריך ברירת מחדל - היום
                });
                console.log(`תור ${appointment.id} נוסף עם תאריך ברירת מחדל לאחר שגיאה`);
              }
            } catch (error) {
              console.error(`שגיאה בעיבוד תור ${appointment.id}:`, error, 
                'נתוני התור:', JSON.stringify(appointment, (key, value) => 
                  key === 'date' ? String(value) : value
                ));
              // במקום לדלג על התור, נוסיף אותו עם תאריך ברירת מחדל
              typedAppointments.push({
                ...appointment,
                status: 'pending' as AppointmentStatus,
                date: new Date(), // תאריך ברירת מחדל - היום
              });
              console.log(`תור ${appointment.id} נוסף עם תאריך ברירת מחדל לאחר שגיאה`);
            }
          });
          
          console.log(`מוסיף ${typedAppointments.length} תורים למצב האפליקציה`);
          console.log('פירוט התורים:', typedAppointments.map(a => ({ id: a.id, status: a.status, date: a.date })));
          setAppointments(typedAppointments);

          // אם יש תורים חדשים, עבור לטאב של תורים חדשים
          const pendingAppointments = typedAppointments.filter(a => a.status === 'pending');
          console.log(`נמצאו ${pendingAppointments.length} תורים בסטטוס 'pending'`, pendingAppointments.map(a => a.id));
          if (pendingAppointments.length > 0 && tabValue !== 0) {
            console.log(`נמצאו ${pendingAppointments.length} תורים חדשים, עובר לטאב תורים חדשים`);
            setTabValue(0);
          }
        } else {
          // If no appointments in Firebase, show empty state instead of mock data
          console.log('לא נמצאו תורים בשרת');
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        // Show error state instead of mock data
        console.error('שגיאה בטעינת התורים:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, [refreshTrigger]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(`החלפת טאב מ-${tabValue} ל-${newValue}`);
    setTabValue(newValue);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'approved');
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === id ? { ...appointment, status: 'approved' as AppointmentStatus } : appointment
      );
      
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateAppointmentStatus(id, 'rejected');
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === id ? { ...appointment, status: 'rejected' as AppointmentStatus } : appointment
      );
      
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
        
        // Update local state
        const updatedAppointments = appointments.filter(
          appointment => appointment.id !== appointmentToDelete
        );
        
        setAppointments(updatedAppointments);
        setDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // פונקציה לניקוי הקאש ורענון הנתונים
  const handleClearCache = () => {
    console.log('מנקה קאש ומרענן נתונים...');
    // ניקוי מצב האפליקציה
    setAppointments([]);
    // רענון הנתונים
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter appointments based on tab and search term
  const filteredAppointments = useMemo(() => {
    console.log('מסנן תורים. טאב:', tabValue, 'חיפוש:', searchTerm, 'מספר תורים:', appointments.length);
    console.log('כל התורים לפני סינון:', appointments.map(a => ({ id: a.id, status: a.status, name: a.name })));
    
    const result = appointments.filter(appointment => {
      // First filter by tab
      let matchesTab = true;
      if (tabValue === 0) matchesTab = appointment.status === 'pending';
      else if (tabValue === 1) matchesTab = appointment.status === 'approved';
      else if (tabValue === 2) matchesTab = true; // All appointments
      
      // Then filter by search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        appointment.name.toLowerCase().includes(searchLower) ||
        appointment.phone.includes(searchTerm) ||
        (appointment.email && appointment.email.toLowerCase().includes(searchLower)) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(searchLower));
      
      const matches = matchesTab && matchesSearch;
      
      // Log detailed info for all appointments
      console.log(`בדיקת תור ${appointment.id}:`, 
        'שם:', appointment.name,
        'סטטוס:', appointment.status, 
        'תואם טאב:', matchesTab, 
        'תואם חיפוש:', matchesSearch,
        'תואם סה"כ:', matches);
      
      return matches;
    });
    
    console.log('תוצאות סינון:', result.length, 'תורים', result.map(a => ({ id: a.id, status: a.status, name: a.name })));
    return result;
  }, [appointments, tabValue, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      approved: appointments.filter(a => a.status === 'approved').length,
      today: appointments.filter(a => {
        try {
          const appointmentDate = new Date(a.date);
          return a.status === 'approved' && isToday(appointmentDate);
        } catch (error) {
          console.error('Error processing date for today stats:', error);
          return false;
        }
      }).length,
      upcoming: appointments.filter(a => {
        try {
          const appointmentDate = new Date(a.date);
          return a.status === 'approved' && isAfter(appointmentDate, today);
        } catch (error) {
          console.error('Error processing date for upcoming stats:', error);
          return false;
        }
      }).length,
      tomorrow: appointments.filter(a => {
        try {
          const appointmentDate = new Date(a.date);
          return a.status === 'approved' && 
            isAfter(appointmentDate, endOfDay(today)) && 
            isBefore(appointmentDate, endOfDay(tomorrow));
        } catch (error) {
          console.error('Error processing date for tomorrow stats:', error);
          return false;
        }
      }).length
    };
  }, [appointments]);

  // Get today's appointments
  const todaysAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter(a => {
        try {
          const appointmentDate = new Date(a.date);
          return a.status === 'approved' && isToday(appointmentDate);
        } catch (error) {
          console.error('Error processing date for today\'s appointments:', error);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (error) {
          console.error('Error sorting appointments:', error);
          return 0;
        }
      });
  }, [appointments]);

  // פונקציה לבדיקת החיבור ל-Firebase
  const handleTestFirebaseConnection = async () => {
    try {
      console.log('בודק חיבור ל-Firebase...');
      
      // בדיקה פשוטה - ניסיון לקרוא את כל התורים ישירות מ-Firebase
      const q = query(
        collection(db, 'appointments'),
        orderBy('date', 'asc')
      );
      
      console.log('שולח שאילתה ישירה ל-Firebase...');
      const querySnapshot = await getDocs(q);
      console.log(`התקבלו ${querySnapshot.docs.length} תורים ישירות מ-Firebase`);
      
      // הצגת התורים בקונסול
      const directAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('תורים ישירות מ-Firebase:', directAppointments);
      alert(`החיבור ל-Firebase תקין! התקבלו ${querySnapshot.docs.length} תורים.`);
    } catch (error: any) {
      console.error('שגיאה בבדיקת החיבור ל-Firebase:', error);
      alert(`שגיאה בבדיקת החיבור ל-Firebase: ${error.message}`);
    }
  };

  // פונקציה להוספת תור חדש לדוגמה
  const handleAddSampleAppointment = async () => {
    try {
      console.log('מוסיף תור חדש לדוגמה...');
      
      // יצירת תור חדש לדוגמה
      const sampleAppointment = {
        name: 'לקוח לדוגמה',
        phone: '0501234567',
        email: 'example@example.com',
        service: 'haircut',
        people: 1,
        withChildren: false,
        childrenCount: 0,
        notificationMethod: 'whatsapp',
        date: new Date(),
        time: '12:00',
        notes: 'תור לדוגמה שנוצר מדף הניהול'
      };
      
      // שמירת התור ב-Firebase
      const newAppointment = await createAppointment(sampleAppointment);
      console.log('תור חדש נוצר בהצלחה:', newAppointment);
      
      // רענון הנתונים
      handleRefresh();
      
      alert(`תור חדש נוצר בהצלחה עם ID: ${newAppointment.id}`);
    } catch (error: any) {
      console.error('שגיאה ביצירת תור חדש:', error);
      alert(`שגיאה ביצירת תור חדש: ${error.message}`);
    }
  };

  // פונקציה לבדיקת התור הספציפי שלא מוצג
  const handleCheckSpecificAppointment = async () => {
    try {
      const specificId = "1741860578077";
      console.log(`בודק תור ספציפי עם ID: ${specificId}...`);
      
      // קבלת התור מ-Firebase
      try {
        // ננסה קודם בדרך הרגילה
        try {
          const appointment = await getAppointmentById(specificId);
          console.log('פרטי התור הספציפי (נמצא בקולקציה הרגילה):', appointment);
          
          // הצגת פרטי התור
          alert(`
            פרטי התור הספציפי (נמצא בקולקציה הרגילה):
            ID: ${appointment.id}
            שם: ${appointment.name}
            טלפון: ${appointment.phone}
            סטטוס: ${appointment.status}
            תאריך: ${appointment.date instanceof Date ? appointment.date.toString() : JSON.stringify(appointment.date)}
          `);
        } catch (regularError) {
          console.log('התור לא נמצא בקולקציה הרגילה, מחפש בכל הקולקציות...');
          
          // אם לא נמצא בדרך הרגילה, ננסה לחפש בכל הקולקציות
          const appointment = await findAppointmentInAllCollections(specificId);
          console.log('פרטי התור הספציפי (נמצא בקולקציה אחרת):', appointment);
          
          // הצגת פרטי התור
          alert(`
            פרטי התור הספציפי (נמצא בקולקציה: ${appointment._collection}):
            ID: ${appointment.id}
            שם: ${(appointment as any).name || 'לא זמין'}
            טלפון: ${(appointment as any).phone || 'לא זמין'}
            סטטוס: ${(appointment as any).status || 'לא זמין'}
            תאריך: ${(appointment as any).date ? ((appointment as any).date instanceof Date ? (appointment as any).date.toString() : JSON.stringify((appointment as any).date)) : 'לא זמין'}
            קולקציה: ${appointment._collection}
          `);
          
          // שאל אם לתקן את התור
          const shouldFix = confirm('האם ברצונך להעתיק את התור לקולקציה הנכונה?');
          if (shouldFix) {
            // יצירת עותק של התור בקולקציה הנכונה
            const appointmentData = { ...(appointment as any) };
            delete (appointmentData as any)._collection; // הסרת שדה פנימי
            delete (appointmentData as any).id; // הסרת שדה ID כי הוא יהיה בנתיב
            
            // וידוא שיש לתור את כל השדות הנדרשים
            if (!(appointmentData as any).status) (appointmentData as any).status = 'pending';
            if (!(appointmentData as any).date) (appointmentData as any).date = new Date();
            if (!(appointmentData as any).createdAt) (appointmentData as any).createdAt = Timestamp.now();
            if (!(appointmentData as any).updatedAt) (appointmentData as any).updatedAt = Timestamp.now();
            
            // שמירת התור בקולקציה הנכונה
            console.log('שומר את התור בקולקציה appointments:', appointmentData);
            await setDoc(doc(db, 'appointments', specificId), appointmentData);
            
            // מחיקת התור מהקולקציה המקורית (אופציונלי)
            if (appointment._collection !== 'appointments') {
              const shouldDelete = confirm(`האם למחוק את התור המקורי מהקולקציה ${appointment._collection}?`);
              if (shouldDelete) {
                console.log(`מוחק את התור המקורי מהקולקציה ${appointment._collection}...`);
                await firestoreDeleteDoc(doc(db, appointment._collection, specificId));
                console.log('התור המקורי נמחק בהצלחה');
              }
            }
            
            // רענון הנתונים
            handleRefresh();
            
            alert(`התור הועתק בהצלחה לקולקציה appointments. רענן את הדף כדי לראות את השינויים.`);
          }
        }
      } catch (error: any) {
        console.error('שגיאה בבדיקת התור:', error);
        alert(`שגיאה בבדיקת התור: ${error.message}`);
      }
    } catch (error: any) {
      console.error('שגיאה בבדיקת התור הספציפי:', error);
      alert(`שגיאה בבדיקת התור הספציפי: ${error.message}`);
    }
  };

  // פונקציה לבדיקת סטטוס של תור ספציפי
  const handleCheckAppointment = async () => {
    try {
      // בקשת ID מהמשתמש
      const appointmentId = prompt('הכנס ID של תור לבדיקה:');
      if (!appointmentId) return;
      
      console.log(`בודק תור עם ID: ${appointmentId}...`);
      
      // קבלת התור מ-Firebase
      try {
        // ננסה קודם בדרך הרגילה
        try {
          const appointment = await getAppointmentById(appointmentId);
          console.log('פרטי התור (נמצא בקולקציה הרגילה):', appointment);
          
          // הצגת פרטי התור
          alert(`
            פרטי התור (נמצא בקולקציה הרגילה):
            ID: ${appointment.id}
            שם: ${appointment.name}
            טלפון: ${appointment.phone}
            סטטוס: ${appointment.status}
            תאריך: ${appointment.date instanceof Date ? appointment.date.toString() : JSON.stringify(appointment.date)}
          `);
        } catch (regularError) {
          console.log('התור לא נמצא בקולקציה הרגילה, מחפש בכל הקולקציות...');
          
          // אם לא נמצא בדרך הרגילה, ננסה לחפש בכל הקולקציות
          const appointment = await findAppointmentInAllCollections(appointmentId);
          console.log('פרטי התור (נמצא בקולקציה אחרת):', appointment);
          
          // הצגת פרטי התור
          alert(`
            פרטי התור (נמצא בקולקציה: ${appointment._collection}):
            ID: ${appointment.id}
            שם: ${(appointment as any).name || 'לא זמין'}
            טלפון: ${(appointment as any).phone || 'לא זמין'}
            סטטוס: ${(appointment as any).status || 'לא זמין'}
            תאריך: ${(appointment as any).date ? ((appointment as any).date instanceof Date ? (appointment as any).date.toString() : JSON.stringify((appointment as any).date)) : 'לא זמין'}
            קולקציה: ${appointment._collection}
          `);
          
          // שאל אם לתקן את התור
          const shouldFix = confirm('האם ברצונך להעתיק את התור לקולקציה הנכונה?');
          if (shouldFix) {
            // יצירת עותק של התור בקולקציה הנכונה
            const appointmentData = { ...(appointment as any) };
            delete (appointmentData as any)._collection; // הסרת שדה פנימי
            delete (appointmentData as any).id; // הסרת שדה ID כי הוא יהיה בנתיב
            
            // וידוא שיש לתור את כל השדות הנדרשים
            if (!(appointmentData as any).status) (appointmentData as any).status = 'pending';
            if (!(appointmentData as any).date) (appointmentData as any).date = new Date();
            if (!(appointmentData as any).createdAt) (appointmentData as any).createdAt = Timestamp.now();
            if (!(appointmentData as any).updatedAt) (appointmentData as any).updatedAt = Timestamp.now();
            
            // שמירת התור בקולקציה הנכונה
            console.log('שומר את התור בקולקציה appointments:', appointmentData);
            await setDoc(doc(db, 'appointments', appointmentId), appointmentData);
            
            // מחיקת התור מהקולקציה המקורית (אופציונלי)
            if (appointment._collection !== 'appointments') {
              const shouldDelete = confirm(`האם למחוק את התור המקורי מהקולקציה ${appointment._collection}?`);
              if (shouldDelete) {
                console.log(`מוחק את התור המקורי מהקולקציה ${appointment._collection}...`);
                await firestoreDeleteDoc(doc(db, appointment._collection, appointmentId));
                console.log('התור המקורי נמחק בהצלחה');
              }
            }
            
            // רענון הנתונים
            handleRefresh();
            
            alert(`התור הועתק בהצלחה לקולקציה appointments. רענן את הדף כדי לראות את השינויים.`);
          }
        }
      } catch (error: any) {
        console.error('שגיאה בבדיקת התור:', error);
        alert(`שגיאה בבדיקת התור: ${error.message}`);
      }
    } catch (error: any) {
      console.error('שגיאה בבדיקת התור:', error);
      alert(`שגיאה בבדיקת התור: ${error.message}`);
    }
  };

  // פונקציה לבדיקת כל התורים בסטטוס 'pending'
  const handleCheckPendingAppointments = async () => {
    try {
      console.log('בודק תורים בסטטוס pending...');
      
      // קבלת התורים מ-Firebase
      const pendingAppointments = await getAppointmentsByStatus('pending');
      console.log(`נמצאו ${pendingAppointments.length} תורים בסטטוס pending:`, pendingAppointments);
      
      // הצגת מספר התורים
      alert(`נמצאו ${pendingAppointments.length} תורים בסטטוס pending. פרטים מלאים בקונסול.`);
    } catch (error: any) {
      console.error('שגיאה בבדיקת תורים בסטטוס pending:', error);
      alert(`שגיאה בבדיקת תורים בסטטוס pending: ${error.message}`);
    }
  };

  // פונקציה לבדיקת קולקציות אחרות ב-Firebase
  const handleCheckOtherCollections = async () => {
    try {
      console.log('בודק קולקציות אחרות ב-Firebase...');
      
      // רשימת קולקציות אפשריות
      const possibleCollections = ['appointments', 'bookings', 'orders', 'reservations'];
      
      for (const collectionName of possibleCollections) {
        try {
          console.log(`בודק קולקציה: ${collectionName}...`);
          
          const q = query(
            collection(db, collectionName)
          );
          
          const querySnapshot = await getDocs(q);
          console.log(`נמצאו ${querySnapshot.docs.length} מסמכים בקולקציה ${collectionName}`);
          
          // חיפוש תור עם השם והטלפון
          const matchingDocs: any[] = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (
              (data.name && data.name.includes('נתנאל')) || 
              (data.phone && data.phone.includes('0549105131'))
            ) {
              matchingDocs.push({
                id: doc.id,
                ...data
              });
            }
          });
          
          if (matchingDocs.length > 0) {
            console.log(`נמצאו ${matchingDocs.length} מסמכים תואמים בקולקציה ${collectionName}:`, matchingDocs);
          }
        } catch (error) {
          console.error(`שגיאה בבדיקת קולקציה ${collectionName}:`, error);
        }
      }
      
      alert('בדיקת הקולקציות הסתיימה. פרטים בקונסול.');
    } catch (error: any) {
      console.error('שגיאה בבדיקת קולקציות:', error);
      alert(`שגיאה בבדיקת קולקציות: ${error.message}`);
    }
  };

  // פונקציה להוספת התור הספציפי ישירות ל-Firebase
  const handleAddSpecificAppointment = async () => {
    try {
      console.log('מוסיף את התור הספציפי ישירות ל-Firebase...');
      
      // יצירת התור הספציפי
      const specificAppointment = {
        name: "נתנאל מלכה",
        phone: "0549105131",
        email: "netamal3134@gmail.com",
        service: "haircut",
        people: 1,
        withChildren: false,
        childrenCount: 0,
        notificationMethod: "whatsapp",
        date: new Date(2025, 2, 14, 14, 0), // 14 במרץ 2025, 14:00
        time: "14:00",
        notes: ""
      };
      
      // שמירת התור ב-Firebase
      const newAppointment = await createAppointment(specificAppointment);
      console.log('התור הספציפי נוצר בהצלחה:', newAppointment);
      
      // רענון הנתונים
      handleRefresh();
      
      alert(`התור הספציפי נוצר בהצלחה עם ID: ${newAppointment.id}`);
    } catch (error: any) {
      console.error('שגיאה ביצירת התור הספציפי:', error);
      alert(`שגיאה ביצירת התור הספציפי: ${error.message}`);
    }
  };

  // פונקציה לבדיקת בעיות בשדה ה-ID
  const handleCheckIdIssues = async () => {
    try {
      console.log('בודק בעיות בשדה ה-ID...');
      
      // בדיקת התור הספציפי עם ID מספרי
      const numericId = 1741860578077;
      console.log(`בודק תור עם ID מספרי: ${numericId}...`);
      
      try {
        // ניסיון לקבל את התור עם ID מספרי
        const docRef = doc(db, 'appointments', numericId.toString());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('נמצא תור עם ID מספרי:', { id: docSnap.id, ...data });
          alert(`נמצא תור עם ID מספרי: ${docSnap.id}. פרטים בקונסול.`);
        } else {
          console.log('לא נמצא תור עם ID מספרי');
        }
      } catch (error) {
        console.error('שגיאה בבדיקת תור עם ID מספרי:', error);
      }
      
      // בדיקת כל התורים ב-Firebase
      console.log('בודק את כל התורים ב-Firebase לבעיות ID...');
      const q = query(collection(db, 'appointments'));
      const querySnapshot = await getDocs(q);
      
      // בדיקת סוגי ID
      const idTypes = new Map();
      querySnapshot.forEach(doc => {
        const idType = typeof doc.id;
        idTypes.set(idType, (idTypes.get(idType) || 0) + 1);
        
        // בדיקה אם ה-ID הוא מספר או מחרוזת שמכילה רק ספרות
        if (/^\d+$/.test(doc.id)) {
          console.log(`נמצא תור עם ID מספרי: ${doc.id}`, doc.data());
        }
      });
      
      console.log('סוגי ID שנמצאו:', Object.fromEntries(idTypes));
      alert('בדיקת בעיות ID הסתיימה. פרטים בקונסול.');
    } catch (error: any) {
      console.error('שגיאה בבדיקת בעיות ID:', error);
      alert(`שגיאה בבדיקת בעיות ID: ${error.message}`);
    }
  };

  // פונקציה להעתקת תור מקולקציה אחת לאחרת
  const handleFixAppointmentCollection = async () => {
    try {
      const specificId = "1741860578077";
      console.log(`מתקן את התור עם ID: ${specificId}...`);
      
      // חיפוש התור בכל הקולקציות
      try {
        const appointment = await findAppointmentInAllCollections(specificId);
        console.log(`נמצא תור בקולקציה ${appointment._collection}:`, appointment);
        
        // יצירת עותק של התור בקולקציה הנכונה
        const appointmentData = { ...(appointment as any) };
        delete (appointmentData as any)._collection; // הסרת שדה פנימי
        delete (appointmentData as any).id; // הסרת שדה ID כי הוא יהיה בנתיב
        
        // וידוא שיש לתור את כל השדות הנדרשים
        if (!(appointmentData as any).status) (appointmentData as any).status = 'pending';
        if (!(appointmentData as any).date) (appointmentData as any).date = new Date();
        if (!(appointmentData as any).createdAt) (appointmentData as any).createdAt = Timestamp.now();
        if (!(appointmentData as any).updatedAt) (appointmentData as any).updatedAt = Timestamp.now();
        
        // שמירת התור בקולקציה הנכונה
        console.log('שומר את התור בקולקציה appointments:', appointmentData);
        await setDoc(doc(db, 'appointments', specificId), appointmentData);
        
        // מחיקת התור מהקולקציה המקורית (אופציונלי)
        if (appointment._collection !== 'appointments') {
          const shouldDelete = confirm(`האם למחוק את התור המקורי מהקולקציה ${appointment._collection}?`);
          if (shouldDelete) {
            console.log(`מוחק את התור המקורי מהקולקציה ${appointment._collection}...`);
            await firestoreDeleteDoc(doc(db, appointment._collection, specificId));
            console.log('התור המקורי נמחק בהצלחה');
          }
        }
        
        // רענון הנתונים
        handleRefresh();
        
        alert(`התור הועתק בהצלחה לקולקציה appointments. רענן את הדף כדי לראות את השינויים.`);
      } catch (error) {
        console.error('שגיאה בחיפוש התור:', error);
        alert(`לא נמצא תור עם ID: ${specificId} בכל הקולקציות`);
      }
    } catch (error: any) {
      console.error('שגיאה בתיקון התור:', error);
      alert(`שגיאה בתיקון התור: ${error.message}`);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not admin, don't render anything (redirect happens in useEffect)
  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          אין לך הרשאות לצפות בדף זה. מועבר לדף ההתחברות...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          לוח בקרה
        </Typography>
        <Box>
          <Tooltip title="נקה קאש ורענן">
            <IconButton onClick={handleClearCache} color="secondary" sx={{ mr: 1 }}>
              <ClearAll />
            </IconButton>
          </Tooltip>
          <Tooltip title="רענן נתונים">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ mr: 1 }} /> סקירה כללית
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
                    <Typography variant="body2">סה"כ תורים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.pending}</Typography>
                    <Typography variant="body2">ממתינים לאישור</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.approved}</Typography>
                    <Typography variant="body2">תורים מאושרים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.today}</Typography>
                    <Typography variant="body2">תורים היום</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.tomorrow}</Typography>
                    <Typography variant="body2">תורים מחר</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{stats.upcoming}</Typography>
                    <Typography variant="body2">תורים עתידיים</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <EventAvailable sx={{ mr: 1 }} /> תורים להיום
            </Typography>
            {todaysAppointments.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                אין תורים להיום
              </Typography>
            ) : (
              <List>
                {todaysAppointments.map((appointment) => (
                  <ListItem key={appointment.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1" fontWeight="bold">{appointment.name}</Typography>
                          <Typography variant="body2">{appointment.time}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {servicesMap[appointment.service] || 'שירות לא ידוע'} | {appointment.phone}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Appointments List */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ mb: 0 }}
          >
            <Tab label="תורים חדשים" />
            <Tab label="תורים מאושרים" />
            <Tab label="כל התורים" />
          </Tabs>
          
          <TextField
            placeholder="חיפוש לפי שם, טלפון או הערות"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    aria-label="נקה חיפוש"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ width: { xs: '100%', sm: '300px' }, mt: { xs: 2, sm: 0 } }}
          />
        </Box>
        
        <Grid container spacing={3}>
          {filteredAppointments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                {searchTerm ? (
                  <>
                    לא נמצאו תורים התואמים לחיפוש "<strong>{searchTerm}</strong>"
                    <Box mt={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<Close />} 
                        onClick={() => setSearchTerm('')}
                      >
                        נקה חיפוש
                      </Button>
                    </Box>
                  </>
                ) : (
                  'אין תורים להצגה'
                )}
              </Typography>
            </Grid>
          ) : (
            filteredAppointments.map((appointment) => (
              <Grid item xs={12} md={6} key={appointment.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRight: 4, 
                    borderColor: `${statusColors[appointment.status]}.main`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {appointment.name}
                      </Typography>
                      <Chip 
                        label={statusLabels[appointment.status]} 
                        color={statusColors[appointment.status] as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonth fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {(() => {
                          try {
                            // Make sure we have a valid date object
                            const dateValue = appointment.date;
                            if (!dateValue) {
                              return 'תאריך לא זמין';
                            }
                            
                            let dateObj;
                            if (dateValue instanceof Date) {
                              dateObj = dateValue;
                            } else {
                              // Try to convert to Date if it's not already a Date object
                              dateObj = new Date(dateValue);
                            }
                            
                            // Check if the date is valid
                            if (isNaN(dateObj.getTime())) {
                              return 'תאריך לא תקין';
                            }
                            
                            return format(dateObj, 'EEEE, d בMMMM yyyy', { locale: he });
                          } catch (error) {
                            console.error('Error formatting date:', error);
                            return 'תאריך לא תקין';
                          }
                        })()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {(() => {
                          try {
                            // First check if we have a time string
                            if (appointment.time) {
                              return appointment.time;
                            }
                            
                            // If no time string, try to format from date
                            const dateValue = appointment.date;
                            if (!dateValue) {
                              return 'שעה לא זמינה';
                            }
                            
                            let dateObj;
                            if (dateValue instanceof Date) {
                              dateObj = dateValue;
                            } else {
                              // Try to convert to Date if it's not already a Date object
                              dateObj = new Date(dateValue);
                            }
                            
                            // Check if the date is valid
                            if (isNaN(dateObj.getTime())) {
                              return 'שעה לא תקינה';
                            }
                            
                            return format(dateObj, 'HH:mm');
                          } catch (error) {
                            console.error('Error formatting time:', error);
                            return 'שעה לא תקינה';
                          }
                        })()}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        שירות:
                      </Typography>
                      <Typography variant="body2">
                        {servicesMap[appointment.service] || 'שירות לא ידוע'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        מספר אנשים:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.people}
                      </Typography>
                    </Box>
                    
                    {appointment.withChildren && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          <ChildCare fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          מספר ילדים:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.childrenCount}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        טלפון:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.phone}
                      </Typography>
                    </Box>
                    
                    {appointment.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          אימייל:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.email}
                        </Typography>
                      </Box>
                    )}
                    
                    {appointment.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          הערות:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(appointment.id!)}
                    >
                      מחק
                    </Button>
                    
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => handleReject(appointment.id!)}
                        >
                          דחה
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => handleApprove(appointment.id!)}
                          sx={{ mr: 1 }}
                        >
                          אשר
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>מחיקת תור</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התור? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 