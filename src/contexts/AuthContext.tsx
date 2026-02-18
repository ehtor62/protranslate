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
        
        // Check if user document exists
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // New user - initialize with all required fields
          let email = null;
          if (auth.currentUser) {
            email = auth.currentUser.email;
          }
          
          await setDoc(userDocRef, {
            credits: 5,
            email: email,
            createdAt: new Date().toISOString(),
            draftSettings: JSON.parse(draftSettings),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Existing user - just update draft settings
          await setDoc(userDocRef, {
            draftSettings: JSON.parse(draftSettings),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        
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
    
    // Update Firestore with email and ensure all fields are present
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Initialize user document with all required fields
        await setDoc(userDocRef, {
          credits: 5,
          email: email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update existing document with email
        await setDoc(userDocRef, {
          email: email,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        // Ensure credits field exists
        const data = userDoc.data();
        if (data && typeof data.credits !== 'number') {
          await setDoc(userDocRef, {
            credits: 5
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error updating user document after linking:', error);
    }
    
    // Send verification email via SendGrid API (instant delivery!)
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || 'Failed to send email');
        }

        const result = await response.json();
        console.log('[AuthContext] ✅ Verification email sent:', result.provider);
        console.log('[AuthContext] Email sent to:', auth.currentUser.email);
      } catch (error: any) {
        console.error('[AuthContext] ❌ Error sending verification email:', error);
        throw new Error('Failed to send verification email. Please try again.');
      }
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
      console.log('[AuthContext] Reloading user to check verification');
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      console.log('[AuthContext] Verification status:', verified);
      
      // Capture if this is a NEW verification (before state update)
      const wasJustVerified = verified && !isEmailVerified;
      
      // If just verified, force refresh the ID token
      if (wasJustVerified) {
        console.log('[AuthContext] Email just verified! Force refreshing token...');
        await auth.currentUser.getIdToken(true); // Force refresh token
        console.log('[AuthContext] Token refreshed');
      }
      
      // Update state
      setIsEmailVerified(verified);
      
      // If just verified, dispatch event and broadcast to all tabs
      if (wasJustVerified && typeof window !== 'undefined') {
        console.log('[AuthContext] Dispatching verification-complete event in same tab');
        window.dispatchEvent(new CustomEvent('verification-complete'));
        
        // Also broadcast to other tabs
        if ('BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('auth-verification');
            bc.postMessage({ type: 'email-verified', verified: true });
            bc.close();
          } catch (error) {
            console.warn('BroadcastChannel not available:', error);
          }
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

    console.log('[AuthContext] Setting up BroadcastChannel and storage listeners');
    let bc: BroadcastChannel | null = null;
    
    // Try BroadcastChannel (modern approach)
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('auth-verification');
        console.log('[AuthContext] BroadcastChannel created successfully');
        bc.onmessage = async (event) => {
          console.log('[AuthContext] BroadcastChannel message received:', event.data);
          if (event.data?.type === 'email-verified' && event.data?.verified) {
            console.log('[AuthContext] ✓ Received verification from another tab via BroadcastChannel');
            
            // Force refresh the token in this tab too
            if (auth.currentUser) {
              console.log('[AuthContext] Force refreshing token in this tab...');
              await auth.currentUser.reload();
              await auth.currentUser.getIdToken(true); // Force refresh
              console.log('[AuthContext] Token refreshed in this tab');
            }
            
            // Update state
            setIsEmailVerified(true);
            console.log('[AuthContext] isEmailVerified state updated to true');
            
            // Notify the app about pending translation via custom event
            if (typeof window !== 'undefined') {
              console.log('[AuthContext] Dispatching verification-complete event...');
              const pendingEvent = new CustomEvent('verification-complete');
              window.dispatchEvent(pendingEvent);
              console.log('[AuthContext] ✓ verification-complete event dispatched');
            }
          }
        };
      } catch (error) {
        console.warn('[AuthContext] BroadcastChannel not available:', error);
      }
    } else {
      console.warn('[AuthContext] BroadcastChannel not supported in this browser');
    }
    
    // Fallback: localStorage events for older browsers
    const handleStorageChange = async (e: StorageEvent) => {
      console.log('[AuthContext] localStorage change detected:', e.key, e.newValue);
      if (e.key === 'email-verification-success' && e.newValue === 'true') {
        console.log('[AuthContext] ✓ Received verification via localStorage');
        
        // Force refresh the token
        if (auth.currentUser) {
          console.log('[AuthContext] Force refreshing token...');
          await auth.currentUser.reload();
          await auth.currentUser.getIdToken(true);
          console.log('[AuthContext] Token refreshed');
        }
        
        setIsEmailVerified(true);
        console.log('[AuthContext] isEmailVerified state updated to true');
        localStorage.removeItem('email-verification-success'); // Clean up
        
        // Notify the app about pending translation via custom event
        if (typeof window !== 'undefined') {
          console.log('[AuthContext] Dispatching verification-complete event...');
          const pendingEvent = new CustomEvent('verification-complete');
          window.dispatchEvent(pendingEvent);
          console.log('[AuthContext] ✓ verification-complete event dispatched');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    console.log('[AuthContext] Storage event listener attached');
    
    return () => {
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-check verification when window regains focus (user returns from verification tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = async () => {
      // Check on focus event (when user switches back to this tab)
      if (auth.currentUser && !isEmailVerified) {
        console.log('[AuthContext] Window focused and user not verified, checking...');
        await checkEmailVerification(true); // Force check, bypass throttling
      }
    };

    const handleVisibility = async () => {
      // Check on visibility change (when tab becomes visible)
      if (document.visibilityState === 'visible' && auth.currentUser && !isEmailVerified) {
        console.log('[AuthContext] Tab became visible and user not verified, checking...');
        await checkEmailVerification(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isEmailVerified, checkEmailVerification]);

  return (
    <AuthContext.Provider value={{ user, loading, signInAnonymouslyWithState, linkAnonymousAccount, isEmailVerified, checkEmailVerification, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
