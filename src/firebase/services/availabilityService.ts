import { 
  collection, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../config';
import { format } from 'date-fns';

const COLLECTION_NAME = 'availability';

export interface VacationDay {
  id?: string;
  date: Date;
  reason?: string;
  isFullDay: boolean;
  unavailableHours?: string[]; // For partial day unavailability
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Get all vacation days
export const getAllVacationDays = async () => {
  try {
    console.log('getAllVacationDays: מתחיל לקבל את כל ימי החופשה מ-Firebase');
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'asc')
    );
    
    console.log('getAllVacationDays: שולח שאילתה ל-Firebase');
    const querySnapshot = await getDocs(q);
    console.log(`getAllVacationDays: התקבלו ${querySnapshot.docs.length} ימי חופשה מ-Firebase`);
    
    // Map the results with detailed logs
    const vacationDays = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`getAllVacationDays: יום חופשה ${doc.id}:`, data);
      
      // Convert Firestore Timestamp to Date
      const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
      
      return {
        id: doc.id,
        ...data,
        date
      };
    }) as VacationDay[];
    
    console.log('getAllVacationDays: כל ימי החופשה שהתקבלו:', vacationDays);
    return vacationDays;
  } catch (error) {
    console.error('Error getting vacation days:', error);
    throw error;
  }
};

// Get future vacation days (from today onwards)
export const getFutureVacationDays = async () => {
  try {
    console.log('getFutureVacationDays: מתחיל לקבל ימי חופשה עתידיים מ-Firebase');
    
    // Create start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convert to Firestore Timestamp
    const todayTimestamp = Timestamp.fromDate(today);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', todayTimestamp),
      orderBy('date', 'asc')
    );
    
    console.log('getFutureVacationDays: שולח שאילתה ל-Firebase');
    const querySnapshot = await getDocs(q);
    console.log(`getFutureVacationDays: התקבלו ${querySnapshot.docs.length} ימי חופשה עתידיים מ-Firebase`);
    
    // Map the results with detailed logs
    const vacationDays = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`getFutureVacationDays: יום חופשה ${doc.id}:`, data);
      
      // Convert Firestore Timestamp to Date
      const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
      
      return {
        id: doc.id,
        ...data,
        date
      };
    }) as VacationDay[];
    
    console.log('getFutureVacationDays: כל ימי החופשה העתידיים שהתקבלו:', vacationDays);
    return vacationDays;
  } catch (error) {
    console.error('Error getting future vacation days:', error);
    throw error;
  }
};

// Check if a specific date is a vacation day
export const isVacationDay = async (date: Date) => {
  try {
    console.log(`isVacationDay: בודק אם התאריך ${date.toDateString()} הוא יום חופשה`);
    
    // Create start and end of the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Convert to Firestore Timestamp
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`isVacationDay: התאריך ${date.toDateString()} אינו יום חופשה`);
      return { isVacationDay: false };
    }
    
    // Get the first vacation day document
    const vacationDay = querySnapshot.docs[0].data();
    console.log(`isVacationDay: התאריך ${date.toDateString()} הוא יום חופשה:`, vacationDay);
    
    return { 
      isVacationDay: true, 
      isFullDay: vacationDay.isFullDay, 
      unavailableHours: vacationDay.unavailableHours || [] 
    };
  } catch (error) {
    console.error(`Error checking if date ${date.toDateString()} is a vacation day:`, error);
    throw error;
  }
};

// Add a new vacation day
export const addVacationDay = async (vacationData: Omit<VacationDay, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('addVacationDay: מתחיל להוסיף יום חופשה חדש עם הנתונים:', vacationData);
    
    // Format the date as YYYY-MM-DD to use as document ID
    const dateStr = format(vacationData.date, 'yyyy-MM-dd');
    
    const vacationWithMetadata = {
      ...vacationData,
      date: Timestamp.fromDate(vacationData.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('addVacationDay: נתוני יום החופשה לאחר הוספת מטא-דאטה:', vacationWithMetadata);
    
    // Use the date string as the document ID for easy retrieval and to prevent duplicates
    const docRef = doc(db, COLLECTION_NAME, dateStr);
    await setDoc(docRef, vacationWithMetadata);
    
    console.log(`addVacationDay: יום חופשה נוצר בהצלחה עם ID: ${dateStr}`);
    
    return { id: dateStr, ...vacationWithMetadata };
  } catch (error) {
    console.error('Error adding vacation day:', error);
    throw error;
  }
};

// Update a vacation day
export const updateVacationDay = async (id: string, vacationData: Partial<Omit<VacationDay, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    console.log(`updateVacationDay: מתחיל לעדכן יום חופשה עם ID: ${id}`);
    console.log('updateVacationDay: נתוני העדכון:', vacationData);
    
    // Prepare the update data
    const updateData: Record<string, string | boolean | Date | Timestamp | string[]> = {
      ...vacationData,
      updatedAt: Timestamp.now()
    };
    
    // If date is provided, ensure it's a Firestore Timestamp
    if (vacationData.date) {
      updateData.date = Timestamp.fromDate(vacationData.date);
    }
    
    console.log('updateVacationDay: נתוני העדכון המוכנים:', updateData);
    
    // Update the document
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);
    
    console.log(`updateVacationDay: יום חופשה עם ID: ${id} עודכן בהצלחה`);
    
    return id;
  } catch (error) {
    console.error('updateVacationDay: שגיאה בעדכון יום חופשה:', error);
    throw error;
  }
};

// Delete a vacation day
export const deleteVacationDay = async (id: string) => {
  try {
    console.log(`deleteVacationDay: מתחיל למחוק יום חופשה עם ID: ${id}`);
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    
    console.log(`deleteVacationDay: יום חופשה נמחק בהצלחה עם ID: ${id}`);
    
    return { id };
  } catch (error) {
    console.error(`Error deleting vacation day with ID: ${id}:`, error);
    throw error;
  }
}; 