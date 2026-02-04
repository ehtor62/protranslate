import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';

// This should be set in your .env.local file
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      console.error('Missing stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 400 }
      );
    }

    // For now, we'll parse the event directly
    // In production, you should verify the signature using Stripe's SDK
    const event = JSON.parse(body);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Get user ID from client_reference_id
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.error('No user ID in session');
        return NextResponse.json({ error: 'No user ID' }, { status: 400 });
      }

      // Get the number of credits from metadata or line items
      // You'll need to configure this in your Stripe product metadata
      const lineItems = session.line_items?.data || [];
      const metadata = session.metadata || {};
      
      // Extract credits from metadata (you can set this in Stripe dashboard)
      const creditsToAdd = parseInt(metadata.credits || '0', 10);
      
      if (creditsToAdd > 0) {
        // Add credits to user's account
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const currentCredits = userDoc.data()?.credits || 0;
        
        await userRef.update({
          credits: currentCredits + creditsToAdd,
          lastPurchase: new Date().toISOString(),
        });

        console.log(`Added ${creditsToAdd} credits to user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
