import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'appointments';

export interface Appointment {
  id?: string;
  date: Date;
  time: string;
  service: string; // Keep for backward compatibility
  services?: string[]; // New field for multiple services
  people: number;
  withChildren?: boolean;
  childrenCount?: number;
  notificationMethod: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Create a new appointment
export async function createAppointment(data: any) {
  try {
    // Create a new appointment document
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      notificationMethod: data.notificationMethod || 'sms',
    });

    return {
      success: true,
      appointmentId: appointmentRef.id
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

// Get all appointments
export const getAllAppointments = async () => {
  try {
    console.log('getAllAppointments: מתחיל לקבל את כל התורים מ-Firebase');
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'asc')
    );
    
    console.log('getAllAppointments: שולח שאילתה ל-Firebase');
    const querySnapshot = await getDocs(q);
    console.log(`getAllAppointments: התקבלו ${querySnapshot.docs.length} תורים מ-Firebase`);
    
    // מיפוי התוצאות עם לוגים מפורטים
    const appointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`getAllAppointments: תור ${doc.id}:`, data);
      return {
        id: doc.id,
        ...data
      };
    }) as Appointment[];
    
    console.log('getAllAppointments: כל התורים שהתקבלו:', appointments);
    return appointments;
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

// Get appointments by status
export const getAppointmentsByStatus = async (status: Appointment['status']) => {
  try {
    console.log(`getAppointmentsByStatus: מתחיל לקבל תורים בסטטוס ${status}`);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('date', 'asc')
    );
    
    console.log('getAppointmentsByStatus: שולח שאילתה ל-Firebase');
    const querySnapshot = await getDocs(q);
    console.log(`getAppointmentsByStatus: התקבלו ${querySnapshot.docs.length} תורים בסטטוס ${status}`);
    
    // מיפוי התוצאות עם לוגים מפורטים
    const appointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`getAppointmentsByStatus: תור ${doc.id}:`, data);
      return {
        id: doc.id,
        ...data
      };
    }) as Appointment[];
    
    console.log(`getAppointmentsByStatus: כל התורים בסטטוס ${status}:`, appointments);
    return appointments;
  } catch (error) {
    console.error(`Error getting ${status} appointments:`, error);
    throw error;
  }
};

// Get appointments by client phone
export const getAppointmentsByPhone = async (phone: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('phone', '==', phone),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments by phone:', error);
    throw error;
  }
};

