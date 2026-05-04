import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent, type Analytics } from 'firebase/analytics';
import { addDoc, collection, getFirestore, serverTimestamp, type Firestore, setDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, type Auth, type User } from 'firebase/auth';
import { QUICK_START_ITEMS } from '../constants/quickStart';
import { sanitizeUserInput } from '../utils/security';

type ServiceStatus = {
  app: boolean;
  analytics: boolean;
  firestore: boolean;
};

type ChatEvent = {
  source: 'preset' | 'manual' | 'system';
  category: 'greeting' | 'thanks' | 'preset' | 'election' | 'out_of_scope' | 'empty' | 'other';
  persona: string | null;
  step: number;
  promptLength: number;
  hadModelResponse: boolean;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let firebaseApp: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

const getFirebaseApp = (): FirebaseApp | null => {
  if (!hasFirebaseConfig) return null;
  if (firebaseApp) return firebaseApp;

  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
};

const getAnalyticsInstance = async (): Promise<Analytics | null> => {
  const app = getFirebaseApp();
  if (!app || !firebaseConfig.measurementId) return null;

  if (analyticsInstance) return analyticsInstance;
  if (!analyticsInitPromise) {
    analyticsInitPromise = isAnalyticsSupported()
      .then((supported) => {
        if (!supported) return null;
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      })
      .catch(() => null);
  }

  return analyticsInitPromise;
};

const getFirestoreInstance = (): Firestore | null => {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }

  return firestoreInstance;
};

const getAuthInstance = (): Auth | null => {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!authInstance) {
    authInstance = getAuth(app);
  }

  return authInstance;
};

export const initializeGoogleServices = async (): Promise<ServiceStatus> => {
  const app = getFirebaseApp();
  const analytics = await getAnalyticsInstance();
  const firestore = getFirestoreInstance();

  return {
    app: Boolean(app),
    analytics: Boolean(analytics),
    firestore: Boolean(firestore),
  };
};

export const getGoogleServicesLabel = (): string => {
  const status = {
    app: hasFirebaseConfig,
    analytics: Boolean(firebaseConfig.measurementId),
    firestore: Boolean(firebaseConfig.projectId),
  };

  const parts = ['Gemini'];
  if (status.analytics) parts.push('Analytics');
  if (status.firestore) parts.push('Firestore');
  if (status.app && !status.analytics && !status.firestore) parts.push('Firebase');
  return parts.join(' · ');
};

export const classifyQuestion = (prompt: string): ChatEvent['category'] => {
  const safePrompt = sanitizeUserInput(prompt).toLowerCase();
  if (!safePrompt) return 'empty';
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/.test(safePrompt)) return 'greeting';
  if (/\b(thanks|thank you|thx|cheers)\b/.test(safePrompt)) return 'thanks';
  if (QUICK_START_ITEMS.some(item => item.keywords.some(k => safePrompt.includes(k)) || safePrompt === item.question.trim().toLowerCase())) {
    return 'preset';
  }

  const electionKeywords = ['vote', 'voter', 'voting', 'registration', 'nvsp', 'voter id', 'epic', 'election', 'poll', 'nota', 'form 6', 'form6'];
  if (electionKeywords.some(k => safePrompt.includes(k))) return 'election';
  return 'out_of_scope';
};

export const recordChatEvent = async (event: ChatEvent): Promise<void> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return;

  try {
    await addDoc(collection(firestore, 'chat_events'), {
      ...event,
      createdAt: serverTimestamp(),
    });
  } catch {
    // keep the chat usable even if telemetry fails
  }
};

export const trackGoogleEvent = async (eventName: string, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch {
    // keep the app functional if analytics cannot send
  }
};

// ─── Authentication Functions ───

export const signInWithGoogle = async (): Promise<User | null> => {
  const auth = getAuthInstance();
  if (!auth) throw new Error('Firebase Auth not initialized');

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user profile in Firestore (non-blocking)
    // Don't await this to prevent slow Firestore from blocking auth
    const firestore = getFirestoreInstance();
    if (firestore && user.uid) {
      setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastSignIn: serverTimestamp(),
      }, { merge: true }).catch(err => {
        console.error('Failed to create user profile:', err);
        // Don't throw - auth is successful even if profile creation fails
      });
    }

    // Track event (non-blocking)
    trackGoogleEvent('user_login', { method: 'google' }).catch(err => {
      console.error('Failed to track login event:', err);
    });

    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  const auth = getAuthInstance();
  if (!auth) throw new Error('Firebase Auth not initialized');

  try {
    await firebaseSignOut(auth);
    await trackGoogleEvent('user_logout', {});
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  const auth = getAuthInstance();
  return auth?.currentUser ?? null;
};

export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  const auth = getAuthInstance();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return auth.onAuthStateChanged(callback);
};