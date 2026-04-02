"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RewriteEmailProfessionallyPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [formality, setFormality] = useState(50);
  const [directness, setDirectness] = useState(50);
  const [emotion, setEmotion] = useState(50);
  const [power, setPower] = useState('equal');
  const [culture, setCulture] = useState('us');
  const [medium, setMedium] = useState('email');
  const [email, setEmail] = useState('abc@company.com');
  const [subject, setSubject] = useState('Contract - urgent');
  const [inputText, setInputText] = useState(t('demo.inputExample'));
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
      setInputText(t('demo.inputExample'));
      
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
      setInputText(t('demo.inputExample'));
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

  const scenarioOutputs: Record<string, string> = {
    'blunt': t('demo.pillMessages.blunt'),
    'direct': t('demo.pillMessages.direct'),
    'diplomatic': t('demo.pillMessages.diplomatic'),
    'personal': t('demo.pillMessages.personal'),
    'respectful': t('demo.pillMessages.respectful'),
    'escalation': t('demo.pillMessages.escalation'),
    'friendly': t('demo.pillMessages.friendly'),
    'formal-notice': t('demo.pillMessages.formalNotice')
  };

  const outputText = selectedPill ? scenarioOutputs[selectedPill] : t('demo.selectScenarioMessage');

  const scenarioTitles: Record<string, string> = {
    'custom': 'Custom',
    'professional': 'Professional',
    'talk-to-boss': 'Talk to boss',
    'customer-complaint': 'Client complaint',
    'reject-politely': 'Polite request',
    'follow-up-email': 'Follow-up'
  };

  const scenarioSettings: Record<string, { formality: number; directness: number; emotion: number; power: string; culture: string; medium: string }> = {
    'blunt': { formality: 20, directness: 90, emotion: 10, power: 'equal', culture: 'us', medium: 'email' },
    'direct': { formality: 50, directness: 80, emotion: 20, power: 'equal', culture: 'us', medium: 'email' },
    'diplomatic': { formality: 80, directness: 40, emotion: 30, power: 'equal', culture: 'europe', medium: 'email' },
    'personal': { formality: 40, directness: 60, emotion: 60, power: 'equal', culture: 'us', medium: 'email' },
    'respectful': { formality: 85, directness: 45, emotion: 25, power: 'subordinate', culture: 'asia', medium: 'email' },
    'escalation': { formality: 75, directness: 85, emotion: 20, power: 'superior', culture: 'us', medium: 'email' },
    'friendly': { formality: 30, directness: 50, emotion: 70, power: 'equal', culture: 'us', medium: 'email' },
    'formal-notice': { formality: 95, directness: 70, emotion: 10, power: 'equal', culture: 'uk', medium: 'email' }
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
      setInputText(t('demo.inputExample'));
    }
  };

  const beforeAfterExamples = [
    {
      before: t('rewriteEmail.example1Before'),
      after: t('rewriteEmail.example1After'),
      settings: {
        formality: 75,
        directness: 45,
        emotion: 20,
        power: t('rewriteEmail.powerSpeakingToEqual'),
        culture: t('rewriteEmail.culturalContextUS'),
        medium: t('rewriteEmail.mediumEmail'),
        language: t('rewriteEmail.languageEnglish')
      }
    },
    {
      before: t('rewriteEmail.example2Before'),
      after: t('rewriteEmail.example2After'),
      settings: {
        formality: 60,
        directness: 40,
        emotion: 40,
        power: t('rewriteEmail.powerSpeakingToEqual'),
        culture: t('rewriteEmail.culturalContextUS'),
        medium: t('rewriteEmail.mediumEmail'),
        language: t('rewriteEmail.languageEnglish')
      }
    },
    {
      before: t('rewriteEmail.example3Before'),
      after: t('rewriteEmail.example3After'),
      settings: {
        formality: 70,
        directness: 50,
        emotion: 30,
        power: t('rewriteEmail.powerSpeakingToEqual'),
        culture: t('rewriteEmail.culturalContextUS'),
        medium: t('rewriteEmail.mediumEmail'),
        language: t('rewriteEmail.languageEnglish')
      }
    }
  ];
  
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `https://sentenly.com/${locale}/rewrite-email-professionally#webapp`,
        "name": "Sentenly Email Rewriter",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Professional email rewriting tool that adjusts tone, formality, and directness based on cultural context and power dynamics.",
        "url": `https://sentenly.com/${locale}/rewrite-email-professionally`,
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
        "@id": `https://sentenly.com/${locale}/rewrite-email-professionally#howto`,
        "name": "How to Rewrite Emails Professionally",
        "description": "Learn how to transform informal messages into professional communication using tone adjustments.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Enter your message",
            "text": "Write or paste your email message into the text field."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Choose a scenario",
            "text": "Select a pre-configured scenario like 'diplomatic', 'formal', or 'direct' to instantly adjust the tone."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Fine-tune settings",
            "text": "Adjust formality, directness, emotions, power relation, and cultural context to match your specific needs."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Review the improved version",
            "text": "See the professionally rewritten message that maintains your intent while improving clarity and tone."
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `https://sentenly.com/${locale}/rewrite-email-professionally#webpage`,
        "url": `https://sentenly.com/${locale}/rewrite-email-professionally`,
        "name": "Rewrite Email Professionally in Seconds | Sentenly",
        "description": "Turn informal, unclear, or rough messages into clear, professional communication. Adjust tone, formality, and style instantly.",
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
            "urlTemplate": `https://sentenly.com/${locale}/rewrite-email-professionally`,
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-primary">{t('rewriteEmail.title')}</span>
              <br />
              <span className="text-white inline-block mt-3">{t('rewriteEmail.subtitle')}</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('rewriteEmail.description1')}
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('rewriteEmail.description2')}
            </p>
          </div>

          {/* Input/Output Demo */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Email Form */}
            <div className="rounded-xl bg-slate-700 backdrop-blur border border-slate-600 overflow-hidden">
              {/* Email To Line */}
              <div className="px-4 py-2 text-slate-400 text-sm">
                <span className="text-slate-400">{t('rewriteEmail.emailTo')}</span> {email}
              </div>
              
              {/* Subject Input */}
              <div className="px-4 py-2 flex items-center gap-2 border-t border-slate-600">
                <span className="text-slate-400 text-sm">{t('rewriteEmail.subject')}</span>
                <span className="text-slate-400 text-sm">{subject}</span>
              </div>
              
              {/* Double Line Separator */}
              <div className="border-t-2 border-double border-slate-600"></div>
              
              {/* Body */}
              <div className="p-4">
                <textarea
                  className="w-full h-16 bg-transparent text-white placeholder:text-slate-400 focus:outline-none resize-none text-sm"
                  value={inputText}
                  placeholder={t('rewriteEmail.bodyPlaceholder')}
                  onChange={(e) => setInputText(e.target.value)}
                  readOnly={selectedPill !== 'custom'}
                />
              </div>
            </div>

            {/* Scenario Switcher */}
            <div>
              <p className="text-xs text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: t.raw('demo.shortcutLabel') }} />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePillClick('blunt')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'blunt'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioBlunt')}
                </button>
                <button
                  onClick={() => handlePillClick('direct')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'direct'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioDirect')}
                </button>
                <button
                  onClick={() => handlePillClick('diplomatic')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'diplomatic'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioDiplomatic')}
                </button>
                <button
                  onClick={() => handlePillClick('personal')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'personal'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioPersonal')}
                </button>
                <button
                  onClick={() => handlePillClick('respectful')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'respectful'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioRespectful')}
                </button>
                <button
                  onClick={() => handlePillClick('escalation')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'escalation'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioEscalation')}
                </button>
                <button
                  onClick={() => handlePillClick('friendly')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'friendly'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioFriendly')}
                </button>
                <button
                  onClick={() => handlePillClick('formal-notice')}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedPill === 'formal-notice'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  {t('demo.scenarioFormalNotice')}
                </button>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="rounded-xl bg-black border border-slate-600 p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side - Sliders */}
                <div className="space-y-3">
                  {/* Formality */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('demo.formality')}</label>
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

                  {/* Directness */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('demo.directness')}</label>
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

                  {/* Emotions */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-foreground">{t('demo.emotions')}</label>
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

                {/* Right Side - Dropdowns */}
                <div className="space-y-3">
                  {/* Power Relation */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('demo.powerRelation')}</label>
                    <select
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="superior">{t('demo.powerOptions.superior')}</option>
                      <option value="equal">{t('demo.powerOptions.equal')}</option>
                      <option value="subordinate">{t('demo.powerOptions.inferior')}</option>
                    </select>
                  </div>

                  {/* Medium */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('demo.medium')}</label>
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

                  {/* Cultural Context */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('demo.culturalContext')}</label>
                    <select
                      value={culture}
                      onChange={(e) => setCulture(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="us">{t('demo.cultureOptions.northAmerica')}</option>
                      <option value="uk">{t('demo.cultureOptions.unitedKingdom')}</option>
                      <option value="europe">{t('demo.cultureOptions.europe')}</option>
                      <option value="asia">{t('demo.cultureOptions.asia')}</option>
                    </select>
                  </div>

                  {/* Translate to */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t('demo.translateTo')}</label>
                    <select
                      value={locale}
                      onChange={(e) => {
                        // Navigate to the new locale
                        window.location.href = `/${e.target.value}/rewrite-email-professionally`;
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">{t('demo.languageOptions.english')}</option>
                      <option value="es">{t('demo.languageOptions.spanish')}</option>
                      <option value="fr">{t('demo.languageOptions.french')}</option>
                      <option value="de">{t('demo.languageOptions.german')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Output - shown immediately */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('rewriteEmail.improvedVersion')}
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
            {t('rewriteEmail.socialProof')}
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-20 bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            {t('rewriteEmail.howItWorksTitle')}
          </h2>
          
          <div className="space-y-8">
            {beforeAfterExamples.map((example, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">{t('rewriteEmail.before')}</div>
                  <p className="text-slate-300">{example.before}</p>
                </div>
                <div className="border-t border-slate-800"></div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">{t('rewriteEmail.after')}</div>
                  <p className="text-white mb-4">{example.after}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelFormality')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.formality}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelDirectness')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.directness}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelEmotions')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.emotion}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelPowerRelation')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.power}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelCulturalContext')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.culture}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelMedium')}
                      </span>
                      <span className="text-xs text-slate-400">{example.settings.medium}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                        {t('rewriteEmail.labelLanguage')}
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

      {/* Why Tone Matters */}
      <section className="py-20 border-t border-border bg-slate-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('rewriteEmail.whyToneMattersTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {t('rewriteEmail.whyToneMattersDescription')}
          </p>

          <div className="space-y-2 text-left max-w-xl mx-auto mb-6">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('rewriteEmail.toneMattersList1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('rewriteEmail.toneMattersList2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">{t('rewriteEmail.toneMattersList3')}</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            {t('rewriteEmail.toneMattersEnding')}
          </p>

          <p className="text-lg text-white font-medium">
            <Link href={`/${locale}/translate`} className="text-primary hover:underline">
              {t('common.appName')}
            </Link>{' '}
            {t('rewriteEmail.toneMattersConclusion')}
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('rewriteEmail.ctaTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {t('rewriteEmail.ctaDescription')}
          </p>
          <Button asChild variant="hero" size="xl">
            <Link href={`/${locale}/translate`}>
              {t('rewriteEmail.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Footer Text */}
      <section className="py-12 border-t border-border bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            {t('rewriteEmail.seoFooterText')}
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
                {t('common.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('common.terms')}
              </Link>
              <Link href={`/${locale}/contact`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {t('common.contact')}
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © 2026 {t('common.appName')}. {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>

      {/* Advanced Settings Modal */}
      <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Fine-tune your message</DialogTitle>
            <p className="text-sm text-muted-foreground pt-2">
              Adjust these settings to customize the tone and style of your message.
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Formality */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Formality</label>
                <span className="text-xs text-muted-foreground">{formality}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formality}
                onChange={(e) => setFormality(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Directness */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Directness</label>
                <span className="text-xs text-muted-foreground">{directness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={directness}
                onChange={(e) => setDirectness(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Emotion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">Emotion</label>
                <span className="text-xs text-muted-foreground">{emotion}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emotion}
                onChange={(e) => setEmotion(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Power relation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Power relation</label>
              <select
                value={power}
                onChange={(e) => setPower(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="superior">Speaking to subordinate</option>
                <option value="equal">Speaking to equal</option>
                <option value="subordinate">Speaking to superior</option>
              </select>
            </div>

            {/* Cultural Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cultural Context</label>
              <select
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
              </select>
            </div>

            {/* Communication type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Communication type</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="email">Email</option>
                <option value="chat">Chat</option>
                <option value="in-person">In-person</option>
                <option value="written-notice">Written notice</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
