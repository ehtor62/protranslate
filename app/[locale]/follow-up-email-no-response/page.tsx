"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FollowUpEmailNoResponsePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [formality, setFormality] = useState(50);
  const [directness, setDirectness] = useState(50);
  const [emotion, setEmotion] = useState(50);
  const [power, setPower] = useState('equal');
  const [culture, setCulture] = useState('us');
  const [medium, setMedium] = useState('email');
  const [inputText, setInputText] = useState("Why didn't you reply?");
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rotating text effect: show example for 10s, placeholder for 2s
  useEffect(() => {
    if (!isMounted || !selectedPill || selectedPill === 'custom') return;

    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const runCycle = () => {
      // Show example text for 10 seconds
      setInputText(getInputExample(selectedPill));
      
      timeout1 = setTimeout(() => {
        // Switch to placeholder for 2 seconds
        setInputText('');
        
        timeout2 = setTimeout(() => {
          // Repeat the cycle
          runCycle();
        }, 2000);
      }, 10000);
    };

    runCycle();

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [selectedPill, isMounted]);

  // Reset to default after 20 seconds when a pill is clicked
  useEffect(() => {
    if (!selectedPill) return;

    const resetTimeout = setTimeout(() => {
      setSelectedPill(null);
      setInputText("Why didn't you reply?");
      setFormality(50);
      setDirectness(50);
      setEmotion(50);
      setPower('equal');
      setCulture('us');
      setMedium('email');
    }, 20000);

    return () => {
      clearTimeout(resetTimeout);
    };
  }, [selectedPill]);

  const getInputExample = (scenario: string): string => {
    const examples: Record<string, string> = {
      'job-application': "I haven't heard back about the position. Did you receive my application?",
      'client-proposal': 'Still waiting on your decision about the proposal.',
      'meeting-request': "You never responded to my meeting invite.",
      'project-update': 'I need your input on this. Why the silence?',
      'invoice-payment': 'The invoice is overdue. When will you pay?',
      'general-inquiry': "Hello? Anyone there? I asked a question last week."
    };
    return examples[scenario] || "Why didn't you reply?";
  };

  const scenarioOutputs: Record<string, string> = {
    'job-application': "I hope this message finds you well. I wanted to follow up on my application for the [Position] role that I submitted on [Date]. I remain very interested in the opportunity and would welcome the chance to discuss how my experience aligns with your needs. If there's any additional information I can provide, please don't hesitate to let me know. Thank you for your time and consideration.",
    'client-proposal': "I hope you're doing well. I wanted to circle back on the proposal I shared on [Date]. I understand you're likely busy reviewing multiple options, and I'm happy to answer any questions or provide additional details that would be helpful for your decision-making process. Please let me know if there's anything I can clarify or if you'd like to schedule a brief call to discuss further.",
    'meeting-request': "I hope you're having a good week. I wanted to follow up on the meeting invitation I sent on [Date]. I understand schedules can be busy, and I'm flexible on timing. Would it be possible to find a time that works for you in the coming days? If the proposed topic isn't a priority right now, please let me know and we can revisit at a better time.",
    'project-update': "I hope this email finds you well. I wanted to follow up on the project update I shared on [Date]. I'm at a stage where your input would be valuable to move forward effectively. When you have a moment, I'd appreciate your thoughts. If now isn't a good time, please let me know when might work better for you.",
    'invoice-payment': "I hope you're doing well. I'm writing to follow up on Invoice #[Number] dated [Date], which is now [X] days past the payment terms. I wanted to ensure this email didn't get lost in your inbox. If there are any questions about the invoice or if there's an issue I should be aware of, please let me know so we can resolve it together. I appreciate your attention to this matter.",
    'general-inquiry': "I hope you're having a great week. I wanted to follow up on the question I sent on [Date]. I understand things get busy, and emails can slip through the cracks. When you have a moment, I'd appreciate any guidance you could provide. If you need any additional context or information, I'm happy to provide it. Thank you for your time."
  };

  const outputText = selectedPill ? scenarioOutputs[selectedPill] : "I hope this message finds you well. I wanted to follow up on my previous email from [Date]. I understand you're likely busy, and I don't want to be a bother. However, I would greatly appreciate any update when you have a moment. If there's anything I can clarify or if you need additional information, please don't hesitate to let me know. Thank you for your time and consideration.";

  const scenarioSettings: Record<string, { formality: number; directness: number; emotion: number; power: string; culture: string; medium: string }> = {
    'job-application': { formality: 75, directness: 45, emotion: 30, power: 'subordinate', culture: 'us', medium: 'email' },
    'client-proposal': { formality: 70, directness: 40, emotion: 35, power: 'equal', culture: 'us', medium: 'email' },
    'meeting-request': { formality: 65, directness: 50, emotion: 40, power: 'equal', culture: 'us', medium: 'email' },
    'project-update': { formality: 60, directness: 45, emotion: 35, power: 'superior', culture: 'us', medium: 'email' },
    'invoice-payment': { formality: 75, directness: 55, emotion: 30, power: 'equal', culture: 'us', medium: 'email' },
    'general-inquiry': { formality: 65, directness: 40, emotion: 40, power: 'equal', culture: 'us', medium: 'email' }
  };

  const handlePillClick = (pillId: string) => {
    setSelectedPill(pillId);
    const settings = scenarioSettings[pillId];
    if (settings) {
      setFormality(settings.formality);
      setDirectness(settings.directness);
      setEmotion(settings.emotion);
      setPower(settings.power);
      setCulture(settings.culture);
      setMedium(settings.medium);
    }
    // Update input text based on selection
    if (pillId === 'custom') {
      setInputText('');
    } else {
      setInputText(getInputExample(pillId));
    }
  };

  const beforeAfterExamples = [
    {
      before: '"Why didn\'t you reply?"',
      after: '"I just wanted to follow up on my previous message and see if you had a chance to review it. I understand you\'re busy, and I appreciate any update when you have a moment."',
      settings: {
        formality: 65,
        directness: 45,
        emotion: 35,
        power: 'Speaking to equal',
        culture: 'US',
        medium: 'Email',
        language: 'English'
      }
    },
    {
      before: '"I need an answer ASAP. This is getting ridiculous."',
      after: '"I wanted to gently follow up on this matter, as I\'m working toward a deadline. If you could share an update at your earliest convenience, I would greatly appreciate it. Please let me know if there\'s anything I can do to facilitate a response."',
      settings: {
        formality: 70,
        directness: 50,
        emotion: 30,
        power: 'Speaking to equal',
        culture: 'US',
        medium: 'Email',
        language: 'English'
      }
    },
    {
      before: '"Are you ignoring me? I sent this a week ago."',
      after: '"I hope you\'re well. I wanted to circle back on the email I sent last week. I know things get busy and messages can slip through. When you have a chance, I\'d appreciate any thoughts you might have. Thank you!"',
      settings: {
        formality: 60,
        directness: 40,
        emotion: 45,
        power: 'Speaking to equal',
        culture: 'US',
        medium: 'Email',
        language: 'English'
      }
    }
  ];
  
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `https://sentenly.com/${locale}/follow-up-email-no-response#webapp`,
        "name": "Sentenly Follow-Up Email Writer",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Transform frustrated follow-up messages into professional, polite emails that get responses without sounding pushy.",
        "url": `https://sentenly.com/${locale}/follow-up-email-no-response`,
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "3124"
        }
      },
      {
        "@type": "HowTo",
        "@id": `https://sentenly.com/${locale}/follow-up-email-no-response#howto`,
        "name": "How to Write Professional Follow-Up Emails",
        "description": "Learn how to write professional follow-up emails when you haven't received a response.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Enter your draft message",
            "text": "Type the follow-up message you're thinking of sending, even if it sounds frustrated or blunt."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Choose your scenario",
            "text": "Select from common follow-up scenarios like job applications, client proposals, meeting requests, or payment reminders."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Adjust tone settings",
            "text": "Fine-tune formality, directness, and emotion levels to match your relationship and context."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Get professional version",
            "text": "Review your transformed follow-up email that's polite, professional, and more likely to get a response."
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://sentenly.com/${locale}/follow-up-email-no-response#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://sentenly.com/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Follow-Up Email No Response",
            "item": `https://sentenly.com/${locale}/follow-up-email-no-response`
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `https://sentenly.com/${locale}/follow-up-email-no-response#webpage`,
        "url": `https://sentenly.com/${locale}/follow-up-email-no-response`,
        "name": "Follow-Up Email After No Response - Professional Templates | Sentenly",
        "description": "Write polite follow-up emails when you haven't received a response. Professional templates that get results.",
        "inLanguage": locale,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://sentenly.com/#website",
          "name": "Sentenly",
          "url": "https://sentenly.com"
        },
        "breadcrumb": {
          "@id": `https://sentenly.com/${locale}/follow-up-email-no-response#breadcrumb`
        },
        "potentialAction": {
          "@type": "UseAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `https://sentenly.com/${locale}/follow-up-email-no-response`,
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          }
        }
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Header />
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
        
        <div className="container py-16 md:py-24 relative max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-relaxed">
              <span className="text-primary block mb-4">Follow-Up Email</span>
              <span className="text-white">When You Haven't Received a Response</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We've all been there — you sent an important email and got no reply. Following up can feel awkward, especially when you're frustrated or worried about seeming pushy.
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your follow-up emails from frustrated to professional. Get responses without burning bridges or sounding desperate.
            </p>
          </div>

          {/* Input/Output Demo */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What You Want to Say
              </label>
              <div className="rounded-xl bg-slate-700 backdrop-blur border border-slate-600 overflow-hidden">
                <div className="p-4">
                  <textarea
                    className="w-full h-20 bg-transparent text-white placeholder:text-slate-400 focus:outline-none resize-none text-sm"
                    value={inputText}
                    placeholder="Enter your frustrated message here..."
                    onChange={(e) => setInputText(e.target.value)}
                    readOnly={selectedPill !== 'custom' && selectedPill !== null}
                  />
                </div>
              </div>
            </div>

            {/* Scenario Switcher */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                Click a shortcut below or fine-tune with controls in <Link href={`/${locale}`} className="text-primary hover:underline">live version</Link>
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePillClick('job-application')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'job-application'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Job Application
                </button>
                <button
                  onClick={() => handlePillClick('client-proposal')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'client-proposal'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Client Proposal
                </button>
                <button
                  onClick={() => handlePillClick('meeting-request')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'meeting-request'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Meeting Request
                </button>
                <button
                  onClick={() => handlePillClick('project-update')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'project-update'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Project Update
                </button>
                <button
                  onClick={() => handlePillClick('invoice-payment')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'invoice-payment'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Invoice Payment
                </button>
                <button
                  onClick={() => handlePillClick('general-inquiry')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'general-inquiry'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  General Inquiry
                </button>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="rounded-xl bg-black border border-slate-600 p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">Formality</label>
                      <span className="text-xs text-muted-foreground">{formality}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formality}
                      onChange={(e) => setFormality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${formality}%, #4b5563 ${formality}%, #4b5563 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Casual</span>
                      <span>Informal</span>
                      <span>Neutral</span>
                      <span>Formal</span>
                      <span>Institutional</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">Directness</label>
                      <span className="text-xs text-muted-foreground">{directness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={directness}
                      onChange={(e) => setDirectness(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${directness}%, #4b5563 ${directness}%, #4b5563 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Indirect</span>
                      <span>Diplomatic</span>
                      <span>Clear</span>
                      <span>Direct</span>
                      <span>Blunt</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">Emotions</label>
                      <span className="text-xs text-muted-foreground">{emotion}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={emotion}
                      onChange={(e) => setEmotion(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${emotion}%, #4b5563 ${emotion}%, #4b5563 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span>Contained</span>
                      <span>Attentive</span>
                      <span>Sensitive</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Power Relation</label>
                    <select
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="superior">Speaking to subordinate</option>
                      <option value="equal">Speaking to equal</option>
                      <option value="subordinate">Speaking to superior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Medium</label>
                    <select
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="email">Email</option>
                      <option value="chat">Chat</option>
                      <option value="in-person">In-person</option>
                      <option value="written-notice">Written notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Cultural Context</label>
                    <select
                      value={culture}
                      onChange={(e) => setCulture(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="us">North America</option>
                      <option value="uk">United Kingdom</option>
                      <option value="europe">Europe</option>
                      <option value="asia">Asia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Language</label>
                    <select
                      value={locale}
                      onChange={(e) => {
                        window.location.href = `/${e.target.value}/follow-up-email-no-response`;
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Output - shown immediately */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Professional Follow-Up
              </label>
              <div className="w-full p-4 rounded-xl bg-slate-700 backdrop-blur border border-slate-600 text-white">
                <p className="text-white text-sm whitespace-pre-line leading-relaxed">{outputText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border bg-slate-900/50">
        <div className="container py-6">
          <p className="text-center text-muted-foreground text-sm">
            Trusted by professionals who know that how you follow up matters as much as the original message
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-20 bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Real Follow-Up Examples
          </h2>
          
          <div className="space-y-8">
            {beforeAfterExamples.map((example, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">What You're Thinking</div>
                  <p className="text-slate-300">{example.before}</p>
                </div>
                <div className="border-t border-slate-800"></div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">Professional Follow-Up</div>
                  <p className="text-white mb-4">{example.after}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Formality
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.formality}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Directness
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.directness}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Emotions
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.emotion}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Power Relation
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.power}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Cultural Context
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.culture}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Medium
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.medium}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        Language
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Follow-Up Matters */}
      <section className="py-20 border-t border-border bg-slate-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Why Professional Follow-Ups Get Better Results
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            When you don't get a response, frustration is natural. But how you follow up can make or break the relationship.
          </p>

          <div className="space-y-2 text-left max-w-xl mx-auto mb-6">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Frustrated or accusatory follow-ups can damage professional relationships permanently</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">People often don't reply because they're busy, not because they're ignoring you</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">A polite, understanding follow-up actually increases response rates by giving people an easy out</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">The right tone shows professionalism and emotional intelligence, making people want to work with you</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            <Link href={`/${locale}`} className="text-primary hover:underline">
              Sentenly
            </Link>{' '}
            helps you strike the perfect balance between persistence and politeness, so you get the response you need without burning bridges.
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Start Writing Better Follow-Ups
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Get responses without being pushy with our professional email tools
          </p>
          <Button asChild variant="hero" size="xl">
            <Link href={`/${locale}/translate`}>
              Try Sentenly Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Footer Text */}
      <section className="py-12 border-t border-border bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            Write professional follow-up emails when you haven't received a response with Sentenly's AI-powered email tool. Whether you're following up on a job application, client proposal, meeting request, project update, overdue invoice, or general inquiry, our tool helps you transform frustrated messages into polite, professional reminders that get results. Adjust formality, directness, and tone to match your relationship and cultural context. Perfect for business professionals, freelancers, job seekers, and anyone who needs to follow up without sounding pushy or desperate. Get the response you need while maintaining professional relationships.
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 bg-slate-900">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <Image
                  src="/logo.svg"
                  alt="Sentenly Logo"
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">Sentenly</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              <Link href={`/${locale}/privacy`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Privacy
              </Link>
              <Link href={`/${locale}/terms`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Terms
              </Link>
              <Link href={`/${locale}/contact`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                Contact
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © 2026 Sentenly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
