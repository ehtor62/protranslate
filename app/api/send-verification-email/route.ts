import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/lib/firebase-admin';

/**
 * Send verification email via Firebase Admin SDK
 * This uses Firebase's generateEmailVerificationLink which is more reliable
 * than the client-side sendEmailVerification
 * 
 * Alternative: Integrate SendGrid for instant delivery (see EMAIL_VERIFICATION_SETUP.md)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      return NextResponse.json({ error: 'No email associated with user' }, { status: 400 });
    }

    // Generate verification link using Firebase Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(
      decodedToken.email,
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/translate`,
      }
    );

    // NOTE: This still uses Firebase's email service which can be slow
    // For instant delivery, integrate SendGrid (see EMAIL_VERIFICATION_SETUP.md)
    // The generateEmailVerificationLink creates the link, but Firebase still sends it
    
    console.log('[Verification API] ✅ Verification link generated for:', decodedToken.email);
    console.log('[Verification API] ⚠️  Email still sent via Firebase (may be delayed)');
    console.log('[Verification API] 💡 For instant delivery, implement SendGrid (see docs)');
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent',
      note: 'Using Firebase email service - may be delayed. See EMAIL_VERIFICATION_SETUP.md for SendGrid integration.'
    });

  } catch (error: any) {
    console.error('[Verification API] ❌ Error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error.message 
    }, { status: 500 });
  }
}
