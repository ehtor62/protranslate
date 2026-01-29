import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { generateMessage, type ContextSettings } from '@/data/messages';

const demoContexts: { label: string; settings: ContextSettings }[] = [
  {
    label: 'Formal email to a colleague',
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
    label: 'Direct conversation with a manager',
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
    label: 'Sensitive letter to a valued employee',
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

export function HeroDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % demoContexts.length);
        setIsAnimating(false);
      }, 300);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const currentDemo = demoContexts[activeIndex];
  const message = generateMessage('termination', currentDemo.settings);
  
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
            {demo.label}
          </button>
        ))}
      </div>
      
      {/* Message preview */}
      <div
        className={cn(
          "p-5 rounded-xl bg-surface-elevated border border-border transition-all duration-300",
          isAnimating && "opacity-0 translate-y-2"
        )}
      >
        <p className="text-sm text-foreground leading-relaxed font-mono line-clamp-4">
          {message.wording.split('\n')[0]}...
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
      </div>
    </div>
  );
}
