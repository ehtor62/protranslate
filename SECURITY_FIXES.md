# Security Fixes - February 2026

## Overview
This document outlines critical security vulnerabilities that were identified and fixed in the application.

## Vulnerabilities Fixed

### 🔴 CRITICAL - Unauthenticated Admin Endpoints

**Problem:** All admin endpoints (`/api/admin/*`) had no authentication, allowing anyone to:
- Award unlimited credits to any user
- Access private user data (emails, credit balances, referral info)
- Manipulate referral records

**Files Affected:**
- `/app/api/admin/add-credits/route.ts`
- `/app/api/admin/manual-referral/route.ts`
- `/app/api/admin/check-referral/route.ts`
- `/app/api/admin/fix-referrals/route.ts`

**Solution:**
- Implemented `verifyAdminAuth()` function in `src/lib/firebase-admin.ts`
- Added admin role verification using Firestore `isAdmin` field
- All admin endpoints now require:
  1. Valid Firebase Bearer token
  2. User must have `isAdmin: true` in their Firestore user document
  3. Rate limiting (10 requests/hour for most endpoints)

### 🟠 HIGH RISK - Missing Rate Limiting

**Problem:** Admin and feedback endpoints had no rate limiting, allowing spam and abuse.

**Solution:**
- Implemented `checkRateLimit()` utility in `src/lib/firebase-admin.ts`
- Applied rate limits:
  - Admin endpoints: 10 requests/hour
  - Check-referral endpoint: 20 requests/hour
  - Feedback endpoint: 10 requests/hour

### 🟡 MEDIUM RISK - Insufficient Input Validation

**Problem:** Various endpoints lacked proper input validation.

**Solution:**
- Feedback comment: Max 1000 characters
- Referral codes: Must match format `^[A-Z0-9]{6}$`
- Add-credits amount: Must be 1-1000
- All inputs sanitized and trimmed

## Setting Up Admin Users

### Method 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Find or create a user document in the `users` collection
5. Add the field: `isAdmin: true` (boolean)

### Method 2: Using Firebase Admin SDK (Programmatic)

Create a one-time script to set admin status:

```javascript
// scripts/make-admin.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();

async function makeAdmin(email) {
  // Find user by email
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  
  if (snapshot.empty) {
    console.log('User not found');
    return;
  }
  
  snapshot.forEach(async (doc) => {
    await doc.ref.update({ isAdmin: true });
    console.log(`User ${email} is now an admin`);
  });
}

// Usage: node scripts/make-admin.js
makeAdmin('your-admin-email@example.com');
```

### Method 3: Direct Firestore Update

If you have access to the Firestore database, you can run this query:

```
UPDATE users SET isAdmin = true WHERE email = 'your-admin@example.com'
```

## Testing Admin Access

### 1. Test Admin Authentication

```bash
# Get Firebase ID token from authenticated user
TOKEN="your-firebase-id-token"

# Try accessing admin endpoint
curl -X POST https://your-app.com/api/admin/check-referral \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

**Expected Results:**
- ✅ Admin user: Returns referral data
- ❌ Non-admin user: `403 Forbidden - Admin access required`
- ❌ No token: `401 Unauthorized - Missing authentication token`

### 2. Verify Rate Limiting

Make 11 requests within an hour to the same endpoint:
- First 10 should succeed
- 11th should return: `429 Rate limit exceeded`

### 3. Test Input Validation

```bash
# Test invalid referral code
curl -X POST https://your-app.com/api/referral/track \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "invalid123"}'

# Expected: 400 Invalid referral code format
```

## Security Best Practices

### 1. Limit Admin Accounts
- Only grant admin access to trusted personnel
- Regularly audit admin user list
- Remove admin access when no longer needed

### 2. Monitor Admin Activity
All admin operations are logged with:
```
[Admin] User {adminUserId} {action} on user {targetUserId}
```

Consider setting up log monitoring/alerts for admin actions.

### 3. Environment Variables
Ensure `.env.local` is in `.gitignore` (already configured).

**Required environment variables:**
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-project-id
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 4. Future Recommendations

1. **Move to Database Rate Limiting**: Current rate limiting uses in-memory Map. For production with multiple instances, use Redis or Upstash.

2. **Add Admin Audit Log**: Store all admin actions in a separate Firestore collection for compliance.

3. **Implement IP Whitelist**: For extra security, restrict admin endpoints to specific IPs:
   ```typescript
   const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
   const clientIP = request.headers.get('x-forwarded-for');
   if (!allowedIPs.includes(clientIP)) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

4. **Two-Factor Authentication**: Require 2FA for admin users.

5. **Rotate Secrets Regularly**: Set up a schedule to rotate API keys and secrets.

## Emergency Response

### If Admin Account is Compromised:

1. **Immediately revoke admin access** in Firebase Console
2. **Check logs** for unauthorized actions
3. **Review all recent admin operations**
4. **Check for unauthorized credit additions** in Firestore
5. **Rotate all API keys** if exposed:
   - Stripe Secret Key
   - OpenAI API Key
   - Firebase Service Account
   - Resend API Key

### Monitoring Checklist:

- [ ] Set up alerts for failed admin authentication attempts
- [ ] Monitor credit balance anomalies
- [ ] Track referral system for unusual patterns
- [ ] Review feedback submissions for spam
- [ ] Check rate limit logs for abuse attempts

## Support

For security concerns, contact: [your-security-email@domain.com]

---

**Last Updated:** February 19, 2026  
**Version:** 1.0
