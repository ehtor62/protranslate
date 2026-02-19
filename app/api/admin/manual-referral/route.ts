import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyAdminAuth, checkRateLimit } from '@/lib/firebase-admin';

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

    // Rate limiting: 10 requests per hour
    if (!checkRateLimit(`admin-manual-referral:${authResult.userId}`, 10, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { referrerId, referredUserId, referralCode } = await request.json();

    if (!referrerId || !referredUserId || !referralCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate referral code format
    if (typeof referralCode !== 'string' || !/^[A-Z0-9]{6}$/.test(referralCode)) {
      return NextResponse.json(
        { error: 'Invalid referral code format (must be 6 uppercase alphanumeric characters)' },
        { status: 400 }
      );
    }

    console.log('[Manual Referral] Starting manual referral setup', {
      referrerId,
      referredUserId,
      referralCode,
    });

    // 1. Create referral record
    const referralRef = adminDb.collection('referrals').doc();
    await referralRef.set({
      referrerId,
      referredUserId,
      referralCode,
      createdAt: new Date().toISOString(),
      status: 'completed',
      creditsAwarded: true,
      manuallyCreated: true,
    });
    console.log('[Manual Referral] Created referral record', referralRef.id);

    // 2. Update referred user (User B) with referral info
    const referredUserRef = adminDb.collection('users').doc(referredUserId);
    await referredUserRef.update({
      referredBy: referrerId,
      referredByCode: referralCode,
    });
    console.log('[Manual Referral] Updated referred user');

    // 3. Award 10 credits to referrer (User A)
    const referrerRef = adminDb.collection('users').doc(referrerId);
    const referrerDoc = await referrerRef.get();
    const referrerData = referrerDoc.data();

    const currentCredits = referrerData?.credits || 0;
    const currentEarnedFromReferrals = referrerData?.creditsEarnedFromReferrals || 0;
    const currentReferralCount = referrerData?.referralCount || 0;

    await referrerRef.update({
      credits: currentCredits + 10,
      creditsEarnedFromReferrals: currentEarnedFromReferrals + 10,
      referralCount: currentReferralCount + 1,
    });

    console.log('[Manual Referral] Awarded 10 credits to referrer', {
      oldCredits: currentCredits,
      newCredits: currentCredits + 10,
    });

    return NextResponse.json({
      success: true,
      message: 'Referral manually created and credits awarded',
      referralId: referralRef.id,
      creditsAwarded: 10,
    });
  } catch (error) {
    console.error('[Manual Referral] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create manual referral' },
      { status: 500 }
    );
  }
}
