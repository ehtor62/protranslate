# SendGrid Setup for noreply@sentenly.com

**Goal**: Keep your `noreply@sentenly.com` email address but get **instant delivery** (< 30 seconds) instead of 6+ hour delays.

## What's Been Done ✅

1. ✅ Installed `@sendgrid/mail` package
2. ✅ Created API route at `/api/send-verification-email`
3. ✅ Updated all client code to use the new API
4. ✅ Added professional email template
5. ✅ Code is ready - just needs SendGrid credentials!

## Your Next Steps (15 minutes)

### Step 1: Create SendGrid Account (3 min)

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click **"Start Free"** (no credit card required)
3. Sign up with your email
4. Verify your email address
5. Complete the onboarding wizard

### Step 2: Create API Key (2 min)

1. In SendGrid Dashboard, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Settings:
   - **Name**: `protranslate-verification`
   - **API Key Permissions**: Select **"Restricted Access"**
   - Scroll down and enable ONLY: **Mail Send** → **Full Access**
4. Click **"Create & View"**
5. **⚠️ IMPORTANT**: Copy the API key NOW (starts with `SG.`)
   - You'll never see it again!
   - Save it somewhere safe temporarily

### Step 3: Authenticate Your Domain (sentenly.com) (5 min)

This allows you to send from `noreply@sentenly.com`:

1. In SendGrid Dashboard, go to **Settings** → **Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. **Domain Host**: Select your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.)
4. **Brand your domain**: Enter `sentenly.com`
5. Click **"Next"**
6. SendGrid will show you **3 DNS records** to add:
   - 2 CNAME records (for DKIM)
   - 1 TXT record (might be optional)

**Example DNS records you'll see**:
```
Type: CNAME
Host: s1._domainkey
Value: s1.domainkey.u12345.wl.sendgrid.net

Type: CNAME
Host: s2._domainkey
Value: s2.domainkey.u12345.wl.sendgrid.net
```

7. **Add these records to your DNS** (wherever sentenly.com DNS is hosted)
   - Keep the SendGrid tab open
   - Go to your DNS provider
   - Add the records exactly as shown
   - **IMPORTANT**: Keep your existing Firebase DNS records - just ADD these new ones

8. Back in SendGrid, click **"Verify"**
   - If it works immediately: Great! ✅
   - If not: DNS can take up to 48 hours (usually < 1 hour)
   - You can come back and click "Verify" again later

### Step 4: Add Environment Variables (1 min)

Add these to your `.env.local` file:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid Configuration - noreply@sentenly.com
SENDGRID_API_KEY=SG.your-api-key-from-step-2-here
SENDGRID_FROM_EMAIL=noreply@sentenly.com
SENDGRID_FROM_NAME=ProTranslate
```

**Replace**:
- `SG.your-api-key-from-step-2-here` with your actual API key from Step 2

### Step 5: Restart Development Server (1 min)

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 6: Test It! (2 min)

1. Sign up with a **new email address** (or use an incognito window)
2. Check browser console for:
   ```
   [SendGrid] ✅ Verification email sent instantly to: user@example.com
   [Translate] 🚀 Delivery time: Instant (< 30 seconds)
   ```
3. Check your inbox - **email should arrive within 30 seconds!** ⚡
4. Click the verification link
5. Verify you're redirected to `/translate` and status updates

## Troubleshooting

### ❌ Error: "The from address does not match a verified Sender Identity"

**Reason**: Domain authentication (Step 3) not complete yet.

**Solution**:
1. Check SendGrid → Settings → Sender Authentication
2. Wait for DNS verification to complete (can take up to 48 hours, usually < 1 hour)
3. Click "Verify" button again
4. Once you see "Verified ✅" status, it will work

**Quick workaround for testing**:
1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"** (separate from domain auth)
3. Enter any email you can access
4. Verify that email
5. Use that email in `SENDGRID_FROM_EMAIL` temporarily
6. Once domain is verified, switch back to `noreply@sentenly.com`

### ❌ Error: "Unauthorized" or "403 Forbidden"

**Solution**: Check your API key:
1. Verify it starts with `SG.`
2. Ensure it has "Mail Send" permission enabled
3. Try generating a new API key (old one will be invalidated)

### ⚠️ Emails still delayed

**Check**:
1. Browser console - does it say "SendGrid" or "Firebase"?
   - If "Firebase": Environment variables not loaded
   - Solution: Restart dev server after adding `.env.local`
2. Check `.env.local` file exists and has correct values
3. Verify `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set

### 🔍 How to verify DNS records are added:

```bash
# Check your DKIM records
nslookup -type=CNAME s1._domainkey.sentenly.com
nslookup -type=CNAME s2._domainkey.sentenly.com
```

If they return SendGrid values, DNS is configured correctly!

## What Happens Now?

### Before (Firebase):
- ❌ 6+ hour delays
- ❌ Emails arrive in batches
- ❌ Unreliable delivery
- ❌ No analytics

### After (SendGrid):
- ✅ < 30 second delivery
- ✅ One email at a time, instant
- ✅ 99.95% delivery rate
- ✅ Email analytics (opens, clicks, bounces)
- ✅ Professional branded emails from `noreply@sentenly.com`

## Monitoring Email Delivery

1. Go to SendGrid Dashboard → **Activity**
2. See real-time status:
   - 📧 **Processed**: Sent from SendGrid
   - ✅ **Delivered**: Reached inbox
   - 📬 **Opened**: User opened email (if tracking enabled)
   - 🔗 **Clicked**: User clicked link
   - ⚠️ **Bounced**: Invalid email
   - ⛔ **Blocked**: Spam filter

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Add environment variables to your hosting platform:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   SENDGRID_API_KEY=SG.your-production-key
   SENDGRID_FROM_EMAIL=noreply@sentenly.com
   SENDGRID_FROM_NAME=ProTranslate
   ```

2. Ensure domain authentication is complete (Step 3)

3. Test with a real email before launching

## Cost

- **Free tier**: 100 emails/day (3,000/month) - Sufficient for most apps
- **Essentials**: $19.95/month for 50,000 emails - For growing apps
- **No credit card required** for free tier

## Support

- SendGrid Docs: https://docs.sendgrid.com/
- Domain Authentication Guide: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication
- Need help? Check `SENDGRID_SETUP.md` for detailed docs

---

## Summary

**Status**: ✅ Code is ready!  
**What you need**: SendGrid API key + Domain authentication (15 min)  
**Result**: Instant email delivery with your `noreply@sentenly.com` address  
**Current behavior without setup**: Falls back to Firebase (will see warning in console)

Follow Steps 1-6 above and you're done! 🚀
