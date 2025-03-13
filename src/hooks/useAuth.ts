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
    // Check if user is barber admin from localStorage
    const isBarberAdmin = typeof window !== 'undefined' && localStorage.getItem('isBarberAdmin') === 'true';
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        isAdmin: isBarberAdmin || isUserAdmin(user)
      });
    });

    // If there's no auth state change but we have barber admin in localStorage
    if (isBarberAdmin) {
      setAuthState(prev => ({
        ...prev,
        isAdmin: true,
        loading: false
      }));
    }

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return authState;
} 