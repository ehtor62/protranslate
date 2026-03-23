"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { type ContextSettings } from '@/data/messages';

export function HeroDemo({ locale }: { locale: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedFormality, setAnimatedFormality] = useState(50);
  const [animatedDirectness, setAnimatedDirectness] = useState(50);
  const [animatedEmotions, setAnimatedEmotions] = useState(50);
  const [showControls, setShowControls] = useState(true);
  const t = useTranslations('demo');
  
  const demoContexts: { labelKey: string; settings: ContextSettings; targetLanguage: string }[] = [
    {
      labelKey: 'formalEmail',
      targetLanguage: locale === 'de' ? 'de' : locale === 'fr' ? 'fr' : locale === 'es' ? 'es' : locale === 'it' ? 'it' : locale === 'pt' ? 'pt' : 'en',
      settings: {
        formality: 75,
        directness: 45,
        powerRelationship: 'equal',
        emotionalSensitivity: 40,
        culturalContext: 'usa',
        medium: 'email'
      }
    },
    {
      labelKey: 'directConversation',
      targetLanguage: locale === 'de' || locale === 'fr' || locale === 'es' || locale === 'it' || locale === 'pt' ? 'en' : 'de',
      settings: {
        formality: 40,
        directness: 80,
        powerRelationship: 'less',
        emotionalSensitivity: 35,
        culturalContext: 'europe-germany',
        medium: 'in-person'
      }
    },
    {
      labelKey: 'sensitiveLetter',
      targetLanguage: locale === 'de' ? 'de' : locale === 'fr' ? 'fr' : locale === 'es' ? 'es' : locale === 'it' ? 'it' : locale === 'pt' ? 'pt' : 'en',
      settings: {
        formality: 85,
        directness: 38,
        powerRelationship: 'more',
        emotionalSensitivity: 80,
        culturalContext: 'europe-italy',
        medium: 'written-notice'
      }
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setShowControls(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % demoContexts.length);
        setIsAnimating(false);
      }, 300);
    }, 12000);
    
    return () => clearInterval(interval);
  }, [demoContexts.length]);
  
  // Animate sliders when context changes
  useEffect(() => {
    const targetFormality = demoContexts[activeIndex].settings.formality;
    const targetDirectness = demoContexts[activeIndex].settings.directness;
    const targetEmotions = demoContexts[activeIndex].settings.emotionalSensitivity;
    
    let frame = 0;
    const totalFrames = 60;
    const startFormality = animatedFormality;
    const startDirectness = animatedDirectness;
    const startEmotions = animatedEmotions;
    
    const animate = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setAnimatedFormality(Math.round(startFormality + (targetFormality - startFormality) * eased));
      setAnimatedDirectness(Math.round(startDirectness + (targetDirectness - startDirectness) * eased));
      setAnimatedEmotions(Math.round(startEmotions + (targetEmotions - startEmotions) * eased));
      
      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [activeIndex]);
  
  const currentDemo = demoContexts[activeIndex];
  const tSamples = useTranslations('samples');
  
  // Get demo message based on target language
  const getDemoMessage = () => {
    if (currentDemo.labelKey === 'directConversation') {
      if (currentDemo.targetLanguage === 'de') {
        return 'Ich muss offen mit Ihnen sprechen. Ihre Position wird gestrichen. Wir werden die nächsten Schritte besprechen und Ihr letzter Tag wird der [Datum] sein.';
      } else if (currentDemo.targetLanguage === 'en') {
        return 'I need to be direct with you. Your position is being eliminated. We\'ll discuss next steps and your final day will be [date].';
      }
    }
    return tSamples(currentDemo.labelKey);
  };
  
  const demoMessage = getDemoMessage();
  const tPage = useTranslations('translatePage');
  const tPower = useTranslations('powerRelationship');
  const tCulture = useTranslations('culturalContext');
  const tMedium = useTranslations('medium');
  
  // Get language label
  const getLanguageLabel = (lang: string) => {
    const languageKeyMap: Record<string, string> = {
      'en': 'languageEnglish',
      'es': 'languageSpanish',
      'fr': 'languageFrench',
      'de': 'languageGerman',
      'it': 'languageItalian',
      'pt': 'languagePortuguese',
      'nl': 'languageDutch'
    };
    return tPage(languageKeyMap[lang] || 'languageEnglish');
  };
  
  // Get formality label based on value
  const getFormalityLabel = (value: number) => {
    if (value <= 20) return tPage('formalityCasual');
    if (value <= 40) return tPage('formalityInformal');
    if (value <= 60) return tPage('formalityNeutral');
    if (value <= 80) return tPage('formalityFormal');
    return tPage('formalityInstitutional');
  };
  
  // Get directness label based on value
  const getDirectnessLabel = (value: number) => {
    if (value <= 12) return tPage('directnessIndirect');
    if (value <= 37) return tPage('directnessDiplomatic');
    if (value <= 62) return tPage('directnessClear');
    if (value <= 87) return tPage('directnessDirect');
    return tPage('directnessBlunt');
  };
  
  // Get emotional sensitivity label based on value
  const getEmotionalSensitivityLabel = (value: number) => {
    if (value <= 12) return tPage('emotionalSensitivityLow');
    if (value <= 37) return tPage('emotionalSensitivityContained');
    if (value <= 62) return tPage('emotionalSensitivityAttentive');
    if (value <= 87) return tPage('emotionalSensitivitySensitive');
    return tPage('emotionalSensitivityHigh');
  };
  
  const context = currentDemo.settings;
  
  return (
    <div className="space-y-4">
      {/* Context selector */}
      <div className="flex flex-wrap gap-2">
        {demoContexts.map((demo, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAnimating(true);
              setShowControls(true);
              setTimeout(() => {
                setActiveIndex(i);
                setIsAnimating(false);
              }, 300);
            }}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full transition-all duration-200",
              i === activeIndex
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t(demo.labelKey)}
          </button>
        ))}
      </div>
      
      {/* Interactive Controls Demo */}
      {showControls && (
        <div className="space-y-3 p-4 rounded-lg bg-background/80 border border-border">
          {/* Formality Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">{tPage('formality')}</label>
              <span className="text-xs text-primary font-semibold">{animatedFormality}%</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary transition-all duration-200 ease-out"
                style={{ width: `${animatedFormality}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-lg transition-all duration-200 ease-out"
                style={{ left: `calc(${animatedFormality}% - 8px)` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {getFormalityLabel(animatedFormality).toLowerCase()}
            </div>
          </div>
          
          {/* Directness Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">{tPage('directness')}</label>
              <span className="text-xs text-primary font-semibold">{animatedDirectness}%</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary transition-all duration-200 ease-out"
                style={{ width: `${animatedDirectness}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-lg transition-all duration-200 ease-out"
                style={{ left: `calc(${animatedDirectness}% - 8px)` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {getDirectnessLabel(animatedDirectness).toLowerCase()}
            </div>
          </div>
          
          {/* Emotions Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">{tPage('emotionalSensitivity')}</label>
              <span className="text-xs text-primary font-semibold">{animatedEmotions}%</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary transition-all duration-200 ease-out"
                style={{ width: `${animatedEmotions}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full shadow-lg transition-all duration-200 ease-out"
                style={{ left: `calc(${animatedEmotions}% - 8px)` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {getEmotionalSensitivityLabel(animatedEmotions).toLowerCase()}
            </div>
          </div>
          
          {/* Quick Settings */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">{tPage('powerRelationship')}</label>
              <div className="text-xs px-2 py-1.5 rounded-md bg-muted text-foreground border border-border">
                {tPower(context.powerRelationship)}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">{tPage('culturalContext')}</label>
              <div className="text-xs px-2 py-1.5 rounded-md bg-muted text-foreground border border-border">
                {tCulture(context.culturalContext)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message preview */}
      <div
        className={cn(
          "p-4 rounded-lg bg-primary/5 border border-primary/20 transition-all duration-300 min-h-[100px]",
          isAnimating && "opacity-0 translate-y-2"
        )}
      >
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse mt-1.5" />
          <span className="text-xs font-medium text-primary">{t('professionallyWorded')}</span>
        </div>
        <p className="text-sm text-foreground/90 break-words line-clamp-4 whitespace-pre-line">
          {demoMessage}
        </p>
      </div>
      
      {/* Compact context tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {getLanguageLabel(currentDemo.targetLanguage)}
        </span>
      </div>
    </div>
  );
}
