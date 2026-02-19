import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Admin endpoint to check referral status for debugging
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    console.log(`[Referral Check] Checking referral status for user: ${userId}`);

    // Get the user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({
        error: 'User not found',
        userId
      }, { status: 404 });
    }

    const userData = userDoc.data();

    // Check for referral records where this user is the referred user
    const referredQuery = await adminDb.collection('referrals')
      .where('referredUserId', '==', userId)
      .get();

    // Check for referral records where this user is the referrer
    const referrerQuery = await adminDb.collection('referrals')
      .where('referrerId', '==', userId)
      .get();

    const referredRecords = referredQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const referrerRecords = referrerQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      userId,
      userData: {
        email: userData?.email,
        credits: userData?.credits,
        referredBy: userData?.referredBy,
        referredByCode: userData?.referredByCode,
        creditsEarnedFromReferrals: userData?.creditsEarnedFromReferrals,
        referralCount: userData?.referralCount,
        referralCode: userData?.referralCode,
        createdAt: userData?.createdAt
      },
      asReferred: {
        count: referredRecords.length,
        records: referredRecords
      },
      asReferrer: {
        count: referrerRecords.length,
        records: referrerRecords
      }
    });
  } catch (error) {
    console.error('[Referral Check] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check referral', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
