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
  getDoc
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
    const appointmentWithMetadata = {
      ...appointmentData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), appointmentWithMetadata);
    return { id: docRef.id, ...appointmentWithMetadata };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get all appointments
export const getAllAppointments = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

// Get appointments by status
export const getAppointmentsByStatus = async (status: Appointment['status']) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
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