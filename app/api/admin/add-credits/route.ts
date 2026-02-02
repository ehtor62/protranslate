import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { amount = 5 } = await request.json();
    const userId = decodedToken.uid;

    // Add or set credits
    const userRef = adminDb.collection('users').doc(userId);
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
