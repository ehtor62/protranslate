
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

// Removed unused getCulturalContextDisplay
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
  const mediumOptions = Object.keys(mediumLabels).map((value) => ({
    value,
    label: t(`medium.${value === 'in-person' ? 'inPerson' : value === 'written-notice' ? 'writtenNotice' : value}`)
  }));
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [context, setContext] = useState<ContextSettings>(defaultContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [translation, setTranslation] = useState<MessageVariant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [isNorthAmericaModalOpen, setIsNorthAmericaModalOpen] = useState(false);
  const [isEuropeModalOpen, setIsEuropeModalOpen] = useState(false);
  const [isAsiaModalOpen, setIsAsiaModalOpen] = useState(false);
  const [isAfricaModalOpen, setIsAfricaModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(locale);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  const southAmericaSubregions = [
    'central-america', 'colombia', 'peru', 'argentina', 'brasil'
  ];
  const africaSubregions = [
    'morocco', 'egypt', 'congo', 'angola', 'namibia', 'south-africa'
  ];
  const culturalOptions = Object.keys(culturalLabels)
    .filter(key => key !== 'mexico' && key !== 'japan' && !key.startsWith('usa') && !key.startsWith('canada') && !key.startsWith('europe-') && !key.startsWith('asia-') && !southAmericaSubregions.includes(key) && !africaSubregions.includes(key))
    .map((value) => ({
      value,
      label: t(`culturalContext.${value}`)
    }));
  
  const [isSouthAmericaModalOpen, setIsSouthAmericaModalOpen] = useState(false);
  const handleSouthAmericaSelection = (subcategory: 'central-america' | 'colombia' | 'peru' | 'argentina' | 'brasil') => {
    setContext((prev) => ({ ...prev, culturalContext: subcategory }));
    setIsSouthAmericaModalOpen(false);
  };

  const handleAfricaSelection = (subcategory: 'morocco' | 'egypt' | 'congo' | 'angola' | 'namibia' | 'south-africa') => {
    setContext((prev) => ({ ...prev, culturalContext: subcategory }));
    setIsAfricaModalOpen(false);
  };

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

  const handleCulturalContextChange = (value: string) => {
    if (value === 'us') {
      // Open North America modal
      setIsNorthAmericaModalOpen(true);
    } else if (value === 'usa' || value === 'canada' || value === 'mexico') {
      // User clicked on already selected subcategory, reopen modal to allow changing
      setIsNorthAmericaModalOpen(true);
    } else if (value === 'uk') {
      // Open Europe modal
      setIsEuropeModalOpen(true);
    } else if (value.startsWith('europe-')) {
      // User clicked on already selected European subcategory, reopen modal to allow changing
      setIsEuropeModalOpen(true);
    } else if (value === 'germany') {
      // Open Asia modal
      setIsAsiaModalOpen(true);
    } else if (value.startsWith('asia-')) {
      // User clicked on already selected Asian subcategory, reopen modal to allow changing
      setIsAsiaModalOpen(true);
    } else if (value === 'south-america') {
      // Open South America modal
      setIsSouthAmericaModalOpen(true);
    } else if (["central-america", "colombia", "peru", "argentina", "brasil"].includes(value)) {
      setIsSouthAmericaModalOpen(true);
    } else if (value === 'africa') {
      // Open Africa modal
      setIsAfricaModalOpen(true);
    } else if (africaSubregions.includes(value)) {
      setIsAfricaModalOpen(true);
    } else {
      updateContext('culturalContext', value as ContextSettings['culturalContext']);
    }
  };


        {/* South America Subcategory Modal */}
        <Dialog open={isSouthAmericaModalOpen} onOpenChange={setIsSouthAmericaModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.south-america')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('central-america'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.central-america')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('colombia'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.colombia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('peru'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.peru')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('argentina'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.argentina')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('brasil'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.brasil')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

  const handleNorthAmericaSelection = (subcategory: 'usa' | 'canada' | 'mexico') => {
    updateContext('culturalContext', subcategory);
    setIsNorthAmericaModalOpen(false);
  };

  const handleEuropeSelection = (subcategory: ContextSettings['culturalContext']) => {
    updateContext('culturalContext', subcategory);
    setIsEuropeModalOpen(false);
  };

  const handleAsiaSelection = (subcategory: ContextSettings['culturalContext']) => {
    updateContext('culturalContext', subcategory);
    setIsAsiaModalOpen(false);
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessageId(messageId);
    // Reset cultural context subcategories back to parent region for new queries
    if (
      context.culturalContext === 'usa' ||
      context.culturalContext === 'canada' ||
      context.culturalContext === 'mexico'
    ) {
      updateContext('culturalContext', 'us' as ContextSettings['culturalContext']);
    } else if (context.culturalContext.startsWith('europe-')) {
      updateContext('culturalContext', 'uk' as ContextSettings['culturalContext']);
    } else if (context.culturalContext.startsWith('asia-')) {
      updateContext('culturalContext', 'germany' as ContextSettings['culturalContext']);
    } else if (southAmericaSubregions.includes(context.culturalContext)) {
      updateContext('culturalContext', 'south-america' as ContextSettings['culturalContext']);
    } else if (africaSubregions.includes(context.culturalContext)) {
      updateContext('culturalContext', 'africa' as ContextSettings['culturalContext']);
    }
    if (messageId === 'custom-input') {
      setIsCustomInputOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };
  
  const handleCustomInputSubmit = () => {
    if (!customTitle.trim() || !customDescription.trim()) return;
    setIsCustomInputOpen(false);
    setIsDialogOpen(true);
  };
  
  // Generate message when dialog closes with shouldGenerate flag
  useEffect(() => {
    if (!selectedMessageId || isDialogOpen || !shouldGenerate) return;

    setShouldGenerate(false); // Reset flag

    // Scroll to top to show output field
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const generateTranslation = async () => {
      setIsLoading(true);
      try {
        let messageType, messageDescription;

        if (selectedMessageId === 'custom-input') {
          messageType = customTitle;
          messageDescription = customDescription;
        } else {
          const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
          if (!selectedMessage) return;
          messageType = selectedMessage.title;
          messageDescription = selectedMessage.description;
        }

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageType,
            messageDescription,
            context,
            locale,
            targetLanguage
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
  }, [selectedMessageId, context, isDialogOpen, shouldGenerate, customTitle, customDescription, locale]);
  
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
                    {selectedMessageId === 'custom-input' 
                      ? customTitle 
                      : t(`messages.${selectedMessageKey}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMessageId === 'custom-input'
                      ? customDescription
                      : t(`messages.${selectedMessageKey}.description`)}
                  </p>
                </div>
                
                <TranslationOutput variant={translation} context={context} targetLanguage={targetLanguage} />
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

        {/* Custom Input Dialog */}
        <Dialog open={isCustomInputOpen} onOpenChange={setIsCustomInputOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('translatePage.customInputTitle')}</DialogTitle>
              <DialogDescription>
                {t('translatePage.customInputDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="custom-title" className="text-sm font-medium text-foreground">
                  {t('translatePage.customInputTitleLabel')}
                </label>
                <input
                  id="custom-title"
                  type="text"
                  placeholder={t('translatePage.customInputTitlePlaceholder')}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="custom-description" className="text-sm font-medium text-foreground">
                  {t('translatePage.customInputTopicLabel')}
                </label>
                <textarea
                  id="custom-description"
                  placeholder={t('translatePage.customInputTopicPlaceholder')}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCustomInputOpen(false);
                  setSelectedMessageId(null);
                  setCustomTitle('');
                  setCustomDescription('');
                }}
              >
                {t('translatePage.cancel')}
              </Button>
              <Button 
                variant="orange"
                onClick={handleCustomInputSubmit}
                disabled={!customTitle.trim() || !customDescription.trim()}
              >
                {t('translatePage.continue')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              
              {/* Cultural Context with custom rendering for subcategories */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">{t('translatePage.culturalContext')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {culturalOptions.map((option) => {
                    const isActive = option.value === 'us' 
                      ? (context.culturalContext === 'us' || context.culturalContext === 'usa' || context.culturalContext === 'canada')
                      : option.value === 'uk'
                      ? (context.culturalContext === 'uk' || context.culturalContext.startsWith('europe-'))
                      : option.value === 'germany'
                      ? (context.culturalContext === 'germany' || context.culturalContext.startsWith('asia-'))
                      : option.value === 'south-america'
                      ? (context.culturalContext === 'south-america' || southAmericaSubregions.includes(context.culturalContext))
                      : option.value === 'africa'
                      ? (context.culturalContext === 'africa' || africaSubregions.includes(context.culturalContext))
                      : context.culturalContext === option.value;
                    
                    const displayLabel = option.value === 'us' && (context.culturalContext === 'usa' || context.culturalContext === 'canada' || context.culturalContext === 'mexico')
                      ? t(`culturalContext.${context.culturalContext}`)
                      : option.value === 'uk' && context.culturalContext.startsWith('europe-')
                      ? t(`culturalContext.${context.culturalContext}`)
                      : option.value === 'germany' && context.culturalContext.startsWith('asia-')
                      ? t(`culturalContext.${context.culturalContext}`)
                      : option.value === 'south-america' && southAmericaSubregions.includes(context.culturalContext)
                      ? t(`culturalContext.${context.culturalContext}`)
                      : option.value === 'africa' && africaSubregions.includes(context.culturalContext)
                      ? t(`culturalContext.${context.culturalContext}`)
                      : option.label;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleCulturalContextChange(option.value)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                          isActive || (option.value === 'us' && context.culturalContext === 'mexico')
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
              

              {/* Medium and Language in one row */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-[3]">
                    <span className="text-sm font-medium text-foreground">{t('translatePage.medium')}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{t('translatePage.translateTo')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {/* Medium Buttons - 3 buttons */}
                  {mediumOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateContext('medium', option.value as ContextSettings['medium'])}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        context.medium === option.value
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}

                  {/* Language Button - 1 button */}
                  <button
                    onClick={() => setIsLanguageModalOpen(true)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      targetLanguage
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {!targetLanguage && 'Language'}
                    {targetLanguage === 'en' && t('translatePage.languageEnglish')}
                    {targetLanguage === 'es' && t('translatePage.languageSpanish')}
                    {targetLanguage === 'fr' && t('translatePage.languageFrench')}
                    {targetLanguage === 'de' && t('translatePage.languageGerman')}
                    {targetLanguage === 'it' && t('translatePage.languageItalian')}
                    {targetLanguage === 'pt' && t('translatePage.languagePortuguese')}
                    {targetLanguage === 'nl' && t('translatePage.languageDutch')}
                    {targetLanguage === 'ja' && t('translatePage.languageJapanese')}
                    {targetLanguage === 'zh' && t('translatePage.languageChinese')}
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* South America Subcategory Modal */}
        <Dialog open={isSouthAmericaModalOpen} onOpenChange={setIsSouthAmericaModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.south-america')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('central-america'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.central-america')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('colombia'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.colombia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('peru'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.peru')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('argentina'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.argentina')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleSouthAmericaSelection('brasil'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.brasil')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Language Selection Modal */}
        <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('translatePage.translateTo')}</DialogTitle>
              <DialogDescription>
                Select target language
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              <button
                onClick={() => {
                  setTargetLanguage('en');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageEnglish')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('es');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageSpanish')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('fr');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageFrench')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('de');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageGerman')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('it');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageItalian')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('pt');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languagePortuguese')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('nl');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageDutch')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('ja');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageJapanese')}
              </button>
              <button
                onClick={() => {
                  setTargetLanguage('zh');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageChinese')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* North America Subcategory Modal */}
        <Dialog open={isNorthAmericaModalOpen} onOpenChange={setIsNorthAmericaModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.us')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleNorthAmericaSelection('usa'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.usa')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNorthAmericaSelection('canada'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.canada')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNorthAmericaSelection('mexico'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.mexico')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Europe Subcategory Modal */}
        <Dialog open={isEuropeModalOpen} onOpenChange={setIsEuropeModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.uk')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-uk' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-uk')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-scandinavia' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-scandinavia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-spain' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-spain')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-france' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-france')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-benelux' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-benelux')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-germany' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-germany')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-switzerland' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-switzerland')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-italy' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-italy')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-poland' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-poland')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-romania' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-romania')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleEuropeSelection('europe-greece' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.europe-greece')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Asia Subcategory Modal */}
        <Dialog open={isAsiaModalOpen} onOpenChange={setIsAsiaModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.germany')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-russia' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-russia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-china' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-china')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-india' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-india')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-japan' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-japan')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-turkey' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-turkey')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-saudi-arabia' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-saudi-arabia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-uae' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-uae')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-thailand' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-thailand')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-malaysia' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-malaysia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAsiaSelection('asia-indonesia' as ContextSettings['culturalContext']); }}
                className="px-4 py-4 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.asia-indonesia')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Africa Subcategory Modal */}
        <Dialog open={isAfricaModalOpen} onOpenChange={setIsAfricaModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('culturalContext.africa')}</DialogTitle>
              <DialogDescription>
                Select a specific region
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('morocco'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.morocco')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('egypt'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.egypt')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('congo'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.congo')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('angola'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.angola')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('namibia'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.namibia')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAfricaSelection('south-africa'); }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('culturalContext.south-africa')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
