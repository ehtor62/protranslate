import { NextRequest, NextResponse } from 'next/server';
import { generateMessageWithAI } from '@/lib/openai';
import { ContextSettings } from '@/data/messages';
import { verifyIdToken } from '@/lib/firebase-admin';

// Simple in-memory rate limiter
// For production, consider using Redis or a service like Upstash
const rateLimitMap = new Map<string, number[]>();

function rateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Filter out requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  // Add current request and update the map
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  // Clean up old entries periodically (simple memory management)
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupRateLimitMap(windowMs);
  }
  
  return true;
}

function cleanupRateLimitMap(windowMs: number): void {
  const now = Date.now();
  for (const [key, requests] of rateLimitMap.entries()) {
    const recentRequests = requests.filter(time => now - time < windowMs);
    if (recentRequests.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, recentRequests);
    }
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }

    // Rate limiting check (now per authenticated user)
    const identifier = decodedToken.uid; // Use user ID instead of IP
    if (!rateLimit(identifier, 6, 60000)) { // 6 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messageType, messageDescription, context, locale = 'en', targetLanguage } = body;

    if (!messageType || !messageDescription || !context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Input validation to prevent abuse
    if (messageType.length > 60) {
      return NextResponse.json(
        { error: 'Message title is too long (max 60 characters)' },
        { status: 400 }
      );
    }
    
    if (messageDescription.length > 1000) {
      return NextResponse.json(
        { error: 'Message description is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Additional validation: ensure context values are within expected ranges
    if (context.formality < 0 || context.formality > 100 ||
        context.directness < 0 || context.directness > 100 ||
        context.emotionalSensitivity < 0 || context.emotionalSensitivity > 100) {
      return NextResponse.json(
        { error: 'Invalid context values' },
        { status: 400 }
      );
    }

    const result = await generateMessageWithAI(
      messageType,
      messageDescription,
      context as ContextSettings,
      locale,
      targetLanguage
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
}
