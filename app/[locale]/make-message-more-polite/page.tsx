"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MakeMessageMorePolitePage() {
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
  const [inputText, setInputText] = useState('We need this done by tomorrow. No exceptions.');
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
      setInputText('We need this done by tomorrow. No exceptions.');
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
      'urgent-request': 'I need the report now.',
      'rejection': "No, we can't do that.",
      'complaint': 'This is unacceptable and needs to be fixed immediately.',
      'disagreement': "I don't agree with your approach at all.",
      'deadline': "You're late again. This has to stop.",
      'feedback': 'This work is not good enough.'
    };
    return examples[scenario] || 'We need this done by tomorrow. No exceptions.';
  };

  const scenarioOutputs: Record<string, string> = {
    'urgent-request': 'I would greatly appreciate it if you could prioritize the report and share it at your earliest convenience. Thank you for your understanding.',
    'rejection': 'Thank you for the suggestion. After careful consideration, we believe this approach may not align with our current objectives. Perhaps we could explore alternative solutions together?',
    'complaint': 'I wanted to bring to your attention some concerns regarding the current situation. Would it be possible to discuss potential improvements at your earliest convenience?',
    'disagreement': "I appreciate your perspective on this. I'd like to share an alternative viewpoint that might complement the discussion. Could we explore both approaches together?",
    'deadline': "I noticed the timeline hasn't been met as expected. I understand things come up, and I'd appreciate if we could discuss how to stay on track moving forward.",
    'feedback': 'Thank you for your effort on this. I believe there are some areas where we could enhance the quality together. Would you be open to discussing some suggestions?'
  };

  const outputText = selectedPill ? scenarioOutputs[selectedPill] : "I hope this message finds you well. I wanted to reach out regarding the timeline for this project. If possible, I would greatly appreciate your assistance in completing this by tomorrow. I understand this may be a tight deadline, and I'm happy to discuss if you need any support or clarification. Thank you so much for your understanding and cooperation.";

  const scenarioSettings: Record<string, { formality: number; directness: number; emotion: number; power: string; culture: string; medium: string }> = {
    'urgent-request': { formality: 75, directness: 50, emotion: 30, power: 'equal', culture: 'us', medium: 'email' },
    'rejection': { formality: 80, directness: 35, emotion: 40, power: 'equal', culture: 'us', medium: 'email' },
'complaint': { formality: 85, directness: 40, emotion: 35, power: 'subordinate', culture: 'us', medium: 'email' },
    'disagreement': { formality: 75, directness: 45, emotion: 45, power: 'equal', culture: 'us', medium: 'email' },
    'deadline': { formality: 70, directness: 50, emotion: 40, power: 'superior', culture: 'us', medium: 'email' },
    'feedback': { formality: 70, directness: 45, emotion: 50, power: 'superior', culture: 'us', medium: 'email' }
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
      before: "\"No, that won't work.\"",
      after: '"Thank you for the suggestion. After reviewing this carefully, I believe we may need to explore alternative approaches. Would you be open to discussing other options?"',
      settings: {
        formality: 75,
        directness: 40,
        emotion: 35,
        power: 'Speaking to equal',
        culture: 'US',
        medium: 'Email',
        language: 'English'
      }
    },
    {
      before: '"You need to fix this ASAP."',
      after: '"I wanted to bring to your attention an issue that requires our attention. Would it be possible to prioritize resolving this when you have a moment? I appreciate your help with this."',
      settings: {
        formality: 70,
        directness: 45,
        emotion: 40,
        power: 'Speaking to equal',
        culture: 'US',
        medium: 'Email',
        language: 'English'
      }
    },
    {
      before: '"This is wrong."',
      after: '"I noticed something that might need review. Could we take another look at this together to ensure everything aligns with our objectives?"',
      settings: {
        formality: 65,
        directness: 35,
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
        "@id": `https://sentenly.com/${locale}/make-message-more-polite#webapp`,
        "name": "Sentenly Polite Message Rewriter",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Transform direct or blunt messages into polite, professional communication with adjustable tone and formality settings.",
        "url": `https://sentenly.com/${locale}/make-message-more-polite`,
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "2847"
        }
      },
      {
        "@type": "HowTo",
        "@id": `https://sentenly.com/${locale}/make-message-more-polite#howto`,
        "name": "How to Make Messages More Polite",
        "description": "Learn how to transform direct or blunt messages into polite, professional communication.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Enter your message",
            "text": "Type or paste the message you want to make more polite."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Choose a scenario",
            "text": "Select a pre-configured scenario like 'urgent request', 'rejection', or 'disagreement' to adjust the politeness level."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Fine-tune settings",
            "text": "Adjust formality, directness, and emotions to achieve the perfect level of politeness for your context."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Review the polite version",
            "text": "See your message transformed into a more polite version that maintains your core intent while improving tone."
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://sentenly.com/${locale}/make-message-more-polite#breadcrumb`,
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
            "name": "Make Message More Polite",
            "item": `https://sentenly.com/${locale}/make-message-more-polite`
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `https://sentenly.com/${locale}/make-message-more-polite#webpage`,
        "url": `https://sentenly.com/${locale}/make-message-more-polite`,
        "name": "Make Message More Polite - Professional Tone Adjustment | Sentenly",
        "description": "Transform direct or blunt messages into polite, professional communication instantly.",
        "inLanguage": locale,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://sentenly.com/#website",
          "name": "Sentenly",
          "url": "https://sentenly.com"
        },
        "breadcrumb": {
          "@id": `https://sentenly.com/${locale}/make-message-more-polite#breadcrumb`
        },
        "potentialAction": {
          "@type": "UseAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `https://sentenly.com/${locale}/make-message-more-polite`,
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
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container pt-4 pb-2">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link 
              href={`/${locale}`} 
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4" />
          </li>
          <li className="text-foreground font-medium" aria-current="page">
            Make Message More Polite
          </li>
        </ol>
      </nav>
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
        
        <div className="container py-16 md:py-24 relative max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-primary">Make Your Message</span>
              <br />
              <span className="text-white">More Polite & Professional</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sometimes you need to deliver tough messages without sounding harsh. Transform direct or blunt communication into polite, professional language that maintains your intent while improving tone.
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you're rejecting a proposal, delivering feedback, or making an urgent request, get the right balance of politeness and clarity.
            </p>
          </div>

          {/* Input/Output Demo */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Direct Message
              </label>
              <div className="rounded-xl bg-slate-700 backdrop-blur border border-slate-600 overflow-hidden">
                <div className="p-4">
                  <textarea
                    className="w-full h-20 bg-transparent text-white placeholder:text-slate-400 focus:outline-none resize-none text-sm"
                    value={inputText}
                    placeholder="Enter your direct message here..."
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
                  onClick={() => handlePillClick('urgent-request')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'urgent-request'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Urgent Request
                </button>
                <button
                  onClick={() => handlePillClick('rejection')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'rejection'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Polite Rejection
                </button>
                <button
                  onClick={() => handlePillClick('complaint')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'complaint'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Complaint
                </button>
                <button
                  onClick={() => handlePillClick('disagreement')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'disagreement'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Disagreement
                </button>
                <button
                  onClick={() => handlePillClick('deadline')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'deadline'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Deadline Reminder
                </button>
                <button
                  onClick={() => handlePillClick('feedback')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'feedback'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Critical Feedback
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
                        window.location.href = `/${e.target.value}/make-message-more-polite`;
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
                Polite Version
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
            Trusted by thousands of professionals to communicate with grace and clarity
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-20 bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Real Examples
          </h2>
          
          <div className="space-y-8">
            {beforeAfterExamples.map((example, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">Direct Message</div>
                  <p className="text-slate-300">{example.before}</p>
                </div>
                <div className="border-t border-slate-800"></div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">Polite Version</div>
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

      {/* Why Politeness Matters */}
      <section className="py-20 border-t border-border bg-slate-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Why Politeness Matters in Professional Communication
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            In business, how you say something can be just as important as what you say. The right tone builds trust, preserves relationships, and gets better results.
          </p>

          <div className="space-y-2 text-left max-w-xl mx-auto mb-6">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Direct messages can come across as aggressive or dismissive, even when that's not the intent</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">Polite phrasing shows respect and professionalism while still being clear and effective</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">The right balance of politeness and directness varies by culture, context, and relationship</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            <Link href={`/${locale}`} className="text-primary hover:underline">
              Sentenly
            </Link>{' '}
            helps you find that balance, ensuring your message is heard without causing unnecessary friction.
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Start Writing More Polite Messages
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Transform your communication with our full suite of tone adjustment tools
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
            Make your messages more polite with Sentenly's professional tone adjustment tool. Whether you need to soften a rejection, deliver critical feedback diplomatically, or make an urgent request without sounding demanding, our AI-powered message rewriter helps you strike the perfect balance between clarity and courtesy. Adjust formality, directness, and warmth to match your cultural context and relationship dynamics. Perfect for business emails, client communications, team feedback, and any situation where professional politeness matters.
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
