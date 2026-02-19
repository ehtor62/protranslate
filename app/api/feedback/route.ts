import { NextRequest, NextResponse } from 'next/server';
import { adminDb, checkRateLimit } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, comment, userId, userEmail, timestamp } = body;

    // Rate limiting: 10 submissions per hour per user/IP
    const identifier = userId || request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(`feedback:${identifier}`, 10, 3600000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment && typeof comment === 'string' && comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long. Maximum 1000 characters.' },
        { status: 400 }
      );
    }

    // Create feedback document
    const feedbackData: any = {
      rating,
      comment: comment ? String(comment).trim() : '',
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
