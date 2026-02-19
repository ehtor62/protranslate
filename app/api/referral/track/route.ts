import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { trackReferral } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get referral code from request body
    const { referralCode } = await request.json();
    
    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Validate referral code format (6 uppercase alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(referralCode)) {
      return NextResponse.json(
        { error: 'Invalid referral code format' },
        { status: 400 }
      );
    }

    // Track the referral
    const result = await trackReferral(userId, referralCode);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      referrerId: result.referrerId,
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
