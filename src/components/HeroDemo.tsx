"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { type ContextSettings } from '@/data/messages';

export function HeroDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const t = useTranslations('demo');
  
  const demoContexts: { labelKey: string; settings: ContextSettings }[] = [
    {
      labelKey: 'formalEmail',
      settings: {
        formality: 75,
        directness: 45,
        powerRelationship: 'equal',
        emotionalSensitivity: 40,
        culturalContext: 'us',
        medium: 'email'
      }
    },
    {
      labelKey: 'directConversation',
      settings: {
        formality: 40,
        directness: 80,
        powerRelationship: 'less',
        emotionalSensitivity: 35,
        culturalContext: 'germany',
        medium: 'in-person'
      }
    },
    {
      labelKey: 'sensitiveLetter',
      settings: {
        formality: 85,
        directness: 38,
        powerRelationship: 'more',
        emotionalSensitivity: 80,
        culturalContext: 'japan',
        medium: 'written-notice'
      }
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % demoContexts.length);
        setIsAnimating(false);
      }, 300);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [demoContexts.length]);
  
  const currentDemo = demoContexts[activeIndex];
  const tSamples = useTranslations('samples');
  const demoMessage = tSamples(currentDemo.labelKey);
  const tPage = useTranslations('translatePage');
  const tPower = useTranslations('powerRelationship');
  const tCulture = useTranslations('culturalContext');
  const tMedium = useTranslations('medium');
  
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
      
      {/* Message preview */}
      <div
        className={cn(
          "p-4 rounded-lg bg-background/80 border border-border transition-all duration-300 min-h-[100px]",
          isAnimating && "opacity-0 translate-y-2"
        )}
      >
        <p className="text-sm text-foreground/90 font-mono break-words line-clamp-4 whitespace-pre-line">
          {demoMessage}
        </p>
      </div>
      
      {/* Context indicators - matching TranslationOutput layout */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('formality')} {context.formality}%
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {getFormalityLabel(context.formality).toLowerCase()}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('directness')} {context.directness}%
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {getDirectnessLabel(context.directness).toLowerCase()}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('emotionalSensitivity')} {context.emotionalSensitivity}%
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {getEmotionalSensitivityLabel(context.emotionalSensitivity).toLowerCase()}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('powerRelationship')}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {tPower(context.powerRelationship)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('culturalContext')}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {tCulture(context.culturalContext)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
            {tPage('medium')}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {tMedium(context.medium === 'in-person' ? 'inPerson' : context.medium === 'written-notice' ? 'writtenNotice' : context.medium)}
          </span>
        </div>
      </div>
    </div>
  );
}
