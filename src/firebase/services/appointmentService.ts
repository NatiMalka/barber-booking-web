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
  collectionGroup
} from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'appointments';

export interface Appointment {
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
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Create a new appointment
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('createAppointment: מתחיל ליצור תור חדש עם הנתונים:', appointmentData);
    
    const appointmentWithMetadata = {
      ...appointmentData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('createAppointment: נתוני התור לאחר הוספת מטא-דאטה:', appointmentWithMetadata);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), appointmentWithMetadata);
    console.log(`createAppointment: תור נוצר בהצלחה עם ID: ${docRef.id}`);
    
    return { id: docRef.id, ...appointmentWithMetadata };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

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
    console.log('מקבל את כל התורים מכל הקולקציות...');
    
    const allAppointments: any[] = [];
    const possibleCollections = ['appointments', 'bookings', 'orders', 'reservations', 'appointment'];
    
    for (const collectionName of possibleCollections) {
      try {
        console.log(`בודק בקולקציה: ${collectionName}...`);
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.docs.length > 0) {
          console.log(`נמצאו ${querySnapshot.docs.length} תורים בקולקציה ${collectionName}`);
          
          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            allAppointments.push({
              id: doc.id,
              ...data,
              _collection: collectionName
            });
          });
        }
      } catch (error) {
        console.error(`שגיאה בבדיקת קולקציה ${collectionName}:`, error);
      }
    }
    
    console.log(`סה"כ נמצאו ${allAppointments.length} תורים בכל הקולקציות`);
    return allAppointments;
  } catch (error) {
    console.error('Error getting all appointments from all collections:', error);
    throw error;
  }
}; 