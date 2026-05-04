import React, { useEffect, useState } from 'react';
import { AuthContext, type AuthContextType, type GuestUser } from './AuthContext';
import { signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut, onAuthStateChange } from '../services/googleServices';
import type { User } from 'firebase/auth';

const GUEST_USER_KEY = 'prompt2vote.guestUser';

/**
 * Generate a guest user
 */
const createGuestUser = (): GuestUser => ({
  uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  email: null,
  displayName: 'Guest',
  photoURL: null,
});

/**
 * AuthProvider
 *
 * Provides authentication state and methods to all child components.
 * Supports both Firebase Auth (Google) and Guest mode.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | GuestUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load guest user from localStorage on mount
  useEffect(() => {
    const storedGuest = localStorage.getItem(GUEST_USER_KEY);
    if (storedGuest) {
      try {
        const guestUser = JSON.parse(storedGuest) as GuestUser;
        setUser(guestUser);
        setIsGuest(true);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to load guest user:', err);
        localStorage.removeItem(GUEST_USER_KEY);
      }
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(authUser);
        setIsGuest(false);
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Clear guest mode if switching to Google auth
      if (isGuest) {
        localStorage.removeItem(GUEST_USER_KEY);
        setIsGuest(false);
      }
      await firebaseSignInWithGoogle();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to sign in with Google';
      console.error('Sign in error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    try {
      const guestUser = createGuestUser();
      localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setIsGuest(true);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to create guest session';
      console.error('Guest sign in error:', errorMsg);
      setError(errorMsg);
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isGuest) {
        // Clear guest mode
        localStorage.removeItem(GUEST_USER_KEY);
        setUser(null);
        setIsGuest(false);
      } else {
        // Sign out from Firebase
        await firebaseSignOut();
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to sign out';
      console.error('Sign out error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isGuest,
    loading,
    error,
    signInWithGoogle,
    signInAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
