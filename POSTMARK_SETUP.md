# Postmark Email Integration for noreply@sentenly.com

**Goal**: Get **instant email delivery** (< 10 seconds) with your `noreply@sentenly.com` address instead of 6+ hour delays from Firebase.

## Why Postmark?

Postmark is purpose-built for transactional emails with:
- ✅ **Lightning-fast delivery** (< 10 seconds, fastest in industry)
- ✅ **99.9% deliverability** rate
- ✅ **Free tier**: 100 emails/month
- ✅ **Simple setup**: Easier than SendGrid
- ✅ **No daily limits** - monthly quota
- ✅ **Best-in-class email infrastructure**
- ✅ **Excellent documentation and support**

## What's Been Done ✅

1. ✅ Installed `postmark` package
2. ✅ Created API route at `/api/send-verification-email`
3. ✅ Updated all client code to use the new API
4. ✅ Added professional email template
5. ✅ Code is ready - just needs Postmark credentials!

## Your Next Steps (10 minutes)

### Step 1: Create Postmark Account (2 min)

1. Go to [Postmark](https://postmarkapp.com/)
2. Click **"Start Free Trial"** (no credit card required)
3. Sign up with your email
4. Verify your email address

### Step 2: Create a Server (1 min)

1. After signup, Postmark will create a default server
2. Or go to **Servers** tab and click **"Create Server"**
3. Name it: `ProTranslate Production` (or whatever you prefer)
4. Click **"Create Server"**

### Step 3: Get Your Server API Token (1 min)

1. Click on your server name
2. Go to **API Tokens** tab
3. You'll see a **"Default Server API Token"**
4. Click **"Copy"** to copy the token
   - It looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
5. **Save this token** - you'll add it to `.env.local`

### Step 4: Add Sender Signature (sentenly.com) (3 min)

Postmark requires you to verify the email address or domain you're sending from.

#### Option A: Verify Domain (sentenly.com) - Recommended

1. Go to **Sender Signatures** tab
2. Click **"Add Domain"**
3. Enter your domain: `sentenly.com`
4. Click **"Verify Domain"**
5. Postmark will show you **DNS records** to add:

```
Type: TXT
Host: @
Value: postmark-domain-verification=xxxxx...

Type: CNAME  
Host: pm._domainkey
Value: pm._domainkey.postmarkapp.com
```

6. **Add these DNS records** to sentenly.com (wherever your DNS is hosted)
   - Keep your existing Firebase DNS records - just ADD these
   - DKIM record improves deliverability

7. Back in Postmark, click **"Verify"**
   - DNS can take up to 48 hours (usually < 30 minutes)
   - You'll get an email when verified
   - You can check status anytime in Sender Signatures

8. Once verified, you can send from **any email** on sentenly.com (including `noreply@sentenly.com`)

#### Option B: Quick Test with Single Email (1 min)

For testing before domain verification:

1. Go to **Sender Signatures** tab
2. Click **"Add Sender Signature"**
3. Enter an email you can access (your personal email)
4. Click "Send Verification Email  "
5. Check your email and click the verification link
6. Use this email in `POSTMARK_FROM_EMAIL` temporarily

### Step 5: Add Environment Variables (1 min)

Add these to your `.env.local` file:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Postmark Configuration - noreply@sentenly.com
POSTMARK_SERVER_TOKEN=your-postmark-token-from-step-3
POSTMARK_FROM_EMAIL=noreply@sentenly.com
```

**Replace**:
- `your-postmark-token-from-step-3` with your actual Server API Token

**Note**: Once sentenly.com domain is verified (Step 4A), emails will send from `noreply@sentenly.com`

### Step 6: Restart Development Server (1 min)

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 7: Test It! (1 min)

1. Sign up with a **new email address**
2. Check browser console for:
   ```
   [Postmark] ✅ Verification email sent instantly to: user@example.com
   [Postmark] Message ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   [Translate] 🚀 Delivery time: Instant (< 10 seconds)
   ```
3. Check your inbox - **email should arrive within 10 seconds!** ⚡
4. Click the verification link
5. Verify you're redirected to `/translate` and status updates

## Troubleshooting

### ❌ Error: "You are trying to send from an address that is not a valid Sender Signature"

**Reason**: Domain or email not verified yet.

**Solution**:
1. Check Postmark → **Sender Signatures**
2. Ensure sentenly.com shows "Verified ✓" status
3. If still pending: DNS records not propagated yet (wait up to 48 hours, usually < 1 hour)
4. **Temporary workaround**: Use a verified email address (Step 4B) for testing

### ❌ Error: "API key is invalid"

**Solution**:
1. Check `POSTMARK_SERVER_TOKEN` in `.env.local`
2. Ensure it's the **Server API Token**, not Account API Token
3. Regenerate token in Postmark dashboard if needed

### ⚠️ Emails still delayed

**Check**:
1. Browser console - does it say "Postmark" or "Firebase"?
   - If "Firebase": Environment variables not loaded
   - Solution: Restart dev server after adding `.env.local`
2. Check `.env.local` file exists and has correct values
3. Verify `POSTMARK_SERVER_TOKEN` and `POSTMARK_FROM_EMAIL` are set

### 🔍 How to verify DNS records are added:

```bash
# Check your domain verification
nslookup -type=TXT sentenly.com

# Check DKIM record
nslookup -type=CNAME pm._domainkey.sentenly.com
```

If they return Postmark values, DNS is configured correctly!

## What Happens Now?

### Before (Firebase):
- ❌ 6+ hour delays
- ❌ Emails arrive in batches
- ❌ Unreliable delivery
- ❌ No analytics

### After (Postmark):
- ✅ < 10 second delivery (fastest in industry)
- ✅ One email at a time, instant
- ✅ 99.9% delivery rate  
- ✅ Professional delivery tracking
- ✅ Bounce handling
- ✅ Email analytics (opens, clicks, bounces)
- ✅ Professional branded emails from `noreply@sentenly.com`

## Monitoring Email Delivery

1. Go to Postmark Dashboard → **Activity**
2. See real-time status for each email:
   - 📧 **Sent**: Delivered to recipient's server
   - ✅ **Delivered**: Confirmed delivery
   - 📬 **Opened**: User opened email (if tracking enabled)
   - 🔗 **Clicked**: User clicked link
   - ⚠️ **Bounced**: Invalid/non-existent email
   - 🚫 **Spam Complaint**: Marked as spam

## Postmark vs SendGrid

| Feature | Postmark | SendGrid |
|---------|----------|----------|
| **Setup Time** | 10 min | 15 min |
| **Delivery Speed** | < 10 seconds | < 30 seconds |
| **Free Tier** | 100/month | 100/day |
| **Focus** | Transactional only | Marketing + Transactional |
| **Deliverability** | 99.9% | 99.95% |
| **Ease of Use** | Simpler | More complex |
| **Best For** | App emails | Marketing campaigns |

**Recommendation**: Postmark is perfect for transactional emails like verification emails.

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Add environment variables to your hosting platform:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   POSTMARK_SERVER_TOKEN=your-production-token
   POSTMARK_FROM_EMAIL=noreply@sentenly.com
   ```

2. Ensure domain (sentenly.com) is verified in Postmark

3. Test with a real email before launching

4. **Optional**: Create separate servers for dev/staging/production in Postmark

## Advanced Features

### Enable Open/Click Tracking

In Postmark Dashboard → Server → **Settings**:
- Enable **Open Tracking** to see when users open emails
- Enable **Link Tracking** to track link clicks

### Custom Email Templates

Postmark has a powerful template system:
1. Go to **Templates** tab
2. Create reusable email templates with variables
3. Use template alias instead of HTML in API calls

### Webhook Integration

Get real-time notifications for bounces, opens, clicks:
1. Go to **Webhooks** tab
2. Add a webhook URL
3. Receive POST notifications for all events

## Cost

- **Free tier**: 100 emails/month - Perfect for MVP testing
- **Starter**: $15/month for 10,000 emails ($0.0015 per email)
- **Growth**: Volume discounts available
- **No credit card required** for free tier

### Comparison:
- **Firebase**: FREE but 6+ hour delays ❌
- **Postmark Free**: FREE with instant delivery ✅ (best for starting)
- **Postmark Paid**: Super cheap at scale ($0.0015 per email)

## Support

- **Postmark Docs**: https://postmarkapp.com/developer
- **Domain Verification**: https://postmarkapp.com/support/article/1046-how-do-i-verify-a-domain
- **API Reference**: https://postmarkapp.com/developer/api/overview
- **Support**: https://postmarkapp.com/contact (Excellent support team!)

---

## Summary

**Status**: ✅ Code is ready!  
**What you need**: Postmark Server Token + Domain verification (10 min)  
**Result**: Instant email delivery with your `noreply@sentenly.com` address  
**Current behavior without setup**: Falls back to Firebase (will see warning in console)

Follow Steps 1-7 above and you're done! 🚀

---

## Quick Command Reference

```bash
# Install (already done)
npm install postmark

# Restart dev server
npm run dev

# Check DNS propagation
nslookup -type=TXT sentenly.com
nslookup -type=CNAME pm._domainkey.sentenly.com

# View API logs
# Check browser console for [Postmark] messages
```

**Pro Tip**: Postmark's free tier (100 emails/month) is perfect for development and early-stage apps. As you grow, their pricing is very competitive and transparent.
