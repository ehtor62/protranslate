# SendGrid Email Integration Guide

## Why SendGrid?

Firebase's default email service has **severe delivery delays** (6+ hours). SendGrid provides:
- ✅ **Instant delivery** (< 30 seconds)
- ✅ **99.95% delivery rate**
- ✅ **Free tier**: 100 emails/day
- ✅ **Email analytics** (opens, clicks, bounces)
- ✅ **Professional email templates**

## Quick Setup (15 minutes)

### Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click "Start Free" (no credit card required)
3. Verify your email address
4. Complete the setup wizard

### Step 2: Create and Configure API Key

1. Navigate to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Settings:
   - Name: `protranslate-verification`
   - API Key Permissions: **"Restricted Access"**
   - Enable only: **Mail Send** → **Full Access**
4. Click **"Create & View"**
5. **Copy the API key immediately** (you won't see it again!)

### Step 3: Verify Sender Email

**CRITICAL**: SendGrid only sends from verified email addresses.

#### Option A: Single Sender Verification (Quick - for testing)
1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in the form:
   - From Name: `ProTranslate` (or your app name)
   - From Email: Your email (e.g., `your@email.com`)
   - Reply To: Same email
   - Company details (can be personal info for testing)
4. Click **"Create"**
5. **Check your email** and click the verification link
6. Wait for "Verified" status in dashboard

#### Option B: Domain Authentication (Production - Best deliverability)
1. Go to **Settings** → **Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Select your DNS provider (e.g., Cloudflare, GoDaddy, etc.)
4. Add the provided DNS records to your domain:
   - CNAME records for DKIM
   - SPF record
5. Wait for verification (can take up to 48 hours)
6. Once verified, you can send from any email on your domain

### Step 4: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

### Step 5: Add Environment Variables

Add to `.env.local`:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-from-step-2
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FROM_NAME=ProTranslate
```

**Important**: 
- `SENDGRID_FROM_EMAIL` MUST match the verified email from Step 3
- Never commit `.env.local` to git (already in `.gitignore`)

### Step 6: Create SendGrid Email API Route

The API route is already created at `app/api/send-verification-email/route.ts`.

Update it to use SendGrid:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { auth as adminAuth } from '@/lib/firebase-admin';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!decodedToken.email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Generate custom verification link via Firebase Admin
    const verificationLink = await adminAuth.generateEmailVerificationLink(
      decodedToken.email,
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/translate`,
      }
    );

    // Send email via SendGrid (instant delivery!)
    const msg = {
      to: decodedToken.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME || 'ProTranslate',
      },
      subject: 'Verify your email address',
      text: `Please verify your email address by clicking this link: ${verificationLink}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              padding: 0;
              background-color: white;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .button { 
              display: inline-block; 
              padding: 14px 32px; 
              background-color: #4F46E5; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0;
              font-weight: 600;
              font-size: 16px;
            }
            .button:hover {
              background-color: #4338CA;
            }
            .link-box {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              word-break: break-all;
              font-size: 12px;
              color: #666;
            }
            .footer { 
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              font-size: 13px; 
              color: #666;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ ProTranslate</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Verify Your Email Address</h2>
              <p>Thank you for signing up! Please verify your email address to unlock all features and start translating.</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <div class="link-box">${verificationLink}</div>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Why verify?</strong><br>
                Email verification helps protect your account and ensures you can receive important updates.
              </p>
            </div>
            <div class="footer">
              <p><strong>⏱️ This link expires in 1 hour.</strong></p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2026 ProTranslate. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    console.log('[SendGrid] ✅ Verification email sent instantly to:', decodedToken.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully',
      provider: 'SendGrid'
    });

  } catch (error: any) {
    console.error('[SendGrid] ❌ Error sending verification email:', error);
    
    // SendGrid-specific error handling
    if (error.response) {
      console.error('[SendGrid] Response:', error.response.body);
    }
    
    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error.message 
    }, { status: 500 });
  }
}
```

### Step 7: Update Client Code

Now update the client-side code to call your new API instead of Firebase's `sendEmailVerification`.

#### Update: `src/contexts/AuthContext.tsx`

Find the `linkAnonymousAccount` function (around line 133) and replace the verification email logic:

```typescript
// Send verification email via SendGrid API (instant delivery!)
if (auth.currentUser) {
  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send email');
    }

    const result = await response.json();
    console.log('[AuthContext] ✅ Verification email sent via SendGrid');
    console.log('[AuthContext] Email sent to:', auth.currentUser.email);
  } catch (error: any) {
    console.error('[AuthContext] ❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
}
```

#### Update: `src/components/AuthModal.tsx`

Find the signup handler (around line 96) and replace:

