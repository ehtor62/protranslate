import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/firebase-admin';

// Generate a unique referral code (6 characters)
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Check if user already has a referral code
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.referralCode) {
      // Return existing code
      return NextResponse.json({ 
        referralCode: userData.referralCode,
        referralCount: userData.referralCount || 0,
        creditsEarned: userData.creditsEarnedFromReferrals || 0
      });
    }

    // Generate a new unique code
    let referralCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      referralCode = generateReferralCode();
      
      // Check if code already exists
      const existingCode = await adminDb.collection('users')
        .where('referralCode', '==', referralCode)
        .limit(1)
        .get();
      
      if (existingCode.empty) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    // Save the referral code to user document
    await adminDb.collection('users').doc(userId).set({
      referralCode: referralCode!,
      referralCount: 0,
      creditsEarnedFromReferrals: 0,
      referralCodeCreatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ 
      referralCode: referralCode!,
      referralCount: 0,
      creditsEarnedFromReferrals: 0
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
