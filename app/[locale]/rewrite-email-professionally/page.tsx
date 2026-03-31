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
  const [selectedPill, setSelectedPill] = useState<string | null>('professional');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [formality, setFormality] = useState(70);
  const [directness, setDirectness] = useState(50);
  const [emotion, setEmotion] = useState(30);
  const [power, setPower] = useState('equal');
  const [culture, setCulture] = useState('us');
  const [medium, setMedium] = useState('email');
  const [inputText, setInputText] = useState('send contract for signing asap otherwise I run into financial difficulties.');

  // Rotating text effect: show example for 10s, placeholder for 2s
  useEffect(() => {
    if (selectedPill !== 'custom') {
      let timeout1: NodeJS.Timeout;
      let timeout2: NodeJS.Timeout;

      const runCycle = () => {
        // Show example text for 10 seconds
        setInputText('send contract for signing asap otherwise I run into financial difficulties.');
        
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
    }
  }, [selectedPill]);

  const scenarioOutputs: Record<string, string> = {
    'custom': `Your customized message will appear here based on your own input and customized tone and language settings.`,
    'professional': `Hi [Recipient's Name],

Could you please send me the file at your earliest convenience? 
The delay is causing some issues, and I would appreciate your prompt attention to this matter.

Thank you,  
[Your Name]`,
    'talk-to-boss': `Hi [Manager's Name],

I wanted to follow up on the file I requested. Could you please send it when you have a chance? 
I'm encountering some blockers without it, and would appreciate your help moving this forward.

Thank you for your time,  
[Your Name]`,
    'customer-complaint': `Dear [Client's Name],

Thank you for your patience. I wanted to reach out regarding the file we discussed. 

I understand there may have been some delays, and I sincerely apologize for any inconvenience this may have caused. Could you please send the file at your earliest convenience? This will help us resolve the matter promptly and ensure we meet your expectations.

I truly appreciate your cooperation and understanding.

Best regards,  
[Your Name]`,
    'reject-politely': `Hi [Recipient's Name],

I hope this message finds you well. I wanted to reach out regarding the file request.

I understand this may be taking longer than expected, and I truly appreciate your patience. Would it be possible to send the file when you have a moment? I would be very grateful for your assistance.

Thank you so much for your understanding,  
[Your Name]`,
    'follow-up-email': `Hi [Recipient's Name],

I hope you're doing well! I wanted to reach out about the file I requested earlier.

I know things can get busy, but I'd really appreciate it if you could send it over when you get a chance. It would help me move forward with the project.

Thanks so much!  
[Your Name]`
  };

  const outputText = scenarioOutputs[selectedPill || 'professional'];

  const scenarioTitles: Record<string, string> = {
    'custom': 'Custom',
    'professional': 'Professional',
    'talk-to-boss': 'Talk to boss',
    'customer-complaint': 'Client complaint',
    'reject-politely': 'Polite request',
    'follow-up-email': 'Follow-up'
  };

  const scenarioSettings: Record<string, { formality: number; directness: number; emotion: number; power: string; culture: string; medium: string }> = {
    'custom': { formality: 50, directness: 50, emotion: 50, power: 'equal', culture: 'us', medium: 'email' },
    'professional': { formality: 70, directness: 50, emotion: 30, power: 'equal', culture: 'us', medium: 'email' },
    'talk-to-boss': { formality: 70, directness: 60, emotion: 30, power: 'subordinate', culture: 'us', medium: 'email' },
    'customer-complaint': { formality: 75, directness: 60, emotion: 25, power: 'equal', culture: 'europe', medium: 'email' },
    'reject-politely': { formality: 75, directness: 25, emotion: 50, power: 'equal', culture: 'uk', medium: 'email' },
    'follow-up-email': { formality: 60, directness: 50, emotion: 40, power: 'equal', culture: 'asia', medium: 'email' }
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
      setInputText('send contract for signing asap otherwise I run into financial difficulties.');
    }
  };

  const beforeAfterExamples = [
    {
      before: "This is wrong. Fix it.",
      after: "I believe there may be an issue here. Could you please take another look?",
      settings: {
        formality: 75,
        directness: 45,
        emotion: 20,
        power: "Speaking to equal",
        culture: "United States",
        medium: "Email",
        language: "English"
      }
    },
    {
      before: "Why didn't you reply?",
      after: "I just wanted to follow up on my previous message.",
      settings: {
        formality: 60,
        directness: 40,
        emotion: 40,
        power: "Speaking to equal",
        culture: "United States",
        medium: "Email",
        language: "English"
      }
    },
    {
      before: "I can't do this.",
      after: "Unfortunately, I won't be able to take this on at the moment.",
      settings: {
        formality: 70,
        directness: 50,
        emotion: 30,
        power: "Speaking to equal",
        culture: "United States",
        medium: "Email",
        language: "English"
      }
    }
  ];
  
  return (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-background">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
        
        <div className="container py-16 md:py-24 relative max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-primary">Rewrite Any Email</span>
              <br />
              <span className="text-white">Professionally — Instantly</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Turn informal, unclear, or rough messages into clear, professional communication.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No prompts. No rewriting from scratch. Just paste and improve.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Avoid sounding rude, unclear, or unprofessional — without overthinking your words.
            </p>
          </div>

          {/* Input/Output Demo */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your message</label>
              <textarea
                className="w-full h-24 p-4 rounded-xl bg-slate-700 backdrop-blur border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-base"
                value={inputText}
                placeholder="Write your intent or paste your message here"
                onChange={(e) => setInputText(e.target.value)}
                readOnly={selectedPill !== 'custom'}
              />
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button variant="orange" size="xl" className="w-full sm:w-auto pointer-events-none">
                Improve message instantly
              </Button>
            </div>

            {/* Scenario Switcher */}
            <div className="pt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Start with shortcut or set manually
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Use a scenario for a quick start — or fine-tune everything yourself below.
              </p>
              <div className="flex flex-col items-start gap-2">
                <button
                  onClick={() => handlePillClick('custom')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'custom'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Custom
                </button>
                <button
                  onClick={() => handlePillClick('professional')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'professional'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Professional
                </button>
                <button
                  onClick={() => handlePillClick('talk-to-boss')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'talk-to-boss'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Talk to boss
                </button>
                <button
                  onClick={() => handlePillClick('customer-complaint')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'customer-complaint'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Client complaint
                </button>
                <button
                  onClick={() => handlePillClick('reject-politely')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'reject-politely'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Polite request
                </button>
                <button
                  onClick={() => handlePillClick('follow-up-email')}
                  className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPill === 'follow-up-email'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Follow-up
                </button>
              </div>
            </div>

            {/* Output - shown immediately */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Improved version
              </label>
              <div className="w-full p-4 rounded-xl bg-slate-700 backdrop-blur border border-slate-600 text-white">
                <p className="text-white text-base whitespace-pre-line leading-relaxed">{outputText}</p>
              </div>
            </div>

            {/* Advanced Controls (modal trigger) */}
            <div className="pt-4">
              <button
                onClick={() => setIsAdvancedModalOpen(true)}
                className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors mx-auto"
              >
                <span className="text-base filter brightness-125 saturate-150">⚙️</span>
                <span>Fine-tune your message</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border bg-slate-900/50">
        <div className="container py-6">
          <p className="text-center text-muted-foreground text-sm">
            Used for emails, feedback, complaints, and difficult conversations
          </p>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-20 bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            See how it works
          </h2>
          
          <div className="space-y-8">
            {beforeAfterExamples.map((example, i) => (
              <div
                key={i}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-2">BEFORE:</div>
                  <p className="text-slate-300">{example.before}</p>
                </div>
                <div className="border-t border-slate-800"></div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">AFTER:</div>
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

      {/* Why Tone Matters */}
      <section className="py-20 border-t border-border bg-slate-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Why tone matters
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            The same message can sound:
          </p>

          <div className="space-y-2 text-left max-w-xl mx-auto mb-6">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">rude</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">ignored</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">or respected</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            — depending only on tone.
          </p>

          <p className="text-lg text-white font-medium">
            <Link href={`/${locale}/translate`} className="text-primary hover:underline">
              Sentenly
            </Link>{' '}
            helps you get it right.
          </p>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Rewrite your message now
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Used for everyday emails and high-stakes conversations alike
          </p>
          <Button asChild variant="hero" size="xl">
            <Link href={`/${locale}/translate`}>
              Start writing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Footer Text */}
      <section className="py-12 border-t border-border bg-slate-950">
        <div className="container max-w-4xl mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            This tool helps you rewrite emails professionally, improve tone, and communicate clearly in any situation. 
            Whether you're writing to a colleague, a client, or your manager, you can adjust your message to be more polite, 
            more direct, or more structured.
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
