import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('[Webhook] Received event, signature present:', !!signature);

    if (!signature) {
      console.error('[Webhook] Missing stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the event using Stripe's SDK
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      console.log('[Webhook] Event verified:', event.type);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('[Webhook] Processing checkout.session.completed');
      console.log('[Webhook] Session ID:', session.id);
      console.log('[Webhook] Client reference ID:', session.client_reference_id);
      
      // Get user ID from client_reference_id
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.error('[Webhook] No user ID in session');
        return NextResponse.json({ error: 'No user ID' }, { status: 400 });
      }

      // Retrieve the full session with line items to get product metadata
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      console.log('[Webhook] Retrieved full session with line items');

      // Extract credits from the first line item's product metadata
      let creditsToAdd = 0;
      if (fullSession.line_items?.data && fullSession.line_items.data.length > 0) {
        const lineItem = fullSession.line_items.data[0];
        const product = lineItem.price?.product as Stripe.Product | undefined;
        
        if (product && typeof product === 'object' && product.metadata?.credits) {
          creditsToAdd = parseInt(product.metadata.credits, 10);
          console.log('[Webhook] Credits from product metadata:', creditsToAdd);
        }
      }
      
      if (creditsToAdd > 0) {
        // Add credits to user's account
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const currentCredits = userDoc.data()?.credits || 0;
        
        await userRef.update({
          credits: currentCredits + creditsToAdd,
          lastPurchase: new Date().toISOString(),
        });

        console.log(`[Webhook] ✓ Added ${creditsToAdd} credits to user ${userId}. New total: ${currentCredits + creditsToAdd}`);
      } else {
        console.warn('[Webhook] No credits to add. Check product metadata in Stripe Dashboard.');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
