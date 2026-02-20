# Stripe Webhook & Credits Setup Troubleshooting

## Problem
Firebase credits are not being updated after successful Stripe payment.

## Root Causes & Solutions

### 1. Product Metadata Not Configured

**The most common issue:** Stripe products need a `credits` metadata field.

#### Fix in Stripe Dashboard:

1. Go to https://dashboard.stripe.com/products
2. Click on each product in your pricing table
3. Scroll down to **"Metadata"** section
4. Add a new metadata field:
   - **Key:** `credits`
   - **Value:** `50` (or 150, 500, etc. - the number of credits to award)
5. Click **"Save"**
6. Repeat for all products

**Example Setup:**
- Starter Pack → metadata: `credits: 50`
- Professional Pack → metadata: `credits: 150`
- Power Pack → metadata: `credits: 500`

---

### 2. Webhook Not Configured

The webhook tells your app when a payment succeeds.

#### Configure Webhook in Stripe Dashboard:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   - **Production:** `https://sentenly.com/api/webhooks/stripe`
   - **Development:** Use Stripe CLI (see below)
4. Select events to listen to:
   - ✅ `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

### 3. Webhook Secret Mismatch

Verify your `.env.local` has the correct webhook secret:

```env
STRIPE_WEBHOOK_SECRET=whsec_EWwOkW5TDEiTuRNlsta65rEey6Fv3pkm
```

This must match the signing secret from your Stripe webhook endpoint.

---

### 4. Testing Webhooks Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI (if not already installed)
# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret like:
# whsec_xxxxx (use this in your local .env.local)

# Test webhook with a test event
stripe trigger checkout.session.completed
```

---

## Verifying the Setup

### Check Webhook Logs

1. Make a test payment
2. Go to https://dashboard.stripe.com/webhooks
3. Click on your webhook endpoint
4. View recent **"Events"** - you should see `checkout.session.completed`
5. Click on an event to see:
   - ✅ Green checkmark = successful
   - ❌ Red X = failed (click to see error)

### Check Server Logs

After payment, look for these logs in your server console:

```
[Webhook] Received event, signature present: true
[Webhook] Event verified: checkout.session.completed
[Webhook] Processing checkout.session.completed
[Webhook] Session ID: cs_xxxxx
[Webhook] Client reference ID: PYwEHRtVbnO2HSriupD9BsXrAZG2
[Webhook] Retrieved full session with line items
[Webhook] Line item: {"priceId":"price_xxxxx","productId":"prod_xxxxx","productName":"Professional Pack","metadata":{"credits":"150"}}
[Webhook] Credits from product metadata: 150
[Webhook] ✓ Updated user PYwEHRtVbnO2HSriupD9BsXrAZG2: 0 + 150 = 150 credits
```

### If You See This Warning:

```
[Webhook] ⚠️ NO CREDITS TO ADD! Product metadata missing.
```

**Action Required:** Add the `credits` metadata to your Stripe products (see step 1 above).

---

## Common Issues

### Issue: Webhook returns 401 Unauthorized
**Solution:** Check that `STRIPE_WEBHOOK_SECRET` is set correctly in `.env.local`

### Issue: Webhook returns 400 Invalid signature
**Solution:** The webhook secret doesn't match. Get the correct one from Stripe Dashboard.

### Issue: Credits not updating even though webhook succeeds
**Solution:** Products are missing `credits` metadata. Add it to each product.

### Issue: User document not found error
**Solution:** Already fixed in latest code - user document is now created automatically.

---

## Vercel Deployment Notes

When deploying to Vercel, make sure to:

1. Add all environment variables to Vercel project settings
2. Use the **production** webhook endpoint URL in Stripe
3. Redeploy after changing environment variables

---

## Testing Checklist

- [ ] Products have `credits` metadata configured
- [ ] Webhook endpoint is created in Stripe Dashboard
- [ ] Webhook listens to `checkout.session.completed` event
- [ ] `STRIPE_WEBHOOK_SECRET` is in `.env.local` / Vercel env vars
- [ ] Webhook shows successful events in Stripe Dashboard
- [ ] Server logs show credit updates after payment
- [ ] User can see updated credits in the app after payment

---

## Quick Test

1. Sign in with a test account
2. Try to translate with 0 credits
3. Click on pricing modal
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. Check server logs for webhook processing
7. Verify credits appear in Firebase (check Firestore in Firebase Console)
8. Verify app shows updated credits

If any step fails, check the corresponding section above.
