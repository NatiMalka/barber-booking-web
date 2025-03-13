import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWNHL-dQZayHhVS51U1z_0u1V1uLKtzkA",
  authDomain: "barber-booking-bf41f.firebaseapp.com",
  projectId: "barber-booking-bf41f",
  storageBucket: "barber-booking-bf41f.firebasestorage.app",
  messagingSenderId: "265481537358",
  appId: "1:265481537358:web:93c5b6f36e8258dc5e401f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 