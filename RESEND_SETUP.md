# Resend Email Integration for noreply@sentenly.com

**Goal**: Get **instant email delivery** (< 10 seconds) with your `noreply@sentenly.com` address instead of 6+ hour delays from Firebase.

## Why Resend?

Resend is the **best choice** for modern Next.js apps with:
- ✅ **Lightning-fast delivery** (< 10 seconds)
- ✅ **99.9% deliverability rate**
- ✅ **Huge free tier**: 3,000 emails/month (30x more than competitors!)
- ✅ **Simplest setup**: 5 minutes total
- ✅ **React Email support**: Write emails as React components
- ✅ **Built for developers**: Best-in-class DX
- ✅ **Popular in Next.js community**: Excellent documentation
- ✅ **No daily limits**: All monthly

## What's Been Done ✅

1. ✅ Installed `resend` package
2. ✅ Created API route at `/api/send-verification-email`
3. ✅ Updated all client code to use the new API
4. ✅ Added professional email template
5. ✅ Code is ready - just needs Resend credentials!

## Your Next Steps (5 minutes)

### Step 1: Create Resend Account (1 min)

1. Go to [Resend.com](https://resend.com/)
2. Click **"Start Free"** (no credit card required)
3. Sign up with your email or GitHub
4. Verify your email address

### Step 2: Get Your API Key (1 min)

1. After signup, you'll be on the dashboard
2. Go to **API Keys** tab (or visit https://resend.com/api-keys)
3. Click **"Create API Key"**
4. Settings:
   - **Name**: `ProTranslate Production`
   - **Permission**: `Sending access` (default)
   - **Domain**: Select "All domains" or specific domain after Step 3
5. Click **"Add"**
6. **Copy the API key** (starts with `re_`)
   - You'll only see it once!
   - Save it somewhere safe temporarily

### Step 3: Add Domain (sentenly.com) (2 min)

Resend requires you to verify the domain you're sending from.

1. Go to **Domains** tab (or visit https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain: `sentenly.com`
4. Click **"Add"**
5. Resend will show you **3 DNS records** to add:

```
Type: TXT
Name: @ (or blank)
Value: resend-domain-verification=xxxxx...

Type: MX
Name: @ (or blank)
Priority: 10
Value: feedback-smtp.resend.com

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; pct=100; rua=mailto:dmarc@sentenly.com
```

**Optional but highly recommended (for best deliverability):**
```
Type: TXT
Name: @ (or blank)
Value: v=spf1 include:amazonses.com include:_spf.resend.com ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

6. **Add these DNS records** to sentenly.com (wherever your DNS is hosted)
   - Keep your existing Firebase/Postmark DNS records - just ADD these
   - The more records you add, the better your deliverability

7. Back in Resend, click **"Verify DNS Records"**
   - DNS can take up to 48 hours (usually < 15 minutes)
   - Resend will auto-verify every few minutes
   - You'll get an email when verified
   - Status shows in Domains tab

8. Once verified, you can send from **any email** on sentenly.com (including `noreply@sentenly.com`)

#### Quick Test Before Domain Verification (Optional)

You can test immediately with Resend's onboarding email:
- Use: `onboarding@resend.dev` as the sender (temporarily)
- This works instantly without domain verification
- Switch to `noreply@sentenly.com` after domain is verified

### Step 4: Add Environment Variables (30 seconds)

Add these to your `.env.local` file:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend Configuration - noreply@sentenly.com
RESEND_API_KEY=re_your-api-key-from-step-2
RESEND_FROM_EMAIL=noreply@sentenly.com
```

**Replace**:
- `re_your-api-key-from-step-2` with your actual API key

**For immediate testing** (before domain verification):
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**After domain is verified**:
```bash
RESEND_FROM_EMAIL=noreply@sentenly.com
```

### Step 5: Restart Development Server (30 seconds)

```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

### Step 6: Test It! (1 min)

1. Sign up with a **new email address**
2. Check browser console for:
   ```
   [Resend] ✅ Verification email sent instantly to: user@example.com
   [Resend] Email ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   [Translate] 🚀 Delivery time: Instant (< 10 seconds)
   ```
3. Check your inbox - **email should arrive within 10 seconds!** ⚡
4. Click the verification link
5. Verify you're redirected to `/translate` and status updates

## Troubleshooting

### ❌ Error: "Domain not verified"

**Reason**: sentenly.com domain not verified yet.

**Solution**:
1. Check Resend → **Domains**
2. Ensure sentenly.com shows "Verified ✓" status
3. If still pending: DNS records not propagated yet (wait up to 48 hours, usually < 15 minutes)
4. Click **"Verify DNS Records"** button to check again

**Quick workaround for testing**:
1. Use `RESEND_FROM_EMAIL=onboarding@resend.dev` temporarily
2. This works instantly without verification
3. Switch to `noreply@sentenly.com` after domain is verified

### ❌ Error: "Invalid API key" or "Unauthorized"

**Solution**:
1. Check `RESEND_API_KEY` in `.env.local`
2. Ensure it starts with `re_`
3. Make sure you copied the full key
4. Regenerate API key in Resend dashboard if needed (old one will be invalidated)

### ⚠️ Emails still delayed

**Check**:
1. Browser console - does it say "Resend" or "Firebase"?
   - If "Firebase": Environment variables not loaded
   - Solution: Restart dev server after adding `.env.local`
2. Check `.env.local` file exists in project root
3. Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set correctly
4. No spaces around the `=` sign

### 🔍 How to verify DNS records are added:

```bash
# Check your domain verification
nslookup -type=TXT sentenly.com

# Check SPF record
nslookup -type=TXT sentenly.com | grep "v=spf1"

# Check DKIM record
nslookup -type=CNAME resend._domainkey.sentenly.com

# Check MX record
nslookup -type=MX sentenly.com
```

If they return Resend values, DNS is configured correctly!

### 📧 Emails going to spam?

**Solution**: Add all optional DNS records (SPF, DKIM, DMARC)
- These verify your domain and improve deliverability
- With all records: 99%+ inbox delivery rate
- Takes 5 extra minutes but worth it for production

## What Happens Now?

### Before (Firebase):
- ❌ 6+ hour delays
- ❌ Emails arrive in batches
- ❌ Unreliable delivery
- ❌ No analytics
- ❌ Poor user experience

### After (Resend):
- ✅ < 10 second delivery
- ✅ One email at a time, instant
- ✅ 99.9% delivery rate  
- ✅ Beautiful delivery dashboard
- ✅ Bounce/complaint handling
- ✅ Open/click tracking (optional)
- ✅ Professional branded emails from `noreply@sentenly.com`
- ✅ 3,000 free emails/month

## Monitoring Email Delivery

### Dashboard (https://resend.com/emails)

1. See **every email** sent in real-time:
   - 📧 **Sent**: Email delivered
   - ✅ **Delivered**: Confirmed receipt
   - 📬 **Opened**: User opened email (if tracking enabled)
   - 🔗 **Clicked**: User clicked link (if tracking enabled)
   - ⚠️ **Bounced**: Invalid/non-existent email
   - 🚫 **Complained**: Marked as spam

2. Click on any email to see:
   - Full email content
   - Delivery timeline
   - Recipient actions
   - Error details (if any)

### API Access

You can also query emails programmatically:
```typescript
const email = await resend.emails.get('email_id');
```

## Advanced Features

### Enable Open/Click Tracking

In your API call, add tracking options:
```typescript
await resend.emails.send({
  from: 'noreply@sentenly.com',
  to: 'user@example.com',
  subject: 'Verify your email',
  html: '...',
  tags: [
    { name: 'category', value: 'email-verification' }
  ],
});
```

### React Email (Optional - Recommended for Complex Emails)

Instead of HTML strings, write emails as React components:

1. Install React Email:
   ```bash
   npm install @react-email/components
   ```

2. Create email component:
   ```tsx
   import { Html, Button, Text } from '@react-email/components';
   
   export default function VerificationEmail({ verificationLink }) {
     return (
       <Html>
         <Text>Verify your email address</Text>
         <Button href={verificationLink}>Verify Email</Button>
       </Html>
     );
   }
   ```

3. Use in API:
   ```typescript
   import { render } from '@react-email/components';
   import VerificationEmail from './emails/verification';
   
   const html = render(VerificationEmail({ verificationLink }));
   await resend.emails.send({ html });
   ```

### Webhooks (Real-time Events)

Get instant notifications for all email events:

1. Go to **Webhooks** tab
2. Add your webhook URL
3. Receive POST requests for:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.opened`
   - `email.clicked`

Example: Update Firestore when user opens verification email

### Email Templates (Reusable)

Create reusable templates in Resend dashboard:
1. Go to **Templates** tab
2. Create template with variables
3. Use template ID in API calls
4. Update design without code changes

## Cost Comparison

| Tier | Resend | Postmark | SendGrid |
|------|--------|----------|----------|
| **Free** | **3,000/month** | 100/month | 100/day |
| **Paid** | $20/50k emails | $15/10k emails | $20/50k emails |
| **Scale** | $100/500k | $95/100k | $90/300k |

**Best Value**: Resend's free tier is 30x more generous than competitors!

### When to Upgrade:
- **5-10 users/day**: Free tier sufficient (150-300 emails/month)
- **50+ users/day**: Stay on free tier! (1,500 emails/month)
- **100+ users/day**: Paid plan at 3,000+ emails/month

## Production Deployment

When deploying to production (Vercel, Railway, Netlify, etc.):

1. Add environment variables to your hosting platform:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   RESEND_API_KEY=re_your-production-key
   RESEND_FROM_EMAIL=noreply@sentenly.com
   ```

2. Ensure domain (sentenly.com) is verified in Resend

3. Test with a real email before launching

4. **Optional**: Create separate API keys for dev/staging/production

### Vercel Deployment

```bash
# Add to Vercel project settings
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL
```

## Why Resend is Perfect for Your App

1. **Next.js Native**: Built by the Vercel ecosystem, perfect integration
2. **React Components**: Write emails like your app UI
3. **Generous Free Tier**: 3,000 emails = 100 signups/day on free tier
4. **Modern DX**: Best developer experience in the industry
5. **Fast Delivery**: < 10 seconds, same as Postmark
6. **Great Support**: Active community, excellent docs

## Support & Resources

- **Resend Docs**: https://resend.com/docs
- **Domain Verification**: https://resend.com/docs/dashboard/domains/introduction
- **API Reference**: https://resend.com/docs/api-reference/introduction
- **React Email**: https://react.email/
- **Community**: https://resend.com/discord

---

## Summary

**Status**: ✅ Code is ready!  
**What you need**: Resend API Key + Domain verification (5 min)  
**Result**: Instant email delivery with your `noreply@sentenly.com` address  
**Free tier**: 3,000 emails/month (excellent for most apps!)  
**Current behavior without setup**: Falls back to Firebase (will see warning in console)

Follow Steps 1-6 above and you're done! 🚀

---

## Quick Command Reference

```bash
# Install (already done)
npm install resend

# Restart dev server
npm run dev

# Check DNS propagation
nslookup -type=TXT sentenly.com
nslookup -type=CNAME resend._domainkey.sentenly.com
nslookup -type=MX sentenly.com

# View API logs
# Check browser console for [Resend] messages
```

**Pro Tip**: Start with `onboarding@resend.dev` for immediate testing, then switch to `noreply@sentenly.com` once your domain is verified. This way you can test the full flow while DNS propagates!
