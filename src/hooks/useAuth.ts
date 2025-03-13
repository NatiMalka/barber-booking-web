'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { isUserAdmin } from '@/firebase/services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false
  });

  useEffect(() => {
    // Check if user is barber admin from localStorage - moved inside the effect to ensure it runs on client
    const checkBarberAdmin = () => {
      try {
        return localStorage.getItem('isBarberAdmin') === 'true';
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return false;
      }
    };
    
    const isBarberAdmin = typeof window !== 'undefined' && checkBarberAdmin();
    
    // If barber admin is set in localStorage, immediately update state
    if (isBarberAdmin) {
      setAuthState(prev => ({
        ...prev,
        isAdmin: true,
        loading: false
      }));
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const adminStatus = isBarberAdmin || isUserAdmin(user);
      console.log('Auth state changed:', { user: user?.email, isBarberAdmin, isUserAdmin: isUserAdmin(user), adminStatus });
      
      setAuthState({
        user,
        loading: false,
        isAdmin: adminStatus
      });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return authState;
} 