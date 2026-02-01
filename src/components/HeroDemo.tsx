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
        directness: 50,
        powerRelationship: 'equal',
        emotionalSensitivity: 40,
        culturalContext: 'us',
        medium: 'email'
      }
    },
    {
      labelKey: 'directConversation',
      settings: {
        formality: 45,
        directness: 80,
        powerRelationship: 'less',
        emotionalSensitivity: 30,
        culturalContext: 'germany',
        medium: 'in-person'
      }
    },
    {
      labelKey: 'sensitiveLetter',
      settings: {
        formality: 85,
        directness: 40,
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
      
      {/* Context indicators */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {currentDemo.settings.formality}% formal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/60" />
          {currentDemo.settings.directness}% direct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/30" />
          {currentDemo.settings.emotionalSensitivity}% emotion
        </span>
      </div>
    </div>
  );
}
