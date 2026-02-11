"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, EmailAuthProvider, linkWithCredential, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymouslyWithState: () => Promise<User>;
  linkAnonymousAccount: (email: string, password: string) => Promise<void>;
  isEmailVerified: boolean;
  checkEmailVerification: (force?: boolean) => Promise<boolean>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAnonymouslyWithState: async () => { throw new Error('Not implemented'); },
  linkAnonymousAccount: async () => { throw new Error('Not implemented'); },
  isEmailVerified: false,
  checkEmailVerification: async (force?: boolean) => false,
  signOutUser: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

// LocalStorage key for draft settings
const DRAFT_SETTINGS_KEY = 'draftSettings';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  // Sync local draft settings to Firestore
  const syncDraftSettingsToFirestore = async (userId: string) => {
    const draftSettings = localStorage.getItem(DRAFT_SETTINGS_KEY);
    if (draftSettings) {
      try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
          draftSettings: JSON.parse(draftSettings),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        // Clear localStorage after successful sync
        localStorage.removeItem(DRAFT_SETTINGS_KEY);
      } catch (error) {
        console.error('Error syncing draft settings to Firestore:', error);
        // Keep settings in localStorage if Firestore fails
        console.log('Draft settings kept in localStorage due to sync error');
      }
    }
  };

  // Sign in anonymously and migrate localStorage settings to Firestore
  const signInAnonymouslyWithState = async (): Promise<User> => {
    const userCredential = await signInAnonymously(auth);
    // Attempt to sync but don't block on failure
    syncDraftSettingsToFirestore(userCredential.user.uid).catch(err => {
      console.warn('Failed to sync draft settings, will retry later:', err);
    });
    return userCredential.user;
  };

  // Link anonymous account with email/password
  const linkAnonymousAccount = async (email: string, password: string) => {
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user to link');
    }
    
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    
    // Send verification email
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Sign out user and clear all data
  const signOutUser = async (): Promise<void> => {
    console.log('[AuthContext] Sign out initiated');
    try {
      // Clear ALL localStorage on sign-out (privacy/security)
      if (typeof window !== 'undefined') {
        console.log('[AuthContext] Clearing localStorage');
        localStorage.removeItem('draftSettings');
        localStorage.removeItem('referralCode');
        localStorage.removeItem('email-verification-success');
        localStorage.removeItem('pendingTranslation');
      }
      
      // Sign out from Firebase
      console.log('[AuthContext] Calling Firebase signOut');
      await signOut(auth);
      console.log('[AuthContext] Firebase signOut complete');
      
      // Reset local state
      setUser(null);
      setIsEmailVerified(false);
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error);
      throw error;
    }
  };

  // Manually check email verification status (with throttling)
  const checkEmailVerification = async (force: boolean = false): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    // Prevent simultaneous checks
    if (isChecking && !force) {
      console.log('[AuthContext] Check already in progress, skipping');
      return isEmailVerified;
    }
    
    // Throttle: minimum 10 seconds between checks (unless forced)
    const now = Date.now();
    if (!force && now - lastCheckTime < 10000) {
      console.log('[AuthContext] Throttling verification check (too soon)');
      return isEmailVerified;
    }
    
    setIsChecking(true);
    setLastCheckTime(now);
    
    try {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      setIsEmailVerified(verified);
      
      // Broadcast verification to all tabs
      if (verified && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('auth-verification');
          bc.postMessage({ type: 'email-verified', verified: true });
          bc.close();
        } catch (error) {
          console.warn('BroadcastChannel not available:', error);
        }
      }
      
      return verified;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthContext] Auth state changed:', user ? `User: ${user.email || user.uid}` : 'No user');
      setUser(user);
      setIsEmailVerified(user?.emailVerified || false);
      setLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Multi-tab sync: Listen for verification events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    
    // Try BroadcastChannel (modern approach)
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('auth-verification');
        bc.onmessage = async (event) => {
          if (event.data?.type === 'email-verified' && event.data?.verified) {
            console.log('[AuthContext] Received verification from another tab');
            // Just update state without reloading (other tab already confirmed)
            setIsEmailVerified(true);
            
            // Notify the app about pending translation via custom event
            if (typeof window !== 'undefined') {
              const pendingEvent = new CustomEvent('verification-complete');
              window.dispatchEvent(pendingEvent);
            }
          }
        };
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }
    
    // Fallback: localStorage events for older browsers
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'email-verification-success' && e.newValue === 'true') {
        console.log('[AuthContext] Received verification via localStorage');
        setIsEmailVerified(true);
        localStorage.removeItem('email-verification-success'); // Clean up
        
        // Notify the app about pending translation via custom event
        if (typeof window !== 'undefined') {
          const pendingEvent = new CustomEvent('verification-complete');
          window.dispatchEvent(pendingEvent);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymouslyWithState, linkAnonymousAccount, isEmailVerified, checkEmailVerification, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
