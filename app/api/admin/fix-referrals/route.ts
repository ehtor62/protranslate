import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Admin endpoint to check and fix pending referrals
 * This can be used to manually award referral credits for cases where the webhook didn't fire
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

    console.log(`[Admin] Checking referrals for user: ${userId}`);

    // Get the user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[Admin] User data:', {
      referredBy: userData.referredBy,
      referredByCode: userData.referredByCode,
      credits: userData.credits
    });

    // Check for pending referrals
    const referralsQuery = await adminDb.collection('referrals')
      .where('referredUserId', '==', userId)
      .get();

    if (referralsQuery.empty) {
      return NextResponse.json({
        success: false,
        message: 'No referral records found for this user',
        userData: {
          referredBy: userData.referredBy,
          referredByCode: userData.referredByCode
        }
      });
    }

    const referralDoc = referralsQuery.docs[0];
    const referralData = referralDoc.data();

    console.log('[Admin] Referral data:', referralData);

    // Check if credits were already awarded
    if (referralData.creditsAwarded) {
      return NextResponse.json({
        success: false,
        message: 'Referral credits already awarded',
        referralData: {
          status: referralData.status,
          creditsAwarded: referralData.creditsAwarded,
          completedAt: referralData.completedAt
        }
      });
    }

    // Award the credits now
    const referrerRef = adminDb.collection('users').doc(referralData.referrerId);
    const referrerDoc = await referrerRef.get();
    const referrerData = referrerDoc.data();

    if (!referrerData) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    const currentCredits = referrerData.credits || 0;
    const currentEarned = referrerData.creditsEarnedFromReferrals || 0;
    const currentCount = referrerData.referralCount || 0;

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

    console.log(`[Admin] ✓ Awarded 10 credits to referrer ${referralData.referrerId}`);

    return NextResponse.json({
      success: true,
      message: 'Referral credits awarded successfully',
      referrerId: referralData.referrerId,
      creditsAwarded: 10,
      newReferrerBalance: currentCredits + 10
    });
  } catch (error) {
    console.error('[Admin] Error fixing referral:', error);
    return NextResponse.json(
      { error: 'Failed to fix referral', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