```typescript
// Send verification email via SendGrid
try {
  const actionCodeSettings = {
    url: `${window.location.origin}/translate`,
    handleCodeInApp: false,
  };
  console.log('[AuthModal] 📧 Sending verification email via SendGrid to:', email);
  
  const idToken = await userCredential.user.getIdToken();
  const response = await fetch('/api/send-verification-email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || 'Failed to send email');
  }
  
  console.log('[AuthModal] ✅ Verification email sent via SendGrid');
} catch (emailError: any) {
  console.error('[AuthModal] ❌ Error sending verification email:', emailError);
  throw new Error('Account created but failed to send verification email. Please use "Resend Email" button.');
}
```

#### Update: `app/[locale]/translate/page.tsx`

Find the `handleResendVerification` function (around line 262) and replace:

```typescript
const handleResendVerification = async () => {
  if (!auth.currentUser || resendingVerification) return;
  
  // Rate limit: 60 seconds between resends
  const now = Date.now();
  const timeSinceLastResend = now - lastResendTime;
  const minInterval = 60000;
  
  if (timeSinceLastResend < minInterval) {
    const remainingSeconds = Math.ceil((minInterval - timeSinceLastResend) / 1000);
    toast.error(`Please wait ${remainingSeconds} seconds before resending.`);
    return;
  }
  
  setResendingVerification(true);
  try {
    console.log('[Translate] 📧 Sending verification email via SendGrid...');
    console.log('[Translate] Email:', auth.currentUser.email);
    
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send email');
    }
    
    console.log('[Translate] ✅ Verification email sent via SendGrid (instant delivery!)');
    setLastResendTime(now);
    toast.success('Verification email sent! Check your inbox.');
  } catch (error: any) {
    console.error('[Translate] ❌ Error sending verification email:', error);
    toast.error(`Failed to send verification email: ${error.message}`);
  } finally {
    setResendingVerification(false);
  }
};
```

### Step 8: Test the Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Sign up with a new email address**

3. **Check browser console** for:
   ```
   [SendGrid] ✅ Verification email sent instantly to: user@example.com
   ```

4. **Check your inbox** - email should arrive within **30 seconds**

5. **Click the verification link**

6. **Verify it redirects** to `/translate` and user is verified

### Step 9: Monitor Email Delivery

1. Go to SendGrid Dashboard → **Activity**
2. View real-time email delivery status:
   - ✅ **Delivered**: Email successfully delivered
   - 📧 **Processed**: Email sent from SendGrid
   - ⚠️ **Bounced**: Invalid email address
   - ⛔ **Blocked**: Spam filters blocked it

## Troubleshooting

### Error: "The from address does not match a verified Sender Identity"

**Solution**: Your `SENDGRID_FROM_EMAIL` must exactly match the email verified in Step 3.

1. Check SendGrid Dashboard → Settings → Sender Authentication
2. Ensure email shows "Verified" status
3. Update `.env.local` with the exact verified email
4. Restart dev server

### Error: "Unauthorized"

**Solution**: Check your API key.

1. Verify `SENDGRID_API_KEY` in `.env.local` starts with `SG.`
2. Ensure API key has "Mail Send" permission
3. Regenerate API key if needed (old one will be invalidated)

### Emails still going to spam

**Solution**: Set up domain authentication (Step 3, Option B).

- Single sender verification has lower trust score
- Domain authentication adds DKIM/SPF records
- Results in 99%+ inbox delivery rate

### Rate limit: 100 emails/day exceeded

**Solution**: Upgrade SendGrid plan or optimize:

- Free tier: 100 emails/day
- Essentials: $19.95/month for 50k emails
- For testing: Use different email addresses or wait 24 hours

## Production Deployment

### Environment Variables

Add these to your production environment (Vercel, Railway, etc.):

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SENDGRID_API_KEY=SG.your-production-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=ProTranslate
```

### Domain Authentication (Recommended)

1. Set up domain authentication in SendGrid (see Step 3, Option B)
2. Update `SENDGRID_FROM_EMAIL` to use your domain
3. Add DNS records to your domain provider
4. Wait for verification (up to 48 hours)

### Benefits:
- ✅ Professional sender address (`noreply@yourdomain.com`)
- ✅ Better deliverability (99%+ inbox rate)
- ✅ Higher trust score
- ✅ Brand consistency

## Cost Analysis

### SendGrid Pricing:
- **Free**: 100 emails/day = 3,000 emails/month - Sufficient for early-stage apps
- **Essentials**: $19.95/month for 50,000 emails - Good for growing apps
- **Pro**: $89.95/month for 100,000 emails - For established apps

### Comparison:
- **Firebase default**: FREE but 6+ hour delays ❌
- **SendGrid free**: FREE with instant delivery ✅
- **AWS SES**: $0.10/1000 emails (cheaper at scale but requires complex setup)

## Next Steps

1. ✅ Complete setup (Steps 1-8)
2. ✅ Test with multiple email providers (Gmail, Outlook, Yahoo)
3. ✅ Verify emails arrive within 30 seconds
4. ✅ Check spam folder (should be in inbox)
5. ✅ Monitor SendGrid activity dashboard
6. 🚀 Deploy to production with domain authentication

## Support

- SendGrid Docs: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com/
- Node.js Library: https://github.com/sendgrid/sendgrid-nodejs
