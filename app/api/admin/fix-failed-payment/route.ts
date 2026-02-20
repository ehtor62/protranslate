import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Admin endpoint to manually credit users for failed webhook processing
// Usage: POST /api/admin/fix-failed-payment
// Body: { "sessionId": "cs_live_...", "adminSecret": "your-secret" }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, adminSecret } = body;

    // Simple admin authentication
    if (adminSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required' },
        { status: 400 }
      );
    }

    console.log('[FixPayment] Processing session:', sessionId);

    // Retrieve the session with line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    console.log('[FixPayment] Session details:', {
      id: session.id,
      paymentStatus: session.payment_status,
      clientReferenceId: session.client_reference_id,
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Session not paid',
        paymentStatus: session.payment_status,
      }, { status: 400 });
    }

    const userId = session.client_reference_id;
    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID in session' },
        { status: 400 }
      );
    }

    // Extract credits from product metadata
    let creditsToAdd = 0;
    let productName = 'Unknown';
    
    if (session.line_items?.data && session.line_items.data.length > 0) {
      const lineItem = session.line_items.data[0];
      const product = lineItem.price?.product as Stripe.Product | undefined;
      
      if (product && typeof product === 'object') {
        productName = product.name;
        if (product.metadata?.credits) {
          creditsToAdd = parseInt(product.metadata.credits, 10);
        }
      }
    }

    if (creditsToAdd === 0) {
      return NextResponse.json({
        error: 'No credits metadata found',
        productName,
        instructions: 'Add credits metadata to the product first, then retry',
      }, { status: 400 });
    }

    // Add credits to user's account
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        credits: creditsToAdd,
        lastPurchase: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      console.log(`[FixPayment] ✓ Created user ${userId} with ${creditsToAdd} credits`);
    } else {
      const currentCredits = userDoc.data()?.credits || 0;
      const newTotal = currentCredits + creditsToAdd;
      
      await userRef.update({
        credits: newTotal,
        lastPurchase: new Date().toISOString(),
      });
      console.log(`[FixPayment] ✓ Updated user ${userId}: ${currentCredits} + ${creditsToAdd} = ${newTotal} credits`);
    }

    return NextResponse.json({
      success: true,
      userId,
      productName,
      creditsAdded: creditsToAdd,
      sessionId,
      message: `Successfully added ${creditsToAdd} credits to user ${userId}`,
    });
  } catch (error: any) {
    console.error('[FixPayment] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process', message: error.message },
      { status: 500 }
    );
  }
}
