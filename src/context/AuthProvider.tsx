import React, { useEffect, useState } from 'react';
import { AuthContext, type AuthContextType } from './AuthContext';
import { signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut, onAuthStateChange } from '../services/googleServices';
import type { User } from 'firebase/auth';

/**
 * AuthProvider
 *
 * Provides authentication state and methods to all child components.
 * Listens for auth state changes and updates context accordingly.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignOut();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
