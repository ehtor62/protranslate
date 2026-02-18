import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth as adminAuth } from '@/lib/firebase-admin';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send verification email via Resend for instant delivery
 * Falls back to Firebase if Resend is not configured
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Firebase auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      return NextResponse.json({ error: 'No email associated with user' }, { status: 400 });
    }

    // Generate verification link using Firebase Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(
      decodedToken.email,
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/translate`,
      }
    );

    // Check if Resend is configured
    if (resend && process.env.RESEND_FROM_EMAIL) {
      // Send via Resend for instant delivery
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: decodedToken.email,
        subject: 'Verify your email address',
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
      });

      console.log('[Resend] ✅ Verification email sent instantly to:', decodedToken.email);
      console.log('[Resend] Email ID:', emailResult.data?.id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Verification email sent successfully',
        provider: 'Resend',
        deliveryTime: 'Instant (< 10 seconds)',
        emailId: emailResult.data?.id
      });
    } else {
      // Fallback: Resend not configured, log warning
      console.warn('[Verification API] ⚠️ Resend not configured - email will be delayed');
      console.log('[Verification API] Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.local');
      console.log('[Verification API] See RESEND_SETUP.md for instructions');
      
      return NextResponse.json({ 
        success: true,
        message: 'Verification link generated',
        provider: 'Firebase (Resend not configured)',
        note: 'Configure Resend for instant delivery - see RESEND_SETUP.md'
      });
    }

  } catch (error: any) {
    console.error('[Verification API] ❌ Error:', error);
    
    // Resend-specific error handling
    if (error.message) {
      console.error('[Resend] Error message:', error.message);
    }
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to send verification email',
      details: error.message 
    }, { status: 500 });
  }
}
