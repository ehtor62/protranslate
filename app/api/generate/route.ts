import { NextRequest, NextResponse } from 'next/server';
import { generateMessageWithAI } from '@/lib/openai';
import { ContextSettings } from '@/data/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageType, messageDescription, context, locale = 'en', targetLanguage } = body;

    if (!messageType || !messageDescription || !context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
