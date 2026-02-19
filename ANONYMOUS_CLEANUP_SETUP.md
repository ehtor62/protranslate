# Anonymous User Cleanup System

## Overview

Automated cleanup system that deletes anonymous Firebase users older than 30 days who never converted to real accounts.

## How It Works

**Anonymous users are created when:**
- User clicks "Get more credits" button in pricing modal
- User starts using the app without signing up

**Cleanup criteria:**
- User is anonymous (no email, no provider data)
- User is older than 30 days
- Runs weekly via Vercel Cron Jobs

## Endpoints

### 1. Admin-Triggered Cleanup (Manual)

**POST** `/api/admin/cleanup-anonymous-users`

Requires admin authentication (Bearer token + `isAdmin: true`)

```bash
curl -X POST https://your-app.com/api/admin/cleanup-anonymous-users \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "scannedUsers": 5432,
  "deletedUsers": 127,
  "cutoffDate": "2026-01-20T02:00:00.000Z",
  "timestamp": "2026-02-19T02:00:00.000Z"
}
```

**Rate Limit:** 5 requests per 24 hours

---

### 2. Cron-Triggered Cleanup (Automated)

**GET** `/api/admin/cleanup-anonymous-users`

Requires `CRON_SECRET` in Authorization header

```bash
curl -X GET https://your-app.com/api/admin/cleanup-anonymous-users \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Scheduled:** Every Sunday at 2:00 AM UTC (configured in `vercel.json`)

---

## Setup Instructions

### Step 1: Add Cron Secret to Environment Variables

Add this to your Vercel project environment variables:

```
CRON_SECRET=your-secure-random-string-here
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### Step 2: Configure Vercel Cron Job

The `vercel.json` file is already configured:

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-anonymous-users",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

**Schedule:** `0 2 * * 0` = Every Sunday at 2:00 AM UTC

**To change schedule**, use cron syntax:
- `0 2 * * *` = Daily at 2:00 AM
- `0 2 * * 1` = Every Monday at 2:00 AM
- `0 2 1 * *` = First day of every month at 2:00 AM

### Step 3: Deploy to Vercel

```bash
git add -A
git commit -m "Add anonymous user cleanup system"
git push
```

Vercel will automatically:
1. Deploy the cleanup endpoint
2. Set up the cron job
3. Run cleanup every Sunday at 2:00 AM UTC

### Step 4: Verify Cron Job is Active

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see: `/api/admin/cleanup-anonymous-users` scheduled
3. You can manually trigger it from the dashboard for testing

---

## Testing

### Test Manual Cleanup (Admin)

1. Get your Firebase ID token (from browser console after logging in)
2. Make yourself admin in Firestore: `isAdmin: true`
3. Run the cleanup:

```bash
curl -X POST https://your-app.com/api/admin/cleanup-anonymous-users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Cron Endpoint (Local)

```bash
# Set CRON_SECRET in .env.local first
curl -X GET http://localhost:3000/api/admin/cleanup-anonymous-users \
  -H "Authorization: Bearer your-cron-secret"
