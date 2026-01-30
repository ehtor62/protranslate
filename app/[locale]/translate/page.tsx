"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/components/Header';
import { MessageCard } from '@/components/MessageCard';
import { ContextSlider } from '@/components/ContextSlider';
import { ContextSelector } from '@/components/ContextSelector';
import { TranslationOutput } from '@/components/TranslationOutput';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  coreMessages, 
  type ContextSettings,
  type MessageVariant,
  culturalLabels,
  mediumLabels,
  powerLabels 
} from '@/data/messages';
import { ArrowRight, Settings } from 'lucide-react';

// Convert kebab-case to camelCase for translation keys
const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const defaultContext: ContextSettings = {
  formality: 60,
  directness: 50,
  powerRelationship: 'equal',
  emotionalSensitivity: 50,
  culturalContext: 'neutral',
  medium: 'in-person'
};

export default function Translate() {
  const t = useTranslations();
  const locale = useLocale();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [context, setContext] = useState<ContextSettings>(defaultContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [translation, setTranslation] = useState<MessageVariant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  
  const culturalOptions = Object.keys(culturalLabels).map((value) => ({
    value,
    label: t(`culturalContext.${value}`)
  }));

  const mediumOptions = Object.keys(mediumLabels).map((value) => ({
    value,
    label: t(`medium.${value === 'in-person' ? 'inPerson' : value === 'written-notice' ? 'writtenNotice' : value}`)
  }));

  const powerOptions = Object.keys(powerLabels).map((value) => ({
    value,
    label: t(`powerRelationship.${value}`)
  }));
  
  const updateContext = <K extends keyof ContextSettings>(
    key: K,
    value: ContextSettings[K]
  ) => {
    setContext(prev => ({ ...prev, [key]: value }));
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessageId(messageId);
    setIsDialogOpen(true);
  };
  
  // Generate message when dialog closes with shouldGenerate flag
  useEffect(() => {
    if (!selectedMessageId || isDialogOpen || !shouldGenerate) return;
    
    setShouldGenerate(false); // Reset flag
    
    const generateTranslation = async () => {
      setIsLoading(true);
      try {
        const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
        if (!selectedMessage) return;
        
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageType: selectedMessage.title,
            messageDescription: selectedMessage.description,
            context,
            locale
          })
        });
        
        if (!response.ok) throw new Error('Failed to generate message');
        
        const result = await response.json();
        setTranslation(result);
      } catch (error) {
        console.error('Error generating translation:', error);
        setTranslation({
          wording: 'Error generating message. Please try again.',
          explanation: 'An error occurred while processing your request.',
          reception: ''
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    generateTranslation();
  }, [selectedMessageId, context, isDialogOpen]);
  
  const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
  const selectedMessageKey = selectedMessage ? toCamelCase(selectedMessage.id) : '';
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('translatePage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('translatePage.description')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 lg:gap-12">
          {/* Left panel - Message Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <h2 className="font-medium text-foreground">{t('translatePage.step1')}</h2>
            </div>
            
            <div className="grid gap-3">
              {coreMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  isSelected={selectedMessageId === message.id}
                  onClick={() => handleMessageSelect(message.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Right panel - Output */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                2
              </span>
              <h2 className="font-medium text-foreground">{t('translatePage.step3')}</h2>
              {selectedMessageId && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('translatePage.step2')}
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Generating message...</p>
                </div>
              </div>
            ) : selectedMessageId && translation ? (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {t(`messages.${selectedMessageKey}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`messages.${selectedMessageKey}.description`)}
                  </p>
                </div>
                
                <TranslationOutput variant={translation} context={context} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <ArrowRight className="w-8 h-8 text-muted-foreground mx-auto mb-3 rotate-180 lg:rotate-0" />
                  <p className="text-muted-foreground">
                    {t('translatePage.selectMessage')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context Adjustment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent hideCloseButton>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{t('translatePage.step2')}</DialogTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="orange"
                    size="sm"
                    onClick={() => {
                      setShouldGenerate(true);
                      setIsDialogOpen(false);
                    }}
                  >
                    {t('translatePage.createPhrase')}
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t('translatePage.close')}
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <ContextSlider
                label={t('translatePage.formality')}
                value={context.formality}
                onChange={(v) => updateContext('formality', v)}
                showLabelInHandle={true}
                multipleLabels={[
                  { value: 0, label: t('translatePage.formalityCasual'), tooltip: t('translatePage.formalityCasualTooltip') },
                  { value: 20, label: t('translatePage.formalityInformal'), tooltip: t('translatePage.formalityInformalTooltip') },
                  { value: 40, label: t('translatePage.formalityNeutral'), tooltip: t('translatePage.formalityNeutralTooltip') },
                  { value: 60, label: t('translatePage.formalityFormal'), tooltip: t('translatePage.formalityFormalTooltip') },
                  { value: 80, label: t('translatePage.formalityInstitutional'), tooltip: t('translatePage.formalityInstitutionalTooltip') }
                ]}
              />
              
              <ContextSlider
                label={t('translatePage.directness')}
                value={context.directness}
                onChange={(v) => updateContext('directness', v)}
                showLabelInHandle={true}
                multipleLabels={[
                  { value: 0, label: t('translatePage.directnessIndirect'), tooltip: t('translatePage.directnessIndirectTooltip') },
                  { value: 25, label: t('translatePage.directnessDiplomatic'), tooltip: t('translatePage.directnessDiplomaticTooltip') },
                  { value: 50, label: t('translatePage.directnessClear'), tooltip: t('translatePage.directnessClearTooltip') },
                  { value: 75, label: t('translatePage.directnessDirect'), tooltip: t('translatePage.directnessDirectTooltip') },
                  { value: 100, label: t('translatePage.directnessBlunt'), tooltip: t('translatePage.directnessBluntTooltip') }
                ]}
              />
              
              <ContextSlider
                label={t('translatePage.emotionalSensitivity')}
                value={context.emotionalSensitivity}
                onChange={(v) => updateContext('emotionalSensitivity', v)}
                showLabelInHandle={true}
                multipleLabels={[
                  { value: 0, label: t('translatePage.emotionalSensitivityLow'), tooltip: t('translatePage.emotionalSensitivityLowTooltip') },
                  { value: 25, label: t('translatePage.emotionalSensitivityContained'), tooltip: t('translatePage.emotionalSensitivityContainedTooltip') },
                  { value: 50, label: t('translatePage.emotionalSensitivityAttentive'), tooltip: t('translatePage.emotionalSensitivityAttentiveTooltip') },
                  { value: 75, label: t('translatePage.emotionalSensitivitySensitive'), tooltip: t('translatePage.emotionalSensitivitySensitiveTooltip') },
                  { value: 100, label: t('translatePage.emotionalSensitivityHigh'), tooltip: t('translatePage.emotionalSensitivityHighTooltip') }
                ]}
              />
              
              <ContextSelector
                label={t('translatePage.powerRelationship')}
                value={context.powerRelationship}
                onChange={(v) => updateContext('powerRelationship', v as ContextSettings['powerRelationship'])}
                options={powerOptions}
              />
              
              <ContextSelector
                label={t('translatePage.culturalContext')}
                value={context.culturalContext}
                onChange={(v) => updateContext('culturalContext', v as ContextSettings['culturalContext'])}
                options={culturalOptions}
              />
              
              <ContextSelector
                label={t('translatePage.medium')}
                value={context.medium}
                onChange={(v) => updateContext('medium', v as ContextSettings['medium'])}
                options={mediumOptions}
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
