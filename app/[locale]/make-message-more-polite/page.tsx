"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowRight } from 'lucide-react';
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
  const [inputText, setInputText] = useState(t('makePolite.defaultInput'));
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
      setInputText(t('makePolite.defaultInput'));
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
    const inputMap: Record<string, string> = {
      'urgent-request': t('makePolite.inputs.urgentRequest'),
      'rejection': t('makePolite.inputs.rejection'),
      'complaint': t('makePolite.inputs.complaint'),
      'disagreement': t('makePolite.inputs.disagreement'),
      'deadline': t('makePolite.inputs.deadline'),
      'feedback': t('makePolite.inputs.feedback')
    };
    return inputMap[scenario] || t('makePolite.defaultInput');
  };

  const scenarioOutputs: Record<string, string> = {
    'urgent-request': t('makePolite.outputs.urgentRequest'),
    'rejection': t('makePolite.outputs.rejection'),
    'complaint': t('makePolite.outputs.complaint'),
    'disagreement': t('makePolite.outputs.disagreement'),
    'deadline': t('makePolite.outputs.deadline'),
    'feedback': t('makePolite.outputs.feedback')
  };

  const outputText = selectedPill ? scenarioOutputs[selectedPill] : t('makePolite.outputs.default');

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
      before: t('makePolite.examples.before1'),
      after: t('makePolite.examples.after1'),
      settings: {
        formality: 75,
        directness: 40,
        emotion: 35,
        power: t('makePolite.powerOptions.equal'),
        culture: t('makePolite.culturalOptions.us'),
        medium: t('demo.mediumOptions.email'),
        language: t('demo.languageOptions.english')
      }
    },
    {
      before: t('makePolite.examples.before2'),
      after: t('makePolite.examples.after2'),
      settings: {
        formality: 70,
        directness: 45,
        emotion: 40,
        power: t('makePolite.powerOptions.equal'),
        culture: t('makePolite.culturalOptions.us'),
        medium: t('demo.mediumOptions.email'),
        language: t('demo.languageOptions.english')
      }
    },
    {
      before: t('makePolite.examples.before3'),
      after: t('makePolite.examples.after3'),
      settings: {
        formality: 65,
        directness: 35,
        emotion: 45,
        power: t('makePolite.powerOptions.equal'),
        culture: t('makePolite.culturalOptions.us'),
        medium: t('demo.mediumOptions.email'),
        language: t('demo.languageOptions.english')
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
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
        
        <div className="container py-16 md:py-24 relative max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-primary block">{t('makePolite.title')}</span>
              <span className="text-white block mt-2">{t('makePolite.subtitle')}</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('makePolite.description1')}
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('makePolite.description2')}
            </p>
          </div>

          {/* Input/Output Demo */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('makePolite.inputLabel')}
              </label>
              <div className="rounded-xl bg-slate-700 backdrop-blur border border-slate-600 overflow-hidden">
                <div className="p-4">
                  <textarea
                    className="w-full h-20 bg-transparent text-white placeholder:text-slate-400 focus:outline-none resize-none text-sm"
                    value={inputText}
                    placeholder={t('makePolite.inputPlaceholder')}
                    onChange={(e) => setInputText(e.target.value)}
                    readOnly={selectedPill !== 'custom' && selectedPill !== null}
                  />
                </div>
              </div>
            </div>

            {/* Scenario Switcher */}
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                {t('makePolite.shortcutHelper')} <Link href={`/${locale}`} className="text-primary hover:underline">{t('makePolite.liveVersion')}</Link>
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
                  {t('makePolite.scenarios.urgentRequest')}
                </button>
                <button
                  onClick={() => handlePillClick('rejection')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'rejection'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('makePolite.scenarios.rejection')}
                </button>
                <button
                  onClick={() => handlePillClick('complaint')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'complaint'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('makePolite.scenarios.complaint')}
                </button>
                <button
                  onClick={() => handlePillClick('disagreement')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'disagreement'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('makePolite.scenarios.disagreement')}
                </button>
                <button
                  onClick={() => handlePillClick('deadline')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'deadline'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('makePolite.scenarios.deadline')}
                </button>
                <button
                  onClick={() => handlePillClick('feedback')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'feedback'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('makePolite.scenarios.feedback')}
                </button>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="rounded-xl bg-black border border-slate-600 p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('makePolite.controls.formality')}</label>
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
                      <span>{t('demo.formalityLevels.casual')}</span>
                      <span>{t('demo.formalityLevels.informal')}</span>
                      <span>{t('demo.formalityLevels.neutral')}</span>
                      <span>{t('demo.formalityLevels.formal')}</span>
                      <span>{t('demo.formalityLevels.institutional')}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('makePolite.controls.directness')}</label>
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
                      <span>{t('demo.directnessLevels.indirect')}</span>
                      <span>{t('demo.directnessLevels.diplomatic')}</span>
                      <span>{t('demo.directnessLevels.clear')}</span>
                      <span>{t('demo.directnessLevels.direct')}</span>
                      <span>{t('demo.directnessLevels.blunt')}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('makePolite.controls.emotions')}</label>
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
                      <span>{t('demo.emotionLevels.low')}</span>
                      <span>{t('demo.emotionLevels.contained')}</span>
                      <span>{t('demo.emotionLevels.attentive')}</span>
                      <span>{t('demo.emotionLevels.sensitive')}</span>
                      <span>{t('demo.emotionLevels.high')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('makePolite.controls.powerRelation')}</label>
                    <select
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="superior">{t('makePolite.powerOptions.superior')}</option>
                      <option value="equal">{t('makePolite.powerOptions.equal')}</option>
                      <option value="subordinate">{t('makePolite.powerOptions.subordinate')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('makePolite.controls.medium')}</label>
                    <select
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="email">{t('demo.mediumOptions.email')}</option>
                      <option value="chat">{t('demo.mediumOptions.chat')}</option>
                      <option value="in-person">{t('demo.mediumOptions.inPerson')}</option>
                      <option value="written-notice">{t('demo.mediumOptions.writtenNotice')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('makePolite.controls.culturalContext')}</label>
                    <select
                      value={culture}
                      onChange={(e) => setCulture(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="us">{t('makePolite.culturalOptions.us')}</option>
                      <option value="uk">{t('makePolite.culturalOptions.uk')}</option>
                      <option value="europe">{t('makePolite.culturalOptions.europe')}</option>
                      <option value="asia">{t('makePolite.culturalOptions.asia')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('makePolite.controls.language')}</label>
                    <select
                      value={locale}
                      onChange={(e) => {
                        window.location.href = `/${e.target.value}/make-message-more-polite`;
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">{t('demo.languageOptions.english')}</option>
                      <option value="es">{t('demo.languageOptions.spanish')}</option>
                      <option value="fr">{t('demo.languageOptions.french')}</option>
                      <option value="de">{t('demo.languageOptions.german')}</option>
                      <option value="it">{t('demo.languageOptions.italian')}</option>
                      <option value="pt">{t('demo.languageOptions.portuguese')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Output - shown immediately */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('makePolite.outputLabel')}
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
            {t('makePolite.socialProof')}
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-20 bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            {t('makePolite.examplesTitle')}
          </h2>
          
          <div className="space-y-8">
            {beforeAfterExamples.map((example, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">{t('makePolite.exampleLabels.directMessage')}</div>
                  <p className="text-slate-300">{example.before}</p>
                </div>
                <div className="border-t border-slate-800"></div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">{t('makePolite.exampleLabels.politeVersion')}</div>
                  <p className="text-white mb-4">{example.after}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.formality')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.formality}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.directness')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.directness}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.emotions')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.emotion}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.powerRelation')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.power}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.culturalContext')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.culture}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.medium')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.medium}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('makePolite.controls.language')}
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
            {t('makePolite.whyTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {t('makePolite.whyDescription')}
          </p>

          <div className="space-y-2 text-left max-w-xl mx-auto mb-6">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('makePolite.whyPoints.point1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('makePolite.whyPoints.point2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('makePolite.whyPoints.point3')}</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            <Link href={`/${locale}`} className="text-primary hover:underline">
              {t('common.appName')}
            </Link>{' '}
            {t('makePolite.whyConclusion')}
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('makePolite.ctaTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {t('makePolite.ctaDescription')}
          </p>
          <Button asChild variant="hero" size="xl">
            <Link href={`/${locale}/translate`}>
              {t('makePolite.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Footer Text */}
      <section className="py-12 border-t border-border bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            {t('makePolite.seoDescription')}
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
              <span className="text-sm text-muted-foreground">{t('common.appName')}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              <Link href={`/${locale}/privacy`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('makePolite.footer.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('makePolite.footer.terms')}
              </Link>
              <Link href={`/${locale}/contact`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('makePolite.footer.contact')}
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              {t('makePolite.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
