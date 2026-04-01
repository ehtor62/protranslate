"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ArrowRight, Languages, Sliders, Globe, FileText, Users, Loader2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [formality, setFormality] = useState(50);
  const [directness, setDirectness] = useState(50);
  const [emotion, setEmotion] = useState(50);
  const [power, setPower] = useState('equal');
  const [culture, setCulture] = useState('us');
  const [medium, setMedium] = useState('email');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);
  const [selectedFaqQuestion, setSelectedFaqQuestion] = useState<number | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Alternate between placeholder and example text: 7s for example, 2s for placeholder
  useEffect(() => {
    if (selectedPill) return; // Stop alternating when a pill is selected

    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const runCycle = () => {
      // Show example text for 7 seconds
      setShowPlaceholder(false);
      
      timeout1 = setTimeout(() => {
        // Switch to placeholder for 2 seconds
        setShowPlaceholder(true);
        
        timeout2 = setTimeout(() => {
          // Repeat the cycle
          runCycle();
        }, 2000);
      }, 7000);
    };

    runCycle();

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [selectedPill]);

  // Reset to default after 20 seconds when a pill is clicked
  useEffect(() => {
    if (!selectedPill) return; // Only set timeout when a pill is selected

    const resetTimeout = setTimeout(() => {
      // Reset all states to default
      setSelectedPill(null);
      setOutputText('');
      setIsLoading(false);
      setFormality(50);
      setDirectness(50);
      setEmotion(50);
      setPower('equal');
      setCulture('us');
      setMedium('email');
      setTargetLanguage('en');
      setShowPlaceholder(false);
    }, 20000);

    return () => {
      clearTimeout(resetTimeout);
    };
  }, [selectedPill]);

  const pillMessages: Record<string, string> = {
    'blunt': t('demo.pillMessages.blunt'),
    'direct': t('demo.pillMessages.direct'),
    'diplomatic': t('demo.pillMessages.diplomatic'),
    'personal': t('demo.pillMessages.personal'),
    'respectful': t('demo.pillMessages.respectful'),
    'escalation': t('demo.pillMessages.escalation'),
    'friendly': t('demo.pillMessages.friendly'),
    'formal-notice': t('demo.pillMessages.formalNotice')
  };

  const scenarioSettings: Record<string, { formality: number; directness: number; emotion: number; power: string; culture: string; medium: string }> = {
    'blunt': {
      formality: 10,  // Very informal
      directness: 95, // Very direct
      emotion: 20,    // Contained
      power: 'equal',
      culture: 'us',
      medium: 'text-message'
    },
    'direct': {
      formality: 40,  // Informal-Neutral
      directness: 80, // Direct
      emotion: 40,    // Attentive
      power: 'equal',
      culture: 'us',
      medium: 'email'
    },
    'diplomatic': {
      formality: 70,  // Formal
      directness: 30, // Diplomatic
      emotion: 50,    // Attentive
      power: 'equal',
      culture: 'uk',
      medium: 'email'
    },
    'personal': {
      formality: 30,  // Informal
      directness: 60, // Clear
      emotion: 75,    // Sensitive
      power: 'equal',
      culture: 'us',
      medium: 'text-message'
    },
    'respectful': {
      formality: 75,  // Formal
      directness: 40, // Diplomatic-Clear
      emotion: 60,    // Attentive
      power: 'subordinate',
      culture: 'asia',
      medium: 'email'
    },
    'escalation': {
      formality: 60,  // Neutral-Formal
      directness: 90, // Very Direct
      emotion: 30,    // Contained
      power: 'superior',
      culture: 'us',
      medium: 'email'
    },
    'friendly': {
      formality: 20,  // Informal
      directness: 70, // Direct
      emotion: 80,    // Sensitive
      power: 'equal',
      culture: 'us',
      medium: 'text-message'
    },
    'formal-notice': {
      formality: 90,  // Very Formal
      directness: 50, // Clear
      emotion: 20,    // Contained
      power: 'equal',
      culture: 'us',
      medium: 'written-notice'
    }
  };

  const handlePillClick = (pillId: string) => {
    setSelectedPill(pillId);
    setShowPlaceholder(pillId === 'custom'); // Show placeholder only for custom pill
    setOutputText('');
    
    // Update settings based on scenario
    const settings = scenarioSettings[pillId];
    if (settings) {
      setFormality(settings.formality);
      setDirectness(settings.directness);
      setEmotion(settings.emotion);
      setPower(settings.power);
      setCulture(settings.culture);
      setMedium(settings.medium);
    }
    
    // Trigger refinement after 1 second with animation
    setTimeout(() => {
      setButtonPulse(true);
      setTimeout(() => setButtonPulse(false), 600);
      
      // Start loading and show result after 3 seconds
      setIsLoading(true);
      setTimeout(() => {
        setOutputText(pillMessages[pillId]);
        setIsLoading(false);
      }, 3000);
    }, 1000);
  };

  const handleRefineMessage = () => {
    if (!selectedPill) return;
    
    setIsLoading(true);
    setOutputText('');
    
    setTimeout(() => {
      setOutputText(pillMessages[selectedPill]);
      setIsLoading(false);
    }, 3000);
  };
  
  const features = [
    {
      icon: Sliders,
      title: t('features.contextAware.title'),
      description: t('features.contextAware.description')
    },
    {
      icon: Globe,
      title: t('features.culturalCalibration.title'),
      description: t('features.culturalCalibration.description')
    },
    {
      icon: FileText,
      title: t('features.mediumSpecific.title'),
      description: t('features.mediumSpecific.description')
    },
    {
      icon: Users,
      title: t('features.powerDynamic.title'),
      description: t('features.powerDynamic.description')
    }
  ];

  const messageExamples = [
    t('messageTypes.termination'),
    t('messageTypes.rejection'),
    t('messageTypes.boundary'),
    t('messageTypes.negativeFeedback'),
    t('messageTypes.sayingNo'),
    t('messageTypes.withdrawing')
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-slate-900 to-background">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--gradient-hero)' }}
        />
        
        <div className="container py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
            {/* Left column - Text */}
            <div className="flex-1 space-y-8 pt-4">
              <div className="inline-flex items-center gap-2 py-1 text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
                <span className="text-primary">{t('hero.badgePart1')} <span className="text-white">{t('hero.badgePart2')}</span></span>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t.raw('hero.description') }}
              />
              
              <div className="flex flex-wrap gap-4 mt-12">
                <Button asChild variant="orange" size="xl">
                  <Link href={`/${locale}/translate`}>
                    {t('hero.ctaPrimary')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <a href="#how-it-works">{t('hero.ctaSecondary')}</a>
                </Button>
              </div>
            </div>
            
            {/* Right column - Input box and Settings */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t('demo.inputLabel')}</label>
                
                <div className="relative">
                  <textarea
                    className="w-full h-20 p-4 rounded-xl bg-slate-700 backdrop-blur border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
                    value={showPlaceholder ? '' : t('demo.inputExample')}
                    placeholder={showPlaceholder ? t('demo.inputPlaceholder') : ""}
                    readOnly
                  />
                </div>
                
                {/* Tone pills and Settings side by side */}
                <div className="mt-4 flex gap-4 items-end">
                  {/* Tone pills section */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2 leading-snug" dangerouslySetInnerHTML={{ __html: t('demo.shortcutLabelNoLink') }} />
                    <div className="flex flex-col items-start justify-between" style={{ gap: '0.625rem' }}>
                    <button
                      onClick={() => handlePillClick('blunt')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'blunt'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioBlunt')}
                    </button>
                    <button
                      onClick={() => handlePillClick('direct')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'direct'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioDirect')}
                    </button>
                    <button
                      onClick={() => handlePillClick('diplomatic')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'diplomatic'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioDiplomatic')}
                    </button>
                    <button
                      onClick={() => handlePillClick('personal')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'personal'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioPersonal')}
                    </button>
                    <button
                      onClick={() => handlePillClick('respectful')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'respectful'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioRespectful')}
                    </button>
                    <button
                      onClick={() => handlePillClick('escalation')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'escalation'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioEscalation')}
                    </button>
                    <button
                      onClick={() => handlePillClick('friendly')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'friendly'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioFriendly')}
                    </button>
                    <button
                      onClick={() => handlePillClick('formal-notice')}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer flex-shrink-0 ${
                        selectedPill === 'formal-notice'
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-primary/50 text-primary-foreground hover:bg-primary hover:scale-105'
                      }`}
                    >
                      {t('demo.scenarioFormalNotice')}
                    </button>
                  </div>
                </div>
                
                {/* Mini Settings Display */}
                <div className="w-[240px] flex-shrink-0">
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-600 rounded-xl p-3 space-y-2.5">
                  {/* Formality */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-foreground">{t('demo.formality')}</span>
                      <span className="text-xs text-primary">{formality}%</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer">
                    <div 
                      className="absolute h-full bg-primary transition-all duration-300 rounded-full pointer-events-none"
                      style={{ width: `${formality}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-slate-900 shadow-lg transition-all duration-300 pointer-events-none"
                      style={{ left: `calc(${formality}% - 6px)` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formality}
                      onChange={(e) => setFormality(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{t('demo.formalityLevels.casual')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.formalityLevels.informal')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.formalityLevels.neutral')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.formalityLevels.formal')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.formalityLevels.institutional')}</span>
                  </div>
                </div>

                {/* Directness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-foreground">{t('demo.directness')}</span>
                    <span className="text-xs text-primary">{directness}%</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer">
                    <div 
                      className="absolute h-full bg-primary transition-all duration-300 rounded-full pointer-events-none"
                      style={{ width: `${directness}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-slate-900 shadow-lg transition-all duration-300 pointer-events-none"
                      style={{ left: `calc(${directness}% - 6px)` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={directness}
                      onChange={(e) => setDirectness(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{t('demo.directnessLevels.indirect')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.directnessLevels.diplomatic')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.directnessLevels.clear')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.directnessLevels.direct')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.directnessLevels.blunt')}</span>
                  </div>
                </div>

                {/* Emotions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-foreground">{t('demo.emotions')}</span>
                    <span className="text-xs text-primary">{emotion}%</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer">
                    <div 
                      className="absolute h-full bg-primary transition-all duration-300 rounded-full pointer-events-none"
                      style={{ width: `${emotion}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-slate-900 shadow-lg transition-all duration-300 pointer-events-none"
                      style={{ left: `calc(${emotion}% - 6px)` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={emotion}
                      onChange={(e) => setEmotion(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{t('demo.emotionLevels.low')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.emotionLevels.contained')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.emotionLevels.attentive')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.emotionLevels.sensitive')}</span>
                    <span className="text-[9px] text-muted-foreground">{t('demo.emotionLevels.high')}</span>
                  </div>
                </div>

                {/* Power Relation and Medium in one row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground block mb-1.5">{t('demo.powerRelation')}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full text-[10px] px-2 py-1.5 bg-slate-700 rounded text-muted-foreground hover:bg-slate-600 transition-colors flex items-center justify-between">
                          <span>
                            {power === 'superior' ? t('demo.powerOptions.superior') : 
                             power === 'equal' ? t('demo.powerOptions.equal') : 
                             t('demo.powerOptions.inferior')}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[140px]">
                        <DropdownMenuItem onClick={() => setPower('superior')} className="text-xs">
                          {t('demo.powerOptions.superior')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPower('equal')} className="text-xs">
                          {t('demo.powerOptions.equal')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPower('inferior')} className="text-xs">
                          {t('demo.powerOptions.inferior')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground block mb-1.5">{t('demo.medium')}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full text-[10px] px-2 py-1.5 bg-slate-700 rounded text-muted-foreground hover:bg-slate-600 transition-colors flex items-center justify-between">
                          <span>
                            {medium === 'in-person' ? t('demo.mediumOptions.inPerson') :
                             medium === 'email' ? t('demo.mediumOptions.email') :
                             medium === 'text-message' ? t('demo.mediumOptions.textMessage') :
                             t('demo.mediumOptions.writtenNotice')}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[140px]">
                        <DropdownMenuItem onClick={() => setMedium('in-person')} className="text-xs">
                          {t('demo.mediumOptions.inPerson')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMedium('email')} className="text-xs">
                          {t('demo.mediumOptions.email')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMedium('text-message')} className="text-xs">
                          {t('demo.mediumOptions.textMessage')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMedium('written-notice')} className="text-xs">
                          {t('demo.mediumOptions.writtenNotice')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Cultural Context and Translate to in one row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground block mb-1.5">{t('demo.culturalContext')}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full text-[10px] px-2 py-1.5 bg-slate-700 rounded text-muted-foreground hover:bg-slate-600 transition-colors flex items-center justify-between">
                          <span>
                            {culture === 'us' ? t('demo.cultureOptions.northAmerica') :
                             culture === 'europe' ? t('demo.cultureOptions.europe') :
                             culture === 'asia' ? t('demo.cultureOptions.asia') :
                             culture === 'uk' ? t('demo.cultureOptions.europe') :
                             t('demo.cultureOptions.neutral')}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[140px]">
                        <DropdownMenuItem onClick={() => setCulture('us')} className="text-xs">
                          {t('demo.cultureOptions.northAmerica')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCulture('europe')} className="text-xs">
                          {t('demo.cultureOptions.europe')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCulture('asia')} className="text-xs">
                          {t('demo.cultureOptions.asia')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCulture('neutral')} className="text-xs">
                          {t('demo.cultureOptions.neutral')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-foreground block mb-1.5">{t('demo.translateTo')}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full text-[10px] px-2 py-1.5 bg-slate-700 rounded text-muted-foreground hover:bg-slate-600 transition-colors flex items-center justify-between">
                          <span>
                            {targetLanguage === 'en' ? t('demo.languageOptions.english') :
                             targetLanguage === 'es' ? t('demo.languageOptions.spanish') :
                             targetLanguage === 'fr' ? t('demo.languageOptions.french') :
                             targetLanguage === 'de' ? t('demo.languageOptions.german') :
                             targetLanguage === 'it' ? t('demo.languageOptions.italian') :
                             t('demo.languageOptions.portuguese')}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[140px]">
                        <DropdownMenuItem onClick={() => setTargetLanguage('en')} className="text-xs">
                          {t('demo.languageOptions.english')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTargetLanguage('es')} className="text-xs">
                          {t('demo.languageOptions.spanish')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTargetLanguage('fr')} className="text-xs">
                          {t('demo.languageOptions.french')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTargetLanguage('de')} className="text-xs">
                          {t('demo.languageOptions.german')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTargetLanguage('it')} className="text-xs">
                          {t('demo.languageOptions.italian')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTargetLanguage('pt')} className="text-xs">
                          {t('demo.languageOptions.portuguese')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
              
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{t('demo.outputLabel')}</label>
            <div className="w-full min-h-[7rem] p-4 rounded-xl bg-slate-700 backdrop-blur border border-slate-600 text-white flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : outputText ? (
                <p className="text-white text-sm w-full whitespace-pre-line">{outputText}</p>
              ) : (
                <p className="text-muted-foreground/50 text-sm">{t('demo.outputPlaceholder')}</p>
              )}
            </div>
          </div>
        </div>
        </div>
        </div>
      </section>
      
      {/* Message types */}
      <section className="border-y border-border bg-slate-900/50">
        <div className="container py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-muted-foreground">{t('messageTypes.title')}</span>
            {messageExamples.map((example, i) => (
              <span
                key={i}
                className="text-sm text-secondary-foreground hover:text-foreground transition-colors cursor-default"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="how-it-works" className="py-24 bg-slate-950">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.sectionTitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.sectionDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border hover:border-muted-foreground transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-24 border-t border-border bg-slate-900">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              {t('faq.title')}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {t('faq.selectPrompt')}
            </p>
            
            <div className="max-w-2xl mx-auto">
              <select
                className="w-full p-4 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:border-muted-foreground transition-colors"
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value) {
                    setSelectedFaqQuestion(value);
                    setIsFaqModalOpen(true);
                  }
                }}
                value=""
              >
                <option value="">{t('faq.chooseQuestion')}</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
                  <option key={num} value={num}>
                    Q{num}. {t(`faq.questions.q${num}.question`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Modal */}
      <Dialog open={isFaqModalOpen} onOpenChange={setIsFaqModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-start gap-3">
              <span className="text-primary">Q{selectedFaqQuestion}.</span>
              <span>{selectedFaqQuestion && t(`faq.questions.q${selectedFaqQuestion}.question`)}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line pt-4">
            {selectedFaqQuestion === 10 ? (
              <>
                {t(`faq.questions.q${selectedFaqQuestion}.answer`).split('Privacy Policy').map((part, index, arr) => (
                  <span key={index}>
                    {part}
                    {index < arr.length - 1 && (
                      <Link 
                        href={`/${locale}/privacy`}
                        className="text-primary hover:underline font-medium"
                        onClick={() => setIsFaqModalOpen(false)}
                      >
                        Privacy Policy
                      </Link>
                    )}
                  </span>
                ))}
              </>
            ) : (
              selectedFaqQuestion && t(`faq.questions.q${selectedFaqQuestion}.answer`)
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* CTA */}
      <section className="py-24 border-t border-border bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-slate-950">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <Button asChild variant="hero" size="xl">
              <Link href={`/${locale}/translate`}>
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
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
      
      {/* Advanced Tone Settings Modal */}
      <Dialog open={isAdvancedModalOpen} onOpenChange={setIsAdvancedModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('advancedModal.title')}</DialogTitle>
            <p className="text-sm text-muted-foreground pt-2">
              {t('advancedModal.description')}
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Formality Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">{t('advancedModal.formality')}</label>
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('advancedModal.formalityLevels.casual')}</span>
                <span>{t('advancedModal.formalityLevels.informal')}</span>
                <span>{t('advancedModal.formalityLevels.neutral')}</span>
                <span>{t('advancedModal.formalityLevels.formal')}</span>
                <span>{t('advancedModal.formalityLevels.institutional')}</span>
              </div>
            </div>
            
            {/* Directness Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">{t('advancedModal.directness')}</label>
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('advancedModal.directnessLevels.indirect')}</span>
                <span>{t('advancedModal.directnessLevels.diplomatic')}</span>
                <span>{t('advancedModal.directnessLevels.clear')}</span>
                <span>{t('advancedModal.directnessLevels.direct')}</span>
                <span>{t('advancedModal.directnessLevels.blunt')}</span>
              </div>
            </div>
            
            {/* Emotion Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">{t('advancedModal.emotion')}</label>
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('advancedModal.emotionLevels.low')}</span>
                <span>{t('advancedModal.emotionLevels.contained')}</span>
                <span>{t('advancedModal.emotionLevels.attentive')}</span>
                <span>{t('advancedModal.emotionLevels.sensitive')}</span>
                <span>{t('advancedModal.emotionLevels.high')}</span>
              </div>
            </div>
            
            {/* Power Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('advancedModal.power')}</label>
              <select
                value={power}
                onChange={(e) => setPower(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="superior">{t('advancedModal.powerLevels.superior')}</option>
                <option value="equal">{t('advancedModal.powerLevels.equal')}</option>
                <option value="subordinate">{t('advancedModal.powerLevels.subordinate')}</option>
              </select>
            </div>
            
            {/* Culture Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('advancedModal.culture')}</label>
              <select
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="us">{t('advancedModal.cultureLevels.us')}</option>
                <option value="uk">{t('advancedModal.cultureLevels.uk')}</option>
                <option value="europe">{t('advancedModal.cultureLevels.europe')}</option>
                <option value="asia">{t('advancedModal.cultureLevels.asia')}</option>
              </select>
            </div>
            
            {/* Medium Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('advancedModal.medium')}</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="email">{t('advancedModal.mediumLevels.email')}</option>
                <option value="chat">{t('advancedModal.mediumLevels.chat')}</option>
                <option value="in-person">{t('advancedModal.mediumLevels.inPerson')}</option>
                <option value="written-notice">{t('advancedModal.mediumLevels.writtenNotice')}</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
