# Firebase Email Verification Setup Guide

## Current Issue (February 2026)
**Verification emails are being delayed by 6+ hours** due to Firebase's default email service limitations. The emails are being sent successfully from the client side, but Firebase's free email service has significant latency issues.

## What Was Fixed (Code Changes)

### 1. Added Action Code Settings
All `sendEmailVerification()` calls now include proper configuration:
```typescript
const actionCodeSettings = {
  url: `${window.location.origin}/translate`,
  handleCodeInApp: false,
};
await sendEmailVerification(user, actionCodeSettings);
```

### 2. Improved Error Handling
- Added detailed console logging to track email sending
- Better error messages to users
- Errors now show specific failure reasons

## Required Firebase Console Configuration

### Step 1: Verify Email Templates Are Enabled
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **protranslate-89464**
3. Navigate to **Authentication** → **Templates** (left sidebar)
4. Click on **Email verification** template
5. Ensure:
   - Template is **enabled**
   - "From name" is set (e.g., "ProTranslate" or your app name)
   - "Reply-to email" is configured with a valid email

### Step 2: Authorize Your Domain
1. In Firebase Console → **Authentication** → **Settings**
2. Click on **Authorized domains** tab
3. Ensure your domain is added:
   - For development: `localhost` (should be there by default)
   - For production: Add your actual domain (e.g., `protranslate.com`)

### Step 3: Configure Email Action Handler URL
1. In Firebase Console → **Authentication** → **Settings**
2. Scroll to **Email action handler**
3. Ensure the URL points to your app:
   - Development: `http://localhost:3000/__/auth/action`
   - Production: `https://yourdomain.com/__/auth/action`

### Step 4: Check SMTP Settings (If Using Custom SMTP)
If you've configured custom SMTP:
1. Go to **Project Settings** → **Cloud Messaging**
2. Verify SMTP credentials are correct
3. Check if your SMTP service is working

**Note**: Firebase uses its own email service by default. Custom SMTP is optional.

## Testing Steps

### 1. Test Email Sending
1. Sign up with a new email address
2. Check browser console for: `[AuthModal] Verification email sent successfully to: [email]`
3. If you see an error, it will be logged with details

### 2. Check Email Delivery
- **Gmail**: Check both Inbox and Spam/Promotions folders
- **Outlook/Hotmail**: Check Junk folder
- **Custom domain**: Check server logs if self-hosted

### 3. Try the "Resend Email" Button
The resend function now has better error reporting. Click it and check:
- Browser console for detailed error logs
- Toast notification for user-friendly error message

## ⚠️ CRITICAL: Firebase Default Email Service Delays

**Problem**: Firebase's free email service can delay emails by 6+ hours. This is a known issue with Firebase's default SMTP service.

**Symptoms**:
- Console logs show "✅ Verification email sent successfully"
- No errors in console
- Emails arrive many hours later (or in batches)
- User receives multiple emails at once

**Why This Happens**:
1. **Firebase uses a shared email infrastructure** with no guaranteed delivery time
2. **Rate limiting** across all Firebase projects can cause queuing
3. **No dedicated IP** means poor sender reputation
4. **Limited priority** for free tier users

**Immediate Solutions**:

### Option 1: Quick Fix - Firebase Identity Platform (Paid)
1. Upgrade to **Firebase Identity Platform** (formerly Firebase Auth)
2. In Firebase Console → **Authentication** → **Email** tab
3. Enable **Custom SMTP Server**
4. Configure with a reliable provider (see Option 2)

### Option 2: Use Custom Email Service (Recommended)
Implement a custom email service using one of these providers:

#### A. SendGrid (Recommended - Most Reliable)
- **Free tier**: 100 emails/day
- **Delivery time**: < 1 minute
- **Setup time**: 15 minutes
- See "SendGrid Integration" section below

#### B. Resend (Modern Alternative)
- **Free tier**: 3,000 emails/month
- **Great DX**: React email templates
- **Setup time**: 10 minutes

#### C. AWS SES
- **Very cheap**: $0.10 per 1000 emails
- **Requires AWS account**
- **Setup time**: 30 minutes

### Option 3: Cloud Functions with Custom SMTP
Deploy a Cloud Function that sends emails through a custom SMTP provider. This bypasses Firebase's default service entirely.

## Common Issues & Solutions

