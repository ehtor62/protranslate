import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Test endpoint to check webhook/product configuration
// Access via: GET /api/webhooks/stripe/test
export async function GET(request: NextRequest) {
  try {
    const checks = {
      stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      firebaseConfigured: !!process.env.FIREBASE_PROJECT_ID,
      products: [] as any[],
      recentSessions: [] as any[],
    };

    // List products with their metadata
    try {
      const products = await stripe.products.list({ limit: 10 });
      checks.products = products.data.map(p => ({
        id: p.id,
        name: p.name,
        metadata: p.metadata,
        hasCreditsMetadata: !!p.metadata.credits,
        credits: p.metadata.credits || 'NOT SET'
      }));
    } catch (error) {
      checks.products = [{ error: 'Failed to fetch products' }];
    }

    // List recent checkout sessions
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 5 });
      checks.recentSessions = sessions.data.map(s => ({
        id: s.id,
        paymentStatus: s.payment_status,
        clientReferenceId: s.client_reference_id,
        created: new Date(s.created * 1000).toISOString(),
      }));
    } catch (error) {
      checks.recentSessions = [{ error: 'Failed to fetch sessions' }];
    }

    return NextResponse.json({
      status: 'Webhook configuration test',
      timestamp: new Date().toISOString(),
      checks,
      instructions: {
        productsNeedMetadata: 'All products should have "credits" in metadata',
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`,
        requiredEvent: 'checkout.session.completed',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
    }, { status: 500 });
  }
}
