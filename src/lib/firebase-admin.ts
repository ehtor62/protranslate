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

// Export aliases for compatibility
export const auth = adminAuth;
export const db = adminDb;

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
      // User doesn't exist yet - return default without creating
      // The user will be created when they use their first credit
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
      // New user - initialize with 5 credits, then deduct 1 for this translation
      // Try to get email from Firebase Auth for easier identification
      let email = null;
      try {
        const userRecord = await adminAuth.getUser(userId);
        email = userRecord.email;
      } catch (authError) {
        console.warn('Could not fetch user email:', authError);
      }
      
      // Initialize with 5 credits
      await userRef.set({
        credits: 5,
        email: email,
        createdAt: new Date(),
        lastUsed: new Date(),
      });
      
      // Now deduct 1 credit for this translation
      await userRef.update({
        credits: 4,
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

/**
 * Track referral when a user signs up with a referral code
 * @param newUserId - The new user's ID
 * @param referralCode - The referral code used
 */
export async function trackReferral(newUserId: string, referralCode: string): Promise<{ success: boolean; error?: string; referrerId?: string }> {
  try {
    // Find the referrer by referral code
    const referrerQuery = await adminDb.collection('users')
      .where('referralCode', '==', referralCode.toUpperCase())
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      console.warn('Referral code not found:', referralCode);
      return { success: false, error: 'Invalid referral code' };
    }

    const referrerId = referrerQuery.docs[0].id;
    
    // Don't allow self-referral
    if (referrerId === newUserId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }
    
    // Create referral record
    await adminDb.collection('referrals').add({
      referrerId,
      referredUserId: newUserId,
      referralCode,
      status: 'pending', // pending -> completed (after free credits used)
      createdAt: new Date().toISOString(),
      creditsAwarded: false
    });

    // Update or create new user document with referrer info
    const userRef = adminDb.collection('users').doc(newUserId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists()) {
      // User exists, update it
      await userRef.update({
        referredBy: referrerId,
        referredByCode: referralCode
      });
    } else {
      // User doesn't exist yet, create it with referral info
      await userRef.set({
        credits: 5,
        referredBy: referrerId,
        referredByCode: referralCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`[Referral] ✓ Tracked referral: ${newUserId} referred by ${referrerId} with code ${referralCode}`);

    return { success: true, referrerId };
  } catch (error) {
    console.error('Error tracking referral:', error);
    return { success: false, error: 'Failed to track referral' };
  }
}

/**
 * Check if user has used all free credits and award referrer if conditions met
 * @param userId - The user ID
 */
export async function checkAndAwardReferralCredits(userId: string): Promise<void> {
  try {
    console.log(`[Referral] Checking referral rewards for user: ${userId}`);
    
    // First, check for pending referrals in the referrals collection
    // This is more reliable than checking the user document
    const referralsQuery = await adminDb.collection('referrals')
      .where('referredUserId', '==', userId)
      .where('creditsAwarded', '==', false)
      .get();

    console.log(`[Referral] Found ${referralsQuery.size} pending referral(s) in referrals collection`);

    if (referralsQuery.empty) {
      console.log('[Referral] No pending referral rewards found');
      return; // No pending referral rewards
    }

    const referralDoc = referralsQuery.docs[0];
    const referralData = referralDoc.data();

    console.log(`[Referral] Processing referral for referrer: ${referralData.referrerId}`);

    // Also update the user document with referredBy if it's missing
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (userData && !userData.referredBy) {
      console.log(`[Referral] User ${userId} missing referredBy field, adding it now`);
      await adminDb.collection('users').doc(userId).update({
        referredBy: referralData.referrerId,
        referredByCode: referralData.referralCode
      });
    }

    // Award 10 credits to the referrer
    const referrerRef = adminDb.collection('users').doc(referralData.referrerId);
    const referrerDoc = await referrerRef.get();
    const referrerData = referrerDoc.data();
    
    if (!referrerData) {
      console.error(`[Referral] Referrer ${referralData.referrerId} not found!`);
      return;
    }
    
    const currentCredits = referrerData?.credits || 0;
    const currentEarned = referrerData?.creditsEarnedFromReferrals || 0;
    const currentCount = referrerData?.referralCount || 0;
    
    console.log(`[Referral] Referrer ${referralData.referrerId} current credits: ${currentCredits}, will become: ${currentCredits + 10}`);
    
    await referrerRef.update({
      credits: currentCredits + 10,
      creditsEarnedFromReferrals: currentEarned + 10,
      referralCount: currentCount + 1
    });

    // Mark referral as completed
    await referralDoc.ref.update({
      creditsAwarded: true,
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    console.log(`[Referral] ✓ Awarded 10 credits to referrer ${referralData.referrerId} for referring ${userId}`);
  } catch (error) {
    console.error('[Referral] Error awarding referral credits:', error);
    throw error; // Re-throw to see the error in webhook logs
  }
}