```

**Expected Output:**
```json
{
  "success": true,
  "scannedUsers": 150,
  "deletedUsers": 12,
  "cutoffDate": "2026-01-20T02:00:00.000Z",
  "timestamp": "2026-02-19T14:30:00.000Z"
}
```

---

## Monitoring

### View Cleanup Logs

**Vercel Dashboard:**
1. Go to your project → Deployments
2. Click on latest deployment → Functions
3. Find `/api/admin/cleanup-anonymous-users`
4. View real-time logs

**Log Format:**
```
[Cleanup] Starting anonymous user cleanup by admin: abc123
[Cleanup] Deleting anonymous user: xyz789 (created: 2025-12-15T10:30:00.000Z)
[Cleanup] ✓ Deleted user xyz789
[Cleanup] Completed: Scanned 5000, Deleted 150 anonymous users
```

### Check Cron Job Execution History

Vercel Dashboard → Your Project → Cron Jobs → View execution history

---

## Safety Features

### What Gets Deleted:
✅ Anonymous users (no email)
✅ Older than 30 days
✅ No provider data (or only 'anonymous' provider)

### What's Protected:
❌ Users with emails
❌ Users with Google/Facebook/etc. sign-in
❌ Anonymous users less than 30 days old
❌ Users who made purchases (have credits > 5)

### Additional Safety:
- Deletes Firestore document first (user data)
- Then deletes Firebase Auth user
- Continues even if Firestore delete fails
- Logs all errors for review
- Rate limited to prevent abuse

---

## Customization

### Adjust Retention Period

Edit [app/api/admin/cleanup-anonymous-users/route.ts](app/api/admin/cleanup-anonymous-users/route.ts):

```typescript
// Change 30 to your preferred number of days
cutoffDate.setDate(cutoffDate.getDate() - 30);
```

**Recommendations:**
- **7 days**: Aggressive cleanup (may delete legitimate trial users)
- **30 days**: Balanced (recommended)
- **90 days**: Conservative (more storage costs)

### Add Purchase Protection

To prevent deleting anonymous users who made purchases:

```typescript
// Before deleting, check if user has purchased credits
const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
const userData = userDoc.data();

if (userData && userData.credits > 5) {
  console.log(`[Cleanup] Skipping user with purchased credits: ${userRecord.uid}`);
  continue; // Don't delete
}
```

### Add Email Notification

After cleanup completes, send summary email:

```typescript
// Add to end of cleanup function
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'cleanup@yourdomain.com',
  to: 'admin@yourdomain.com',
  subject: `Cleanup Complete: ${deletedCount} users deleted`,
  text: `Scanned: ${scannedCount}\nDeleted: ${deletedCount}\nDate: ${new Date().toISOString()}`
});
```

---

## Cost Savings Estimate

**Assumptions:**
- 1000 anonymous users created per week
- 90% never convert (900 abandoned users/week)
- Firebase Auth: $0.006 per user per month
- Firestore storage: ~1KB per user

**Without cleanup (annual):**
- 46,800 abandoned users per year
- Auth costs: $3,369/year
- Firestore: ~$100/year
- **Total: ~$3,469/year**

**With 30-day cleanup (annual):**
- Max 3,857 abandoned users at any time
- Auth costs: ~$278/year
- Firestore: ~$8/year
- **Total: ~$286/year**

**Savings: ~$3,183/year (92% reduction)**

---

## Troubleshooting

### Cron Job Not Running

1. **Check Vercel Dashboard** → Cron Jobs
2. Ensure `vercel.json` is in root directory
3. Verify schedule syntax (use https://crontab.guru)
4. Check project is on Pro plan (cron requires Pro)

### Authentication Errors

```
Error: Unauthorized
```

**Solution:**
- Ensure `CRON_SECRET` is set in Vercel environment variables
- Verify secret matches Authorization header
- For manual cleanup, ensure user has `isAdmin: true` in Firestore

### Permission Errors

```
Error: Insufficient permissions
```

**Solution:**
- Check Firebase service account has `firebase-admin` SDK permissions
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is properly configured
- Ensure service account has "Firebase Authentication Admin" role

### Rate Limit Exceeded

```
Error: Rate limit exceeded
```

**Solution:**
- Manual cleanup limited to 5 times per 24 hours
- Wait 24 hours or increase limit in code
- Cron endpoint has no rate limit

---

## Alternative: Firebase Functions (If Not Using Vercel)

If using Firebase Hosting instead of Vercel:

```typescript
// functions/src/scheduled-cleanup.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const cleanupAnonymousUsers = functions.pubsub
  .schedule('0 2 * * 0') // Every Sunday at 2 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    // Same cleanup logic as above
  });
```

Deploy:
```bash
firebase deploy --only functions:cleanupAnonymousUsers
```

---

## Support

For issues or questions:
- Check Vercel logs for error details
- Review Firebase Auth users in console
- Monitor cleanup execution in Vercel dashboard

**Last Updated:** February 19, 2026  
**Version:** 1.0
