import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
