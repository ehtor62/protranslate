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
  culturalContext: 'neutral' | 'us' | 'usa' | 'canada' | 'mexico' | 'uk' | 'europe-uk' | 'europe-scandinavia' | 'europe-spain' | 'europe-france' | 'europe-benelux' | 'europe-germany' | 'europe-switzerland' | 'europe-italy' | 'europe-poland' | 'europe-romania' | 'europe-greece' | 'germany' | 'asia-russia' | 'asia-china' | 'asia-india' | 'asia-japan' | 'asia-turkey' | 'asia-saudi-arabia' | 'asia-uae' | 'asia-thailand' | 'asia-malaysia' | 'asia-indonesia' | 'asia-iran' | 'asia-singapore' | 'japan' | 'south-america' | 'central-america' | 'colombia' | 'peru' | 'argentina' | 'brasil' | 'africa' | 'morocco' | 'egypt' | 'congo' | 'angola' | 'namibia' | 'south-africa';
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
    id: 'custom-input',
    title: 'Custom Input',
    description: 'Enter your own topic',
    category: 'General'
  },
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
  'us': 'North America',
  'usa': 'USA',
  'canada': 'Canada',
  'mexico': 'Mexico',
  'uk': 'Europe',
  'europe-uk': 'UK',
  'europe-scandinavia': 'Scandinavia',
  'europe-spain': 'Spain',
  'europe-france': 'France',
  'europe-benelux': 'Benelux',
  'europe-germany': 'Germany',
  'europe-switzerland': 'Switzerland',
  'europe-italy': 'Italy',
  'europe-poland': 'Poland',
  'europe-romania': 'Romania',
  'europe-greece': 'Greece',
  'germany': 'Asia',
  'asia-russia': 'Russia',
  'asia-china': 'China',
  'asia-india': 'India',
  'asia-japan': 'Japan',
  'asia-turkey': 'Turkey',
  'asia-saudi-arabia': 'Saudi Arabia',
  'asia-uae': 'UAE',
  'asia-thailand': 'Thailand',
  'asia-malaysia': 'Malaysia',
  'asia-indonesia': 'Indonesia',
  'asia-iran': 'Iran',
  'asia-singapore': 'Singapore',
  // 'japan': 'South America',
  'south-america': 'South America',
  'central-america': 'Central America',
  'colombia': 'Colombia',
  'peru': 'Peru',
  'argentina': 'Argentina',
  'brasil': 'Brasil',
  'africa': 'Africa',
  'morocco': 'Morocco',
  'egypt': 'Egypt',
  'congo': 'Congo',
  'angola': 'Angola',
  'namibia': 'Namibia',
  'south-africa': 'South Africa'
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
