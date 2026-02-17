# Firebase Email Verification Setup Guide

## Issue
Verification emails are not being received in the user's inbox.

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

## Common Issues & Solutions

### Issue: Email goes to spam
**Solution**: 
- In Firebase Console, configure a verified "Reply-to" email address
- Add SPF/DKIM records if using custom domain
- Ask users to check spam folder

### Issue: "auth/too-many-requests"
**Solution**: 
- Firebase rate-limits email sending (to prevent abuse)
- Wait a few minutes and try again
- For testing, use different email addresses

### Issue: "auth/invalid-action-code"
**Solution**: 
- Verification links expire after a few hours
- Request a new verification email
- Ensure user hasn't already verified

### Issue: No error but no email received
**Solution**: 
1. Check Firebase Console → **Cloud Firestore** → **users** collection
   - Verify user document was created
2. Check Firebase Console → **Authentication** → **Users**
   - Verify user appears in the list
3. Enable more detailed logging in Firebase Console

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
