import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Appointment } from '../types/appointment';
import { sendEmail } from './emailService';

export const createAppointment = async (appointment: Appointment) => {
  try {
    // Check if the time slot is available
    const existingAppointments = await getDocs(
      query(
        collection(db, 'appointments'),
        where('date', '==', appointment.date),
        where('time', '==', appointment.time)
      )
    );

    if (!existingAppointments.empty) {
      throw new Error('התור הזה כבר תפוס, אנא בחר זמן אחר');
    }

    // Add the appointment to Firestore
    const docRef = await addDoc(collection(db, 'appointments'), appointment);
    
    // Send confirmation email
    await sendEmail({
      to: appointment.email,
      subject: 'אישור תור - ברבר שופ',
      text: `היי ${appointment.name},\n\nתודה שקבעת תור!\n\nפרטי התור שלך:\nתאריך: ${appointment.date}\nשעה: ${appointment.time}\n\nמצפים לראותך!\nברבר שופ`
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointment = async (id: string) => {
  try {
    const docRef = doc(db, 'appointments', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    } else {
      throw new Error('התור לא נמצא');
    }
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (id: string) => {
  try {
    const appointment = await getAppointment(id);
    await deleteDoc(doc(db, 'appointments', id));
    
    // Send cancellation email
    await sendEmail({
      to: appointment.email,
      subject: 'ביטול תור - ברבר שופ',
      text: `היי ${appointment.name},\n\nהתור שלך לתאריך ${appointment.date} בשעה ${appointment.time} בוטל בהצלחה.\n\nנשמח לראותך בפעם אחרת!\nברבר שופ`
    });

    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
}; 