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

// Message generation logic based on context
export function generateMessage(
  messageId: string,
  context: ContextSettings
): MessageVariant {
  if (messageId === 'termination') {
    return generateTerminationMessage(context);
  }
  
  if (messageId === 'rejection') {
    return generateRejectionMessage(context);
  }
  
  if (messageId === 'boundary') {
    return generateBoundaryMessage(context);
  }
  
  if (messageId === 'negative-feedback') {
    return generateFeedbackMessage(context);
  }
  
  if (messageId === 'saying-no') {
    return generateNoMessage(context);
  }
  
  if (messageId === 'withdrawing-support') {
    return generateWithdrawMessage(context);
  }
  
  return {
    wording: "Select a message type to generate translations.",
    explanation: "",
    reception: ""
  };
}

function generateTerminationMessage(context: ContextSettings): MessageVariant {
  const { formality, directness, powerRelationship, emotionalSensitivity, culturalContext, medium } = context;
  
  // High formality + High sensitivity + Japan
  if (formality > 70 && emotionalSensitivity > 70 && culturalContext === 'japan') {
    return {
      wording: medium === 'written-notice' 
        ? "After careful consideration of our organizational needs and with deep respect for your contributions, we have reached the difficult decision that your position will be discontinued effective [date]. We recognize the significant impact this may have and wish to express our sincere gratitude for your service."
        : "I want to speak with you about something difficult. After much deliberation, we've had to make the painful decision regarding your position. I want you to know that this reflects organizational changes, not your personal value. We are deeply grateful for everything you've contributed.",
      explanation: "This version emphasizes collective decision-making and acknowledges the emotional weight, which aligns with Japanese communication norms that prioritize harmony and face-saving.",
      reception: "Likely to be received with appreciation for the respectful approach, though the indirect language may initially create uncertainty about the exact nature of the decision.",
      warning: "In formal Japanese business contexts, consider having an intermediary present or providing advance notice to allow the person to prepare emotionally."
    };
  }
  
  // High directness + Germany
  if (directness > 70 && culturalContext === 'germany') {
    return {
      wording: medium === 'email'
        ? "Subject: Termination of Employment\n\nDear [Name],\n\nThis letter serves as formal notice of the termination of your employment with [Company], effective [date]. This decision is based on [reason]. Please contact HR regarding final pay and benefits.\n\nRegards,\n[Your name]"
        : "I need to inform you directly: we are terminating your employment, effective [date]. The reason for this decision is [reason]. Let me explain the next steps regarding your transition.",
      explanation: "German business communication typically values directness and clarity. This version states the decision clearly without excessive softening, which would be seen as evasive.",
      reception: "Will be received as professionally appropriate. Germans generally appreciate knowing exactly where they stand without having to interpret unclear language.",
      warning: "Ensure you have documented the legal basis for termination, as German employment law requires specific grounds."
    };
  }
  
  // Casual + Low sensitivity + Equal power
  if (formality < 40 && emotionalSensitivity < 40 && powerRelationship === 'equal') {
    return {
      wording: "Look, I'm going to be straight with you — this isn't working out. We need to part ways. I know that's hard to hear, but I'd rather tell you directly than drag things out. Let's talk about how to make the transition as smooth as possible.",
      explanation: "This casual, direct approach works when there's an established peer relationship and the recipient is likely to appreciate honesty over formality.",
      reception: "May be appreciated for its honesty, but could feel abrupt if the relationship was less close than assumed.",
      warning: "Even in casual settings, ensure you have HR present or have documented the conversation for legal protection."
    };
  }
  
  // Formal + Written notice + US
  if (formality > 60 && medium === 'written-notice' && culturalContext === 'us') {
    return {
      wording: "Dear [Name],\n\nThis letter is to inform you that your employment with [Company] will be terminated effective [date].\n\nThis decision was made after careful review and is final. You will receive [severance details] as outlined in your employment agreement. Please schedule a meeting with Human Resources to discuss the transition of your responsibilities and final documentation.\n\nWe wish you success in your future endeavors.\n\nSincerely,\n[Your name]",
      explanation: "Standard US termination letter format: clear statement of termination, effective date, practical next steps, and a neutral closing. Keeps legal exposure minimal.",
      reception: "Will be received as standard professional practice. The neutral tone avoids creating additional conflict while maintaining clarity.",
      warning: "Have this letter reviewed by legal counsel and ensure all stated terms match what you can deliver."
    };
  }
  
  // High sensitivity + Less power (you're terminating someone more senior)
  if (emotionalSensitivity > 60 && powerRelationship === 'less') {
    return {
      wording: medium === 'in-person'
        ? "I appreciate you making time to meet. I have to share something difficult. After extensive deliberation at the leadership level, a decision has been made regarding your role. We're ending your position with the organization. I know this may come as a surprise given your tenure and contributions, and I want to be available to discuss this further."
        : "I'm writing to share a decision that I know will be unexpected. After careful consideration by leadership, we will be concluding your role with the organization effective [date]. I recognize the significance of your contributions and wanted to communicate this directly.",
      explanation: "When terminating someone with more organizational status, acknowledging the power dynamic and showing deference while remaining clear about the decision is essential.",
      reception: "The respectful framing may help maintain dignity, but be prepared for pushback given the power differential.",
      warning: "Ensure you have explicit authorization from whoever holds actual authority over this person before this conversation."
    };
  }
  
  // Default balanced version
  return {
    wording: medium === 'email'
      ? "Subject: Important Discussion Required\n\nDear [Name],\n\nI need to schedule a meeting with you to discuss your role with the organization. This is an important conversation that should happen in person. Please let me know your availability today or tomorrow.\n\nBest regards,\n[Your name]"
      : "I need to have a difficult conversation with you. We've made the decision to end your employment with [Company]. I understand this is significant news, and I want to give you the space to process it. The effective date will be [date], and we'll work with you on the transition.",
    explanation: "A balanced approach that's clear but not harsh, acknowledging the human impact while maintaining professionalism.",
    reception: "Most people will appreciate the directness combined with acknowledgment of impact. Allows for questions and processing.",
  };
}

function generateRejectionMessage(context: ContextSettings): MessageVariant {
  const { formality, directness, culturalContext, medium } = context;
  
  if (formality > 70 && culturalContext === 'japan') {
    return {
      wording: "Thank you very much for presenting this proposal. We have given it serious consideration. At this time, we find it difficult to proceed in the direction you've outlined. We hope there may be opportunities for collaboration in the future under different circumstances.",
      explanation: "Japanese business culture often uses indirect refusals. 'Difficult to proceed' is understood as a clear no without causing loss of face.",
      reception: "Will be understood as a definitive rejection by those familiar with Japanese business norms, while preserving the relationship.",
    };
  }
  
  if (directness > 70) {
    return {
      wording: medium === 'email'
        ? "Thank you for your proposal. After review, we've decided not to move forward with it. The primary reasons are [reasons]. We appreciate your time and effort."
        : "I've reviewed your proposal and I'm going to be direct — we're not going to proceed with this. Here's why: [reasons]. I wanted to tell you clearly rather than leave you uncertain.",
      explanation: "Direct rejection saves everyone time and allows the other party to move on or address the specific issues raised.",
      reception: "May initially sting, but most professionals appreciate clarity over prolonged uncertainty or vague responses.",
    };
  }
  
  return {
    wording: "Thank you for submitting this proposal. We've reviewed it carefully, and while we see merit in several aspects, we've decided to go in a different direction at this time. We appreciate the thought and effort you put into this.",
    explanation: "Acknowledges effort while clearly communicating the negative decision. Leaves door open without making false promises.",
    reception: "Generally well-received as professional and courteous, though very direct personalities may find it unnecessarily soft.",
  };
}

function generateBoundaryMessage(context: ContextSettings): MessageVariant {
  const { directness, powerRelationship, emotionalSensitivity } = context;
  
  if (powerRelationship === 'less' && emotionalSensitivity > 50) {
    return {
      wording: "I appreciate the trust you place in me by involving me in this. I want to be honest about my capacity: I'm not able to take this on in addition to my current responsibilities. I want to do excellent work on my core duties, and I'd be concerned about my ability to deliver if I stretch too thin.",
      explanation: "When setting boundaries with someone who has more power, framing it around quality of work and existing commitments is more palatable than personal preferences.",
      reception: "Usually respected when framed this way. Shows professionalism rather than unwillingness.",
      warning: "Be prepared to discuss priorities if they push back. Have a clear sense of what you can deprioritize if they insist."
    };
  }
  
  if (directness > 70 && powerRelationship === 'more') {
    return {
      wording: "This isn't something I can accommodate. Going forward, I need [specific boundary]. This isn't negotiable, but I'm happy to discuss how we work together within these parameters.",
      explanation: "When you have more power, you can afford to be more direct. The key is being clear while remaining open to discussion about implementation.",
      reception: "Direct approach is usually respected when delivered calmly. The clarity helps avoid future conflicts.",
    };
  }
  
  return {
    wording: "I need to be clear about something. I'm not able to [specific thing]. I understand this might create some challenges, and I'm willing to discuss alternatives, but this particular boundary is important for me to maintain.",
    explanation: "Clear, first-person language makes the boundary unambiguous while the offer to discuss alternatives shows collaboration.",
    reception: "Most people respect clearly communicated boundaries, especially when delivered without accusation or defensiveness.",
  };
}

