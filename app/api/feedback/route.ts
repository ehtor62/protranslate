import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, comment, userId, userEmail, timestamp } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Create feedback document
    const feedbackData: any = {
      rating,
      comment: comment || '',
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date(),
    };

    // Add user info if provided
    if (userId) {
      feedbackData.userId = userId;
    }
    if (userEmail) {
      feedbackData.userEmail = userEmail;
    }

    // Save to Firestore
    const feedbackRef = await adminDb.collection('feedback').add(feedbackData);

    console.log('[Feedback] Feedback submitted:', feedbackRef.id);

    return NextResponse.json({ 
      success: true,
      id: feedbackRef.id
    });
  } catch (error) {
    console.error('[Feedback] Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
