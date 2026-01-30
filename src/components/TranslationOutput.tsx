import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MessageVariant, ContextSettings, culturalLabels, mediumLabels, powerLabels } from '@/data/messages';
import { CheckCircle, AlertTriangle, Info, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranslationOutputProps {
  variant: MessageVariant;
  context: ContextSettings;
  className?: string;
}

export function TranslationOutput({ variant, context, className }: TranslationOutputProps) {
  const [copied, setCopied] = React.useState(false);
  const t = useTranslations();
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(variant.wording);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get formality label based on value
  const getFormalityLabel = (value: number) => {
    if (value <= 20) return t('translatePage.formalityCasual');
    if (value <= 40) return t('translatePage.formalityInformal');
    if (value <= 60) return t('translatePage.formalityNeutral');
    if (value <= 80) return t('translatePage.formalityFormal');
    return t('translatePage.formalityInstitutional');
  };
  
  // Get directness label based on value
  const getDirectnessLabel = (value: number) => {
    if (value <= 12) return t('translatePage.directnessIndirect');
    if (value <= 37) return t('translatePage.directnessDiplomatic');
    if (value <= 62) return t('translatePage.directnessClear');
    if (value <= 87) return t('translatePage.directnessDirect');
    return t('translatePage.directnessBlunt');
  };
  
  // Get emotional sensitivity label based on value
  const getEmotionalSensitivityLabel = (value: number) => {
    if (value <= 12) return t('translatePage.emotionalSensitivityLow');
    if (value <= 37) return t('translatePage.emotionalSensitivityContained');
    if (value <= 62) return t('translatePage.emotionalSensitivityAttentive');
    if (value <= 87) return t('translatePage.emotionalSensitivitySensitive');
    return t('translatePage.emotionalSensitivityHigh');
  };
  
  const contextSummary = [
    getFormalityLabel(context.formality).toLowerCase(),
    getDirectnessLabel(context.directness).toLowerCase(),
    getEmotionalSensitivityLabel(context.emotionalSensitivity).toLowerCase(),
    t(`powerRelationship.${context.powerRelationship}`),
    t(`culturalContext.${context.culturalContext}`),
    t(`medium.${context.medium === 'in-person' ? 'inPerson' : context.medium === 'written-notice' ? 'writtenNotice' : context.medium}`)
  ];
  
  const contextLabels = [
    `Formality ${context.formality}%`,
    `Directness ${context.directness}%`,
    `Emotions ${context.emotionalSensitivity}%`,
    'Power',
    'Culture',
    'Medium'
  ];
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Context summary tags */}
      <div className="flex flex-wrap gap-2">
        {contextSummary.map((tag, i) => (
          <div key={i} className="flex flex-col gap-1 items-center">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
              {contextLabels[i]}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          </div>
        ))}
      </div>
      
      {/* Main message output */}
      <div className="relative group">
        <div className="p-6 rounded-xl bg-surface-elevated border border-border">
          <p className="text-foreground leading-relaxed whitespace-pre-line font-mono text-sm">
            {variant.wording}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {/* Explanation */}
      {variant.explanation && (
        <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">{t('translatePage.explanation')}</h4>
            <p className="text-sm text-muted-foreground">{variant.explanation}</p>
          </div>
        </div>
      )}
      
      {/* Reception */}
      {variant.reception && (
        <div className="flex gap-3 p-4 rounded-lg bg-muted">
          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">{t('translatePage.reception')}</h4>
            <p className="text-sm text-muted-foreground">{variant.reception}</p>
          </div>
        </div>
      )}
      
      {/* Warning */}
      {variant.warning && (
        <div className="flex gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Important consideration</h4>
            <p className="text-sm text-muted-foreground">{variant.warning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
