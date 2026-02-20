import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb, checkAndAwardReferralCredits } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
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
      console.log('[Webhook] Payment status:', session.payment_status);
      console.log('[Webhook] Mode:', session.mode);
      
      // Only process if payment was successful
      if (session.payment_status !== 'paid') {
        console.log('[Webhook] Payment not completed yet, status:', session.payment_status);
        return NextResponse.json({ received: true, status: 'payment_pending' });
      }
      
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
        
        console.log('[Webhook] Line item:', JSON.stringify({
          priceId: lineItem.price?.id,
          productId: typeof product === 'object' ? product.id : product,
          productName: typeof product === 'object' ? product.name : 'N/A',
          metadata: typeof product === 'object' ? product.metadata : {}
        }));
        
        if (product && typeof product === 'object' && product.metadata?.credits) {
          creditsToAdd = parseInt(product.metadata.credits, 10);
          console.log('[Webhook] Credits from product metadata:', creditsToAdd);
        } else {
          console.warn('[Webhook] No credits metadata found on product');
        }
      } else {
        console.warn('[Webhook] No line items found in session');
      }
      
      if (creditsToAdd > 0) {
        // Add credits to user's account
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          console.log('[Webhook] User document does not exist, creating it');
          await userRef.set({
            credits: creditsToAdd,
            lastPurchase: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
          console.log(`[Webhook] ✓ Created user ${userId} with ${creditsToAdd} credits`);
        } else {
          const currentCredits = userDoc.data()?.credits || 0;
          const newTotal = currentCredits + creditsToAdd;
          
          await userRef.update({
            credits: newTotal,
            lastPurchase: new Date().toISOString(),
          });
          console.log(`[Webhook] ✓ Updated user ${userId}: ${currentCredits} + ${creditsToAdd} = ${newTotal} credits`);
        }
        
        // Check if this purchase should trigger referral rewards
        // This awards the referrer when the referred user makes their first purchase
        console.log(`[Webhook] Checking if user ${userId} should trigger referral rewards...`);
        try {
          await checkAndAwardReferralCredits(userId);
          console.log(`[Webhook] Referral check completed for user ${userId}`);
        } catch (error) {
          console.error('[Webhook] Error checking referral credits:', error);
        }
      } else {
        console.error('[Webhook] ⚠️ NO CREDITS TO ADD! Product metadata missing.');
        console.error('[Webhook] Please add "credits" metadata to your Stripe products.');
        console.error('[Webhook] Example: In Stripe Dashboard > Products > [Your Product] > Metadata');
        console.error('[Webhook] Add key: "credits" with value: "50" (or appropriate amount)');
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
