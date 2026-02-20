import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Diagnose a specific session to see what went wrong
// Usage: GET /api/admin/diagnose-session?sessionId=cs_live_xxx&adminSecret=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const adminSecret = searchParams.get('adminSecret');

    if (adminSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Retrieve the session with full details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    const lineItems = session.line_items?.data || [];
    const details = lineItems.map(item => {
      const product = item.price?.product as Stripe.Product | undefined;
      return {
        priceId: item.price?.id,
        productId: typeof product === 'object' ? product.id : product,
        productName: typeof product === 'object' ? product.name : 'Unknown',
        amount: item.amount_total,
        currency: item.currency,
        quantity: item.quantity,
        metadata: typeof product === 'object' ? product.metadata : {},
        hasCreditsMetadata: typeof product === 'object' && !!product.metadata?.credits,
        creditsValue: typeof product === 'object' ? product.metadata?.credits : 'N/A',
      };
    });

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      clientReferenceId: session.client_reference_id,
      amountTotal: session.amount_total,
      currency: session.currency,
      created: new Date(session.created * 1000).toISOString(),
      lineItems: details,
      diagnosis: {
        wasPaid: session.payment_status === 'paid',
        hasUserId: !!session.client_reference_id,
        hasLineItems: lineItems.length > 0,
        allProductsHaveCredits: details.every(d => d.hasCreditsMetadata),
        missingCreditsProducts: details.filter(d => !d.hasCreditsMetadata).map(d => d.productName),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Diagnosis failed', message: error.message },
      { status: 500 }
    );
  }
}
