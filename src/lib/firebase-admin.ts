import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // In production, use service account credentials
    // For development, Firebase Admin can use Application Default Credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Fallback for development - uses Application Default Credentials
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn('Firebase Admin not initialized - no credentials found');
    }
  }
}

initializeFirebaseAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();

/**
 * Verify Firebase ID token from request
 * @param token - The ID token from the Authorization header
 * @returns The decoded token or null if invalid
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

/**
 * Get user credits from Firestore
 * @param userId - The user ID
 * @returns The number of credits or 5 for new users
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // New user - initialize with 5 credits
      await adminDb.collection('users').doc(userId).set({
        credits: 5,
        createdAt: new Date(),
      });
      return 5;
    }
    
    const data = userDoc.data();
    return data?.credits ?? 5;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
}

/**
 * Decrement user credits
 * @param userId - The user ID
 * @returns The new credit balance or null if insufficient credits
 */
export async function decrementUserCredits(userId: string): Promise<number | null> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // New user - initialize with 5 credits and decrement to 4
      await userRef.set({
        credits: 4,
        createdAt: new Date(),
        lastUsed: new Date(),
      });
      return 4;
    }
    
    const currentCredits = userDoc.data()?.credits ?? 0;
    
    if (currentCredits <= 0) {
      return null; // Insufficient credits
    }
    
    const newCredits = currentCredits - 1;
    await userRef.update({
      credits: newCredits,
      lastUsed: new Date(),
    });
    
    return newCredits;
  } catch (error) {
    console.error('Error decrementing user credits:', error);
    return null;
  }
}