function generateFeedbackMessage(context: ContextSettings): MessageVariant {
  const { formality, directness, emotionalSensitivity, culturalContext } = context;
  
  if (emotionalSensitivity > 70 && culturalContext === 'japan') {
    return {
      wording: "I've been reflecting on some aspects of our work together. I wonder if we might explore some different approaches to [area]. I've noticed some patterns that I think we could improve together. Would you be open to discussing this?",
      explanation: "High-context approach that signals criticism without directly stating it, allowing the recipient to save face while still receiving the message.",
      reception: "The person will understand criticism is coming. This approach allows them to mentally prepare and engage constructively.",
      warning: "Be prepared for a more indirect response in return. The actual problem-solving may happen over multiple conversations."
    };
  }
  
  if (directness > 70 && formality < 50) {
    return {
      wording: "I need to give you some direct feedback. [Specific behavior or outcome] isn't meeting the standard we need. Here's specifically what I've observed: [examples]. This needs to change. What's your take on this?",
      explanation: "Direct feedback with specific examples prevents ambiguity and gives the person something concrete to respond to.",
      reception: "Some will appreciate the clarity; others may become defensive. The invitation to share their perspective helps.",
    };
  }
  
  return {
    wording: "I want to discuss something important with you. I've noticed [specific observation] and I'm concerned about [impact]. I want to understand your perspective and work with you on addressing this. Can you help me understand what's happening from your side?",
    explanation: "States the issue clearly while creating space for dialogue. Focuses on behavior and impact rather than character.",
    reception: "Generally received well because it feels collaborative rather than punitive, while still being clear about the concern.",
  };
}

function generateNoMessage(context: ContextSettings): MessageVariant {
  const { formality, directness, powerRelationship } = context;
  
  if (directness > 80) {
    return {
      wording: "No, I can't do that. I appreciate you thinking of me, but this isn't something I'm able to take on.",
      explanation: "Simple, clear, complete. No false excuses or excessive justification that might invite negotiation.",
      reception: "Directness is often appreciated more than lengthy explanations. Most people prefer a clear no to a maybe.",
    };
  }
  
  if (powerRelationship === 'less' && formality > 50) {
    return {
      wording: "Thank you for considering me for this. After looking at my current commitments, I'm not able to take this on in a way that would meet the standard you'd expect. I'd rather decline than deliver something subpar.",
      explanation: "Frames the no as quality-focused rather than preference-based, which is more palatable when declining requests from superiors.",
      reception: "Usually well-received as it demonstrates conscientiousness. Most managers respect this reasoning.",
    };
  }
  
  return {
    wording: "I've thought about this, and I need to say no. I appreciate you asking, and I hope this doesn't cause too much difficulty. Let me know if there's another way I can help.",
    explanation: "Clear refusal with acknowledgment of the other person's needs and an offer of alternative support.",
    reception: "The offer to help in other ways softens the no while keeping the refusal unambiguous.",
  };
}

function generateWithdrawMessage(context: ContextSettings): MessageVariant {
  const { formality, directness, emotionalSensitivity, medium } = context;
  
  if (formality > 70 && medium === 'written-notice') {
    return {
      wording: "Dear [Name],\n\nAfter careful deliberation, I am writing to inform you of our decision to discontinue our involvement with [project/initiative]. This decision was not made lightly, and we recognize the impact it may have.\n\nEffective [date], we will no longer be able to provide [specific support]. We are committed to ensuring an orderly transition and are available to discuss how to minimize disruption.\n\nThank you for the opportunity to have been involved.\n\nSincerely,\n[Your name]",
      explanation: "Formal written notice provides documentation and clarity. The offer to discuss transition shows good faith.",
      reception: "The formality creates emotional distance, which may be appropriate but could feel cold to some recipients.",
    };
  }
  
  if (emotionalSensitivity > 60 && directness < 50) {
    return {
      wording: "I need to share something that's difficult for me. After a lot of thought, I've realized I can't continue my involvement with this. I know the timing isn't ideal, and I'm sorry for any complications this creates. I want to do whatever I can to make this transition as smooth as possible.",
      explanation: "Acknowledges the emotional dimension and your own difficulty with the decision, which can help preserve the relationship.",
      reception: "The personal acknowledgment of difficulty often generates understanding, even if the news is unwelcome.",
      warning: "Be genuine — false expressions of difficulty can come across as manipulative."
    };
  }
  
  return {
    wording: "I need to let you know that I'll be stepping back from [project/commitment]. I've reached this decision after considering my current capacity and priorities. I want to give you adequate notice so you can plan accordingly. My last [date/involvement] will be [date].",
    explanation: "Clear, professional, and provides practical information. Doesn't over-explain or apologize excessively.",
    reception: "Generally received as professional and responsible, especially with adequate notice.",
  };
}
