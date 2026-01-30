export interface MessageVariant {
  wording: string;
  explanation: string;
  reception: string;
  warning?: string;
}

export interface ContextSettings {
  formality: number; // 0-100: Casual -> Institutional
  directness: number; // 0-100: Indirect -> Blunt
  powerRelationship: 'more' | 'equal' | 'less'; // Your power relative to recipient
  emotionalSensitivity: number; // 0-100: Low -> High
  culturalContext: 'neutral' | 'us' | 'uk' | 'germany' | 'japan';
  medium: 'in-person' | 'email' | 'written-notice';
}

export interface CoreMessage {
  id: string;
  title: string;
  description: string;
  category: string;
}

export const coreMessages: CoreMessage[] = [
  {
    id: 'termination',
    title: 'Terminating employment',
    description: 'Ending someone\'s employment with your organization',
    category: 'Employment'
  },
  {
    id: 'rejection',
    title: 'Rejecting a proposal',
    description: 'Declining a business proposal, pitch, or request',
    category: 'Business'
  },
  {
    id: 'boundary',
    title: 'Setting a boundary',
    description: 'Establishing limits on behavior, requests, or expectations',
    category: 'Interpersonal'
  },
  {
    id: 'negative-feedback',
    title: 'Giving negative feedback',
    description: 'Communicating criticism about performance or behavior',
    category: 'Performance'
  },
  {
    id: 'saying-no',
    title: 'Saying no',
    description: 'Declining a request, invitation, or opportunity',
    category: 'General'
  },
  {
    id: 'withdrawing-support',
    title: 'Withdrawing support',
    description: 'Ending involvement, sponsorship, or backing',
    category: 'Business'
  }
];

export const culturalLabels: Record<string, string> = {
  'neutral': 'Neutral / International',
  'us': 'United States',
  'uk': 'United Kingdom',
  'germany': 'Germany',
  'japan': 'Japan'
};

export const mediumLabels: Record<string, string> = {
  'in-person': 'In-person conversation',
  'email': 'Email',
  'written-notice': 'Written notice / Letter'
};

export const powerLabels: Record<string, string> = {
  'more': 'You have more power',
  'equal': 'Equal standing',
  'less': 'They have more power'
};
