import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, adminDb, checkRateLimit } from '@/lib/firebase-admin';

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
    if (!checkRateLimit(`admin-add-credits:${authResult.userId}`, 10, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { userId: targetUserId, amount = 5 } = await request.json();
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount < 1 || amount > 1000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between 1 and 1000.' },
        { status: 400 }
      );
    }

    // Add or set credits
    const userRef = adminDb.collection('users').doc(targetUserId);
    
    console.log(`[Admin] User ${authResult.userId} adding ${amount} credits to user ${targetUserId}`);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        credits: amount,
        createdAt: new Date(),
      });
    } else {
      // Add to existing credits
      const currentCredits = userDoc.data()?.credits ?? 0;
      await userRef.update({
        credits: currentCredits + amount,
      });
    }

    const updatedDoc = await userRef.get();
    const newCredits = updatedDoc.data()?.credits ?? 0;

    return NextResponse.json({ 
      success: true, 
      credits: newCredits,
      message: `Added ${amount} credits. New balance: ${newCredits}` 
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}