### Issue: ⚠️ Emails delayed by hours (Main Issue)
**Solution**: 
- **DO NOT** rely on Firebase default email service for production
- Implement SendGrid or another custom email provider (see below)
- **Temporary workaround**: Warn users that verification may take up to 10 minutes

### Issue: Email goes to spam
**Solution**: 
- Configure verified "Reply-to" email in Firebase Console
- Add SPF/DKIM records if using custom domain
- Use a custom email service with proper domain authentication
- Ask users to check spam folder

### Issue: "auth/too-many-requests"
**Solution**: 
- Firebase rate-limits email sending (to prevent abuse)
- Wait a few minutes and try again
- For testing, use different email addresses
- **Long-term**: Switch to custom email service

### Issue: "auth/invalid-action-code"
**Solution**: 
- Verification links expire after a few hours
- Request a new verification email
- Ensure user hasn't already verified

### Issue: No error but no email received within 10 minutes
**Solution**: 
1. Check spam folder
2. Check Firebase Console → **Authentication** → **Users**
   - Verify user appears in the list
3. **If using default Firebase emails**: This is expected behavior
4. **Solution**: Implement custom email service (see SendGrid section below)

---

## 🚀 SendGrid Integration (Recommended Solution)

This completely bypasses Firebase's email service for instant, reliable delivery.

### Step 1: SendGrid Setup (5 minutes)

1. **Create SendGrid Account**
   - Go to [SendGrid.com](https://sendgrid.com/)
   - Sign up for free account (100 emails/day)
   
2. **Create API Key**
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Name: `protranslate-verification-emails`
   - Permissions: "Restricted Access" → Enable "Mail Send" only
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Email** (Required)
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Enter your email (e.g., `noreply@yourdomain.com` or personal email for testing)
   - Check your email and click verification link
   - **Important**: You can only send from verified emails

### Step 2: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

### Step 3: Add Environment Variable

Add to `.env.local`:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FROM_NAME="ProTranslate"
```

### Step 4: Create Email API Route

Create `app/api/send-verification-email/route.ts`:

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

    // Generate custom verification link
    const verificationLink = await adminAuth.generateEmailVerificationLink(
      decodedToken.email!,
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/translate`,
      }
    );

    // Send email via SendGrid
    const msg = {
      to: decodedToken.email!,
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please verify your email address to start using ProTranslate.</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <div class="footer">
              <p>This link expires in 1 hour.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);

    console.log('[SendGrid] ✅ Verification email sent to:', decodedToken.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error: any) {
    console.error('[SendGrid] ❌ Error sending verification email:', error);
    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error.message 
    }, { status: 500 });
  }
}
```

### Step 5: Update Client Code

Update the verification email sending logic to use the new API:

**In `src/contexts/AuthContext.tsx`** (around line 133):

```typescript
// Send verification email via SendGrid API
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

    console.log('[AuthContext] ✅ Verification email sent via SendGrid');
    console.log('[AuthContext] Email sent to:', auth.currentUser.email);
  } catch (error: any) {
    console.error('[AuthContext] ❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
}
```

Apply similar changes to:
- `src/components/AuthModal.tsx` (around line 96)
- `app/[locale]/translate/page.tsx` (around line 264)

### Step 6: Test SendGrid Integration

1. Sign up with a new email
2. Check console for: `[SendGrid] ✅ Verification email sent`
3. Email should arrive within 30 seconds
4. Click verification link
5. Should redirect to `/translate` page with verified status

### Benefits of SendGrid:
✅ **Instant delivery** (< 30 seconds)
✅ **Reliable delivery** (99.95% delivery rate)
✅ **Custom email templates** (branding)
✅ **Email analytics** (opens, clicks, bounces)
✅ **No delays or queuing**
✅ **Free tier sufficient** for most apps

---

## Development Mode Bypass

If you want to skip email verification during development, add this to your `.env.local`:

```bash
NODE_ENV=development
```

The API route already checks for this and skips verification in development mode.

## Production Checklist

Before going live:
- [ ] Verified domain is authorized in Firebase
- [ ] Email templates are properly configured
- [ ] Action handler URL points to production domain
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)
- [ ] Check spam folder delivery
- [ ] Confirm verification link redirects correctly

## Next Steps

1. **Test the signup flow** with a new email address
2. **Check browser console** for detailed logs
3. **Monitor Firebase Console** → Authentication → Users for new signups
4. If issues persist, check **Firebase Console** → **Logs** for backend errors
