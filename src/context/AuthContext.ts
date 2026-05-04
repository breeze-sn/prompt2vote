import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';

export interface GuestUser {
  uid: string;
  email: null;
  displayName: string;
  photoURL: null;
}

export interface AuthContextType {
  user: User | GuestUser | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
