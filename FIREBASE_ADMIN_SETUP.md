# Firebase Admin Setup Guide

## Overview
The API now requires Firebase authentication. Users must be signed in to generate translations.

## Development Setup

### 1. Local Development (Current Setup)
For local development, the app uses Firebase Application Default Credentials with just the project ID:

```env
FIREBASE_PROJECT_ID=protranslate-89464
```

This works fine for local testing with authenticated users.

### 2. Production Setup (Recommended)

For production deployment (Vercel, etc.), you need a Firebase Service Account:

#### Step 1: Generate Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `protranslate-89464`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

#### Step 2: Add to Environment Variables

**Option A: Single-line JSON (Recommended for Vercel)**
```bash
# Convert JSON to single line and add to .env.local
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"protranslate-89464","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Option B: Use Vercel Secrets**
```bash
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# Paste the entire JSON content when prompted
```

## Security Features

### API Protection Layers
1. ✅ **Firebase Authentication** - Users must be signed in
2. ✅ **Rate Limiting** - 6 requests per minute per user (by UID, not IP)
3. ✅ **Input Validation** - Title (60 chars), Description (1000 chars)
4. ✅ **Context Validation** - Values must be 0-100
5. ✅ **Prompt Length Check** - Max 3000 characters total

### Authentication Flow
```
Client → Signs in with Firebase → Gets ID Token
Client → Sends request with Bearer token
Server → Verifies token with Firebase Admin
Server → Checks rate limit by user UID
Server → Validates input
Server → Generates translation
```

## Testing

### Test Authentication
```bash
# Start dev server
npm run dev

# Try accessing API without auth (should fail)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"messageType":"test","messageDescription":"test","context":{}}'

# Response: 401 Unauthorized
```

### Test with Valid Auth
Sign in through the UI, then the frontend automatically includes the Bearer token.

## Troubleshooting

### Error: "Firebase Admin not initialized"
- Make sure `FIREBASE_PROJECT_ID` is set in `.env.local`
- For production, add `FIREBASE_SERVICE_ACCOUNT_KEY`

### Error: "Invalid authentication token"
- Token might be expired (tokens expire after 1 hour)
- User needs to sign in again
- Check if Firebase project ID matches

### Error: "Rate limit exceeded"
- User hit 6 requests per minute
- Wait 60 seconds and try again
- Rate limit is per user (UID), not per IP

## Email Verification Setup

### Configure Action URL in Firebase Console
Firebase email verification links need to redirect to your custom handler page:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `protranslate-89464`
3. Go to **Authentication** → **Templates** 
4. Click **Email address verification**
5. Click the pencil icon to edit
6. Set the **Action URL** to:
   - **Local dev**: `http://localhost:3000/auth/action`
   - **Production**: `https://your-domain.com/auth/action`
7. Click **Save**

**Note**: 
- The proxy (i18n middleware) automatically handles locale routing (`/auth/action` → `/en/auth/action`)
- The action handler is at `/app/[locale]/auth/action/page.tsx`
- User's browser locale preference determines the language shown

### Test Email Verification
1. Sign up with a new email
2. Check your email for verification link
3. Click the link → should open `/auth/action` page
4. Should show "Email verified successfully!" message
5. Auto-redirects to `/translate` after 3 seconds

## Migration Notes

**Breaking Change**: The API now requires authentication. 

**Before**: Anyone could call the API
**After**: Only authenticated users can call the API

Unauthenticated users will see a prompt to sign in when they try to generate a translation.
