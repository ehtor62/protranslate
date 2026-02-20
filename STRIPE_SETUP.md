# Stripe Integration Setup

## Overview
The app uses Stripe's Pricing Table for payment processing. When a user completes a purchase, Stripe sends a webhook to credit their account.

## Setup Steps

### 1. Configure Pricing Table in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** > **Pricing Tables**
3. Create 3 products with these details:
   - **Starter Pack**: €7.99 (or your currency)
   - **Professional Pack**: €19.99
   - **Power Pack**: €49.99
4. For each product, add this metadata:
   - Key: `credits`
   - Value: Number of credits (e.g., `50`, `150`, `500`)
5. Click **"Create pricing table"** and add all 3 products
6. Save the pricing table and **copy the table ID** (starts with `prctbl_`)
7. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_your_table_id_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   ```

### 2. Set Up Webhook Endpoint

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set URL to: `https://yourdomain.com/api/webhooks/stripe`
   - For local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
   ```

### 3. Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook signing secret for testing
# Add it to .env.local as STRIPE_WEBHOOK_SECRET
```

### 4. Test a Payment

1. Start your local server: `npm run dev`
2. Open the app and click "View plans"
3. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Any future expiry date and CVC
4. Complete the checkout
5. Check your terminal - you should see webhook logs
6. Verify credits were added to user's Firestore document

## How It Works

1. User clicks "Buy Now" in Stripe Pricing Table
2. Stripe Checkout opens with pre-filled email
3. User completes payment
4. Stripe sends `checkout.session.completed` webhook
5. Webhook handler extracts:
   - User ID from `client_reference_id`
   - Credits from product metadata
6. Credits added to user's Firestore document
7. User can immediately use new credits

## Product Configuration in Stripe

Make sure each product has this metadata:

| Product Name | Credits | Price | Metadata |
|--------------|---------|-------|----------|
| Starter Pack | 50 | €7.99 | `credits: 50` |
| Professional Pack | 150 | €19.99 | `credits: 150` |
| Power Pack | 500 | €49.99 | `credits: 500` |

## Webhook Security

In production, verify webhook signatures using Stripe's SDK:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

## Troubleshooting

- **Nothing happens when clicking "Buy Now"**: Check browser console for errors. Ensure Stripe script is loading.
- **Webhook not receiving events**: Verify webhook URL in Stripe dashboard and check that it's listening for `checkout.session.completed`
- **Credits not added**: Check server logs for webhook errors. Verify product metadata is set correctly.
- **Local testing not working**: Make sure Stripe CLI is running and forwarding webhooks