// Get appointments for a specific date
export const getAppointmentsByDate = async (date: Date) => {
  try {
    console.log(`getAppointmentsByDate: מתחיל לקבל תורים לתאריך ${date.toDateString()}`);
    
    // Create start and end of the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Convert to Firestore Timestamp
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    console.log(`getAppointmentsByDate: מחפש תורים בין ${startOfDay.toISOString()} ל-${endOfDay.toISOString()}`);
    
    // Use a simpler query that doesn't require a composite index
    // Just filter by date range and then filter the results in JavaScript
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );
    
    console.log('getAppointmentsByDate: שולח שאילתה ל-Firebase');
    const querySnapshot = await getDocs(q);
    console.log(`getAppointmentsByDate: התקבלו ${querySnapshot.docs.length} תורים לתאריך ${date.toDateString()}`);
    
    // Map the results with detailed logs and filter by status in JavaScript
    const allAppointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`getAppointmentsByDate: תור ${doc.id}:`, data);
      return {
        id: doc.id,
        ...data
      } as Appointment;
    });
    
    // Filter appointments by status
    const appointments = allAppointments.filter(
      appointment => appointment.status === 'pending' || appointment.status === 'approved'
    );
    
    console.log(`getAppointmentsByDate: כל התורים לתאריך ${date.toDateString()}:`, appointments);
    return appointments;
  } catch (error) {
    console.error(`Error getting appointments for date ${date.toDateString()}:`, error);
    throw error;
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    } else {
      throw new Error('Appointment not found');
    }
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      status, 
      updatedAt: Timestamp.now() 
    });
    return { id, status };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (id: string) => {
  try {
    return await updateAppointmentStatus(id, 'cancelled');
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Delete an appointment (admin only)
export const deleteAppointment = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// פונקציה לחיפוש תור בכל הקולקציות
export const findAppointmentInAllCollections = async (appointmentId: string) => {
  try {
    console.log(`מחפש תור עם ID: ${appointmentId} בכל הקולקציות...`);
    
    // רשימת קולקציות אפשריות
    const possibleCollections = ['appointments', 'bookings', 'orders', 'reservations', 'appointment'];
    
    for (const collectionName of possibleCollections) {
      try {
        console.log(`בודק בקולקציה: ${collectionName}...`);
        const docRef = doc(db, collectionName, appointmentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(`נמצא תור בקולקציה ${collectionName}:`, { id: docSnap.id, ...data });
          return { id: docSnap.id, ...data, _collection: collectionName };
        }
      } catch (error) {
        console.error(`שגיאה בבדיקת קולקציה ${collectionName}:`, error);
      }
    }
    
    // אם לא נמצא בקולקציות הרגילות, ננסה לחפש בכל הקולקציות
    try {
      console.log('מחפש בכל הקולקציות...');
      const allCollections = await getDocs(collection(db, '_'));
      
      for (const collectionDoc of allCollections.docs) {
        const collectionName = collectionDoc.id;
        console.log(`בודק בקולקציה: ${collectionName}...`);
        
        try {
          const docRef = doc(db, collectionName, appointmentId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`נמצא תור בקולקציה ${collectionName}:`, { id: docSnap.id, ...data });
            return { id: docSnap.id, ...data, _collection: collectionName };
          }
        } catch (error) {
          console.error(`שגיאה בבדיקת קולקציה ${collectionName}:`, error);
        }
      }
    } catch (error) {
      console.error('שגיאה בקבלת רשימת הקולקציות:', error);
    }
    
    console.log(`לא נמצא תור עם ID: ${appointmentId} בכל הקולקציות`);
    throw new Error('Appointment not found in any collection');
  } catch (error) {
    console.error('Error finding appointment in all collections:', error);
    throw error;
  }
};

// פונקציה לקבלת כל התורים מכל הקולקציות
export const getAllAppointmentsFromAllCollections = async () => {
  try {
    console.log('getAllAppointmentsFromAllCollections: מתחיל לקבל את כל התורים מכל הקולקציות');
    
    // רשימת קולקציות אפשריות
    const possibleCollections = ['appointments', 'bookings', 'orders', 'reservations'];
    
    // מערך לאחסון כל התורים
    const allAppointments: Appointment[] = [];
    
    // עבור על כל קולקציה אפשרית
    for (const collectionName of possibleCollections) {
      try {
        console.log(`getAllAppointmentsFromAllCollections: בודק קולקציה: ${collectionName}`);
        
        const q = query(
          collection(db, collectionName),
          orderBy('date', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`getAllAppointmentsFromAllCollections: נמצאו ${querySnapshot.docs.length} מסמכים בקולקציה ${collectionName}`);
        
        // הוסף את התורים למערך הכולל
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          // המר את שדה התאריך ל-Date אם הוא קיים
          let date: Date;
          if (data.date) {
            if (data.date instanceof Timestamp) {
              date = data.date.toDate();
            } else if (data.date.seconds) { // אם זה אובייקט Firestore Timestamp
              date = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate();
            } else {
              date = new Date(data.date);
            }
          } else {
            date = new Date();
          }
          
          // הוסף את התור למערך
          allAppointments.push({
            id: doc.id,
            date,
            time: data.time || '',
            service: data.service || '',
            people: data.people || 1,
            notificationMethod: data.notificationMethod || 'sms',
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            notes: data.notes || '',
            status: (data.status as Appointment['status']) || 'pending',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
      } catch (error) {
        console.error(`getAllAppointmentsFromAllCollections: שגיאה בקבלת תורים מקולקציה ${collectionName}:`, error);
      }
    }
    
    console.log(`getAllAppointmentsFromAllCollections: סה"כ נמצאו ${allAppointments.length} תורים מכל הקולקציות`);
    
    // מיון התורים לפי תאריך
    allAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return allAppointments;
  } catch (error) {
    console.error('getAllAppointmentsFromAllCollections: שגיאה בקבלת כל התורים מכל הקולקציות:', error);
    throw error;
  }
}; 