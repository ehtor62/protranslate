import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, verifyAdminAuth, checkRateLimit } from '@/lib/firebase-admin';

/**
 * Admin endpoint to clean up old anonymous users
 * Deletes anonymous users older than 30 days who never converted to real accounts
 * Should be called via cron job (e.g., weekly)
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Rate limiting: 5 requests per day (this is a heavy operation)
    if (!checkRateLimit(`admin-cleanup:${authResult.userId}`, 5, 86400000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    console.log(`[Cleanup] Starting anonymous user cleanup by admin: ${authResult.userId}`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    const cutoffTime = cutoffDate.getTime();

    let deletedCount = 0;
    let scannedCount = 0;
    const errors: string[] = [];
    let nextPageToken: string | undefined;

    // List all users in batches
    do {
      const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);
      
      for (const userRecord of listUsersResult.users) {
        scannedCount++;

        // Check if user is anonymous (has no email and no provider data except anonymous)
        const isAnonymous = !userRecord.email && (
          !userRecord.providerData || 
          userRecord.providerData.length === 0 ||
          userRecord.providerData.every(p => p.providerId === 'anonymous')
        );

        if (!isAnonymous) {
          continue; // Skip non-anonymous users
        }

        // Check if user is older than cutoff date
        const createdAt = new Date(userRecord.metadata.creationTime).getTime();
        if (createdAt > cutoffTime) {
          continue; // Skip recent users
        }

        // This is an old anonymous user - delete it
        try {
          console.log(`[Cleanup] Deleting anonymous user: ${userRecord.uid} (created: ${userRecord.metadata.creationTime})`);
          
          // Delete Firestore document first
          try {
            await adminDb.collection('users').doc(userRecord.uid).delete();
            console.log(`[Cleanup] Deleted Firestore doc for: ${userRecord.uid}`);
          } catch (firestoreError) {
            console.warn(`[Cleanup] Firestore delete failed for ${userRecord.uid}:`, firestoreError);
            // Continue with auth deletion even if Firestore fails
          }

          // Delete from Firebase Auth
          await adminAuth.deleteUser(userRecord.uid);
          deletedCount++;
          console.log(`[Cleanup] ✓ Deleted user ${userRecord.uid}`);
        } catch (deleteError) {
          const errorMsg = `Failed to delete ${userRecord.uid}: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`;
          console.error(`[Cleanup] ❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    const summary = {
      success: true,
      scannedUsers: scannedCount,
      deletedUsers: deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return max 10 errors
      timestamp: new Date().toISOString()
    };

    console.log(`[Cleanup] Completed: Scanned ${scannedCount}, Deleted ${deletedCount} anonymous users`);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for cron job services (using secret key instead of admin auth)
 * This allows external cron services to trigger the cleanup
 */
export async function GET(request: NextRequest) {
  try {
    // Check for cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cleanup] Starting scheduled cleanup via cron job');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    const cutoffTime = cutoffDate.getTime();

    let deletedCount = 0;
    let scannedCount = 0;
    const errors: string[] = [];
    let nextPageToken: string | undefined;

    // List all users in batches
    do {
      const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);
      
      for (const userRecord of listUsersResult.users) {
        scannedCount++;

        // Check if user is anonymous
        const isAnonymous = !userRecord.email && (
          !userRecord.providerData || 
          userRecord.providerData.length === 0 ||
          userRecord.providerData.every(p => p.providerId === 'anonymous')
        );

        if (!isAnonymous) {
          continue;
        }

        // Check if user is older than cutoff date
        const createdAt = new Date(userRecord.metadata.creationTime).getTime();
        if (createdAt > cutoffTime) {
          continue;
        }

        // Delete old anonymous user
        try {
          console.log(`[Cleanup] Deleting anonymous user: ${userRecord.uid} (created: ${userRecord.metadata.creationTime})`);
          
          // Delete Firestore document
          try {
            await adminDb.collection('users').doc(userRecord.uid).delete();
          } catch (firestoreError) {
            console.warn(`[Cleanup] Firestore delete failed for ${userRecord.uid}:`, firestoreError);
          }

          // Delete from Firebase Auth
          await adminAuth.deleteUser(userRecord.uid);
          deletedCount++;
        } catch (deleteError) {
          const errorMsg = `Failed to delete ${userRecord.uid}: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`;
          console.error(`[Cleanup] ❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    const summary = {
      success: true,
      scannedUsers: scannedCount,
      deletedUsers: deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      timestamp: new Date().toISOString()
    };

    console.log(`[Cleanup] Cron job completed: Scanned ${scannedCount}, Deleted ${deletedCount} anonymous users`);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Cleanup] Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
