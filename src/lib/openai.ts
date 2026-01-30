import OpenAI from 'openai';
import { ContextSettings, MessageVariant } from '@/data/messages';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to get formality label
function getFormalityLabel(value: number): string {
  if (value <= 20) return 'Casual';
  if (value <= 40) return 'Informal';
  if (value <= 60) return 'Neutral';
  if (value <= 80) return 'Formal';
  return 'Institutional';
}

// Helper function to get directness label
function getDirectnessLabel(value: number): string {
  if (value <= 12) return 'Indirect';
  if (value <= 37) return 'Diplomatic';
  if (value <= 62) return 'Clear';
  if (value <= 87) return 'Direct';
  return 'Blunt';
}

// Helper function to get emotional sensitivity label
function getEmotionalSensitivityLabel(value: number): string {
  if (value <= 12) return 'Low';
  if (value <= 37) return 'Contained';
  if (value <= 62) return 'Attentive';
  if (value <= 87) return 'Sensitive';
  return 'High';
}

function buildPrompt(messageType: string, messageDescription: string, context: ContextSettings): string {
  const formalityLabel = getFormalityLabel(context.formality);
  const directnessLabel = getDirectnessLabel(context.directness);
  const sensitivityLabel = getEmotionalSensitivityLabel(context.emotionalSensitivity);
  
  const powerRelationshipMap = {
    'more': 'You have more power',
    'equal': 'Equal standing',
    'less': 'They have more power'
  };
  
  const culturalMap = {
    'neutral': 'Neutral/International',
    'us': 'United States',
    'uk': 'United Kingdom',
    'germany': 'Germany',
    'japan': 'Japan'
  };
  
  const mediumMap = {
    'in-person': 'In-person conversation',
    'email': 'Email',
    'written-notice': 'Written notice/Letter'
  };

  return `You are an expert in professional workplace communication, specializing in difficult conversations. Generate a professionally calibrated message for the following scenario:

**Message Type**: ${messageType}
**Description**: ${messageDescription}

**Context Parameters**:
- Formality: ${formalityLabel} (${context.formality}%)
- Directness: ${directnessLabel} (${context.directness}%)
- Emotional Sensitivity: ${sensitivityLabel} (${context.emotionalSensitivity}%)
- Power Relationship: ${powerRelationshipMap[context.powerRelationship]}
- Cultural Context: ${culturalMap[context.culturalContext]}
- Medium: ${mediumMap[context.medium]}

**Instructions**:
Generate a message that appropriately balances all these parameters. The message should be culturally aware, professionally appropriate, and calibrated to the specified tone and context.

**Return a JSON object with exactly these fields**:
{
  "wording": "The actual message text, formatted appropriately for the medium",
  "explanation": "A brief explanation of why this wording was chosen given the context parameters",
  "reception": "How this message is likely to be received by the recipient",
  "warning": "Optional: any important cautions or considerations (leave empty string if none)"
}

Return ONLY valid JSON, no markdown formatting or additional text.`;
}

export async function generateMessageWithAI(
  messageType: string,
  messageDescription: string,
  context: ContextSettings
): Promise<MessageVariant> {
  try {
    const prompt = buildPrompt(messageType, messageDescription, context);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in professional workplace communication. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(responseText);
    
    return {
      wording: result.wording || '',
      explanation: result.explanation || '',
      reception: result.reception || '',
      warning: result.warning || undefined
    };
  } catch (error) {
    console.error('Error generating message with AI:', error);
    return {
      wording: 'Error generating message. Please try again.',
      explanation: 'An error occurred while processing your request.',
      reception: '',
      warning: 'Technical error - please check console for details'
    };
  }
}
