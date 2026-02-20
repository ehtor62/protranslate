# Stripe Pricing Table Redirect Configuration

## Problem
After payment, customers see a "Thanks for your payment" page instead of being redirected back to your app.

## Solution
You need to configure the redirect URL in your Stripe Dashboard for the Pricing Table.

## Step-by-Step Instructions

### 1. Log into Stripe Dashboard
Go to https://dashboard.stripe.com/

### 2. Navigate to Pricing Tables
- Click on **"Products"** in the left sidebar
- Click on **"Pricing tables"** tab
- Find your pricing table with ID: `prctbl_1T2t1MCsI7lZbzVFlpHwwOj0`

### 3. Edit Pricing Table Settings
- Click on the pricing table to edit it
- Scroll to the **"After payment"** or **"Redirect after purchase"** section

### 4. Configure Redirect URL
Enable **"Redirect customers to a specific page"** and set:

**Production URL:**
```
https://sentenly.com/{locale}/translate?payment=success
```

**For testing/development:**
```
http://localhost:3000/{locale}/translate?payment=success
```

> **Note:** Replace `{locale}` with your supported locales. Stripe may require you to add separate URLs for each locale (en, fr, de, es, it, pt).

### 5. Alternative: Use Dynamic Redirect
If Stripe doesn't accept the `{locale}` placeholder, you may need to:

**Option A:** Create separate pricing tables for each locale
**Option B:** Use a catch-all redirect URL:
```
https://sentenly.com/en/translate?payment=success
```
Then handle locale detection in your app.

### 6. Save Changes
Click **"Save"** or **"Update"** to apply the changes.

### 7. Test the Flow
1. Sign in to your app with a test account
2. Click "Pricing" or trigger the pricing modal
3. Use a Stripe test card (e.g., `4242 4242 4242 4242`)
4. Complete the payment
5. Verify you're redirected to `/translate?payment=success`

## What the Code Does

The code has been updated to pass the redirect URL programmatically:

**PricingModal.tsx:**
```tsx
success-url={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/translate?payment=success`}
```

**Pricing Page:**
```tsx
success-url={`${process.env.NEXT_PUBLIC_APP_URL}/${locale}/translate?payment=success`}
```

This URL is used as a hint/override for the pricing table, but **the Stripe Dashboard configuration takes precedence**.

## Troubleshooting

### Still seeing "Thanks for payment" page?
- Verify the pricing table ID matches: `prctbl_1T2t1MCsI7lZbzVFlpHwwOj0`
- Check that redirect is enabled in Stripe Dashboard
- Ensure the URL uses HTTPS in production
- Clear browser cache and test again

### Redirect works but credits not updated?
- Check webhook is properly configured and receiving events
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check server logs for webhook errors
- Ensure product metadata includes `credits` field

### URL encoding issues?
The code handles locale encoding automatically. If you encounter issues, try:
```
https://sentenly.com/en/translate?payment=success
```
as a fallback.

## Environment Variables
Ensure you have:
```env
NEXT_PUBLIC_APP_URL=https://sentenly.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_1T2t1MCsI7lZbzVFlpHwwOj0
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Additional Resources
- [Stripe Pricing Tables Documentation](https://stripe.com/docs/payments/checkout/pricing-table)
- [Stripe Checkout Redirect](https://stripe.com/docs/payments/checkout/custom-success-page)
