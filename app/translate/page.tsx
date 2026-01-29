"use client";

import { useState, useMemo } from 'react';
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
  generateMessage, 
  type ContextSettings,
  culturalLabels,
  mediumLabels,
  powerLabels 
} from '@/data/messages';
import { ArrowRight, Settings } from 'lucide-react';

const defaultContext: ContextSettings = {
  formality: 60,
  directness: 50,
  powerRelationship: 'equal',
  emotionalSensitivity: 50,
  culturalContext: 'neutral',
  medium: 'in-person'
};

const culturalOptions = Object.entries(culturalLabels).map(([value, label]) => ({
  value,
  label
}));

const mediumOptions = Object.entries(mediumLabels).map(([value, label]) => ({
  value,
  label
}));

const powerOptions = Object.entries(powerLabels).map(([value, label]) => ({
  value,
  label
}));

export default function Translate() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [context, setContext] = useState<ContextSettings>(defaultContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  
  const translation = useMemo(() => {
    if (!selectedMessageId) return null;
    return generateMessage(selectedMessageId, context);
  }, [selectedMessageId, context]);
  
  const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Translation Tool
          </h1>
          <p className="text-muted-foreground">
            Select a message type, adjust context parameters, and get a professionally calibrated translation.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 lg:gap-12">
          {/* Left panel - Message Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <h2 className="font-medium text-foreground">Select a core message</h2>
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
              <h2 className="font-medium text-foreground">Translation output</h2>
              {selectedMessageId && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Adjust Context
                </Button>
              )}
            </div>
            
            {selectedMessageId && translation ? (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {selectedMessage?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMessage?.description}
                  </p>
                </div>
                
                <TranslationOutput variant={translation} context={context} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <ArrowRight className="w-8 h-8 text-muted-foreground mx-auto mb-3 rotate-180 lg:rotate-0" />
                  <p className="text-muted-foreground">
                    Select a message type to see translations
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context Adjustment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Context</DialogTitle>
              <DialogDescription>
                Fine-tune the translation parameters to match your specific situation.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <ContextSlider
                label="Formality"
                value={context.formality}
                onChange={(v) => updateContext('formality', v)}
                leftLabel="Casual"
                rightLabel="Institutional"
              />
              
              <ContextSlider
                label="Directness"
                value={context.directness}
                onChange={(v) => updateContext('directness', v)}
                leftLabel="Indirect"
                rightLabel="Blunt"
              />
              
              <ContextSlider
                label="Emotional sensitivity"
                value={context.emotionalSensitivity}
                onChange={(v) => updateContext('emotionalSensitivity', v)}
                leftLabel="Low"
                rightLabel="High"
              />
              
              <ContextSelector
                label="Power relationship"
                value={context.powerRelationship}
                onChange={(v) => updateContext('powerRelationship', v as ContextSettings['powerRelationship'])}
                options={powerOptions}
              />
              
              <ContextSelector
                label="Cultural context"
                value={context.culturalContext}
                onChange={(v) => updateContext('culturalContext', v as ContextSettings['culturalContext'])}
                options={culturalOptions}
              />
              
              <ContextSelector
                label="Communication medium"
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
