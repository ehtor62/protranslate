
"use client";


import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { MessageCard } from '@/components/MessageCard';
import { ContextSlider } from '@/components/ContextSlider';
import { ContextSelector } from '@/components/ContextSelector';
import { TranslationOutput } from '@/components/TranslationOutput';
import { AuthModal } from '@/components/AuthModal';
import { PricingModal } from '@/components/PricingModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
import { ArrowRight, Settings, Mail } from 'lucide-react';

// Convert kebab-case to camelCase for translation keys
const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// Removed unused getCulturalContextDisplay
const defaultContext: ContextSettings = {
  formality: 50,
  directness: 50,
  powerRelationship: 'equal',
  emotionalSensitivity: 50,
  culturalContext: 'neutral',
  medium: 'in-person'
};

export default function Translate() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInAnonymouslyWithState, isEmailVerified, checkEmailVerification } = useAuth();
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isNorthAmericaModalOpen, setIsNorthAmericaModalOpen] = useState(false);
  const [isEuropeModalOpen, setIsEuropeModalOpen] = useState(false);
  const [isAsiaModalOpen, setIsAsiaModalOpen] = useState(false);
  const [isAfricaModalOpen, setIsAfricaModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(locale);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number>(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const paymentToastShownRef = useRef(false);
  
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
    const newContext = { ...context, [key]: value };
    setContext(newContext);
    
    // Save draft settings to localStorage if user is not logged in
    if (!user) {
      localStorage.setItem('draftSettings', JSON.stringify({
        context: newContext,
        selectedMessageId,
        customTitle,
        customDescription,
        targetLanguage
      }));
    }
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
    // Keep all context settings including specific country selections
    // No reset needed - users expect settings to persist
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
  
  // Load draft settings from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedDraft = localStorage.getItem('draftSettings');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Don't restore context - keep default state when not logged in
          // if (draft.context) setContext(draft.context);
          // Don't restore selectedMessageId - keep page neutral when not logged in
          // if (draft.selectedMessageId) setSelectedMessageId(draft.selectedMessageId);
          if (draft.customTitle) setCustomTitle(draft.customTitle);
          if (draft.customDescription) setCustomDescription(draft.customDescription);
          if (draft.targetLanguage) setTargetLanguage(draft.targetLanguage);
        } catch (error) {
          console.error('Error loading draft settings:', error);
        }
      }
    }
  }, [user]);
  
  // Save draft settings to localStorage when they change (for non-logged-in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('draftSettings', JSON.stringify({
        context,
        selectedMessageId,
        customTitle,
        customDescription,
        targetLanguage
      }));
    }
  }, [context, selectedMessageId, customTitle, customDescription, targetLanguage, user]);
  
  // Resend verification email
  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    
    // Rate limiting: 60 seconds between resends
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const minInterval = 60000; // 60 seconds
    
    if (timeSinceLastResend < minInterval) {
      const remainingSeconds = Math.ceil((minInterval - timeSinceLastResend) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before resending.`);
      return;
    }
    
    setResendingVerification(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('[Translate] 📧 Sending verification email via API...');
      console.log('[Translate] Email:', auth.currentUser.email);
      
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send email');
      }

      const result = await response.json();
      console.log('[Translate] ✅ Verification email sent:', result.provider);
      if (result.provider?.includes('SendGrid')) {
        console.log('[Translate] 🚀 Delivery time:', result.deliveryTime);
      }
      setLastResendTime(now);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('[Translate] ❌ Error sending verification email:', error);
      const errorMessage = error?.message || 'Unknown error';
      toast.error(`Failed to send verification email: ${errorMessage}`);
    } finally {
      setResendingVerification(false);
    }
  };

  // Check verification status manually
  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      const verified = await checkEmailVerification(true); // Force check, ignore throttle
      if (verified) {
        toast.success('Email verified! You can now use all features.');
        // Note: Pending translation will be handled by verification-complete event
        // AuthContext will dispatch the event and the handler below will process it
      } else {
        toast.info('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  // Note: Auto-polling removed - AuthContext now handles verification detection
  // and dispatches 'verification-complete' event which is handled below

  // Note: Tab focus checking disabled - AuthContext handles this automatically
  
  // Listen for verification events from other tabs (via BroadcastChannel)
  useEffect(() => {
    console.log('[Translate] Setting up verification-complete event listener');
    
    const handleVerificationComplete = () => {
      console.log('[Translate] ✓ verification-complete event received!');
      // Check for pending translation and auto-execute
      const pendingData = localStorage.getItem('pendingTranslation');
      console.log('[Translate] Pending translation data:', pendingData);
      if (pendingData) {
        try {
          const pending = JSON.parse(pendingData);
          localStorage.removeItem('pendingTranslation');
          
          console.log('[Translate] Restoring pending translation:', pending);
          
          // Clear any error message from the output
          console.log('[Translate] Clearing translation output');
          setTranslation(null);
          
          // Restore the saved state
          if (pending.selectedMessageId) {
            console.log('[Translate] Restoring selectedMessageId:', pending.selectedMessageId);
            setSelectedMessageId(pending.selectedMessageId);
          }
          if (pending.customTitle) setCustomTitle(pending.customTitle);
          if (pending.customDescription) setCustomDescription(pending.customDescription);
          if (pending.context) setContext(pending.context);
          if (pending.targetLanguage) setTargetLanguage(pending.targetLanguage);
          
          // Trigger generation
          console.log('[Translate] Triggering auto-generation after verification');
          setTimeout(() => {
            console.log('[Translate] Executing setShouldGenerate(true)');
            setShouldGenerate(true);
          }, 500);
          toast.success('Email verified! Generating your translation...');
        } catch (err) {
          console.error('[Translate] Error parsing pending translation:', err);
        }
      } else {
        console.log('[Translate] No pending translation found in localStorage');
      }
    };
    
    window.addEventListener('verification-complete', handleVerificationComplete);
    console.log('[Translate] Event listener attached for verification-complete');
    
    return () => {
      console.log('[Translate] Removing verification-complete event listener');
      window.removeEventListener('verification-complete', handleVerificationComplete);
    };
  }, []);
  
  // Generate message when dialog closes with shouldGenerate flag
  useEffect(() => {
    if (!selectedMessageId || isDialogOpen || !shouldGenerate) return;

    setShouldGenerate(false); // Reset flag

    // Scroll to output section to show spinner and results
    if (outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const generateTranslation = async () => {
      setIsLoading(true);
      try {
        // Safety check: Ensure email is verified before making API call
        // (This shouldn't be needed if all paths check properly, but just in case)
        if (user && !user.isAnonymous && !isEmailVerified) {
          console.warn('[Generate] Email not verified, aborting translation');
          setTranslation({
            wording: 'Email verification required. Please verify your email to use this feature.',
            explanation: '',
            reception: ''
          });
          setIsLoading(false);
          return;
        }

        // Check if user has sufficient credits
        if (credits === null || credits <= 0) {
          console.log('[Generate] Insufficient credits, saving pending translation and opening pricing modal');
          
          // Save pending translation to localStorage so it can be triggered after payment
          localStorage.setItem('pendingTranslation', JSON.stringify({
            selectedMessageId,
            customTitle,
            customDescription,
            context,
            targetLanguage
          }));
          
          setIsLoading(false);
          setIsPricingModalOpen(true);
          return;
        }

        let messageType, messageDescription;

        if (selectedMessageId === 'custom-input') {
          messageType = customTitle;
          messageDescription = customDescription;
        } else {
          const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
          if (!selectedMessage) {
            console.error('[Generate] No message found for ID:', selectedMessageId);
            toast.error('Please select a message to translate.');
            return;
          }
          messageType = selectedMessage.title;
          messageDescription = selectedMessage.description;
        }

        console.log('[Generate] Starting translation:', { messageType, locale: targetLanguage, user: user?.email });

        // Get Firebase auth token
        const idToken = user ? await user.getIdToken() : null;
        
        if (!idToken) {
          console.error('[Generate] No auth token available');
          throw new Error('Authentication required');
        }

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            messageType,
            messageDescription,
            context,
            locale,
            targetLanguage
          })
        });

        console.log('[Generate] API response status:', response.status);

        if (!response.ok) {
          let errorData: { error?: string } = {};
          try {
            errorData = await response.json();
            console.error('[Generate] API error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
          } catch (parseError) {
            // If JSON parsing fails, try to get the text response
            const textResponse = await response.text().catch(() => '');
            console.error('[Generate] API error (non-JSON):', {
              status: response.status,
              statusText: response.statusText,
              response: textResponse
            });
          }
          
          let errorMessage = t('errors.genericError');
          
          // Map API errors to localized messages
          if (response.status === 429) {
            errorMessage = t('errors.rateLimitExceeded');
          } else if (response.status === 402) {
            errorMessage = t('errors.insufficientCredits');
            setCredits(0); // Update credits display
          } else if (response.status === 403) {
            errorMessage = errorData.error || 'Email verification required';
          } else if (response.status === 400 && errorData.error?.includes('too long')) {
            errorMessage = t('errors.messageTooLong');
          } else if (response.status === 500) {
            errorMessage = t('errors.generationFailed');
          }
          
          // Display error message to user without throwing
          setTranslation({
            wording: errorMessage,
            explanation: '',
            reception: ''
          });
          return;
        }

        const result = await response.json();
        console.log('[Generate] Translation successful');
        setTranslation(result);
        
        // Update credits after successful generation
        if (user) {
          const updatedToken = await user.getIdToken();
          const creditsResponse = await fetch('/api/credits', {
            headers: {
              'Authorization': `Bearer ${updatedToken}`
            }
          });
          if (creditsResponse.ok) {
            const data = await creditsResponse.json();
            setCredits(data.credits);
          }
        }
      } catch (error) {
        console.error('[Generate] Unexpected error:', error);
        toast.error(t('errors.generationFailed'));
        // Also show the error in the output
        setTranslation({
          wording: t('errors.generationFailed'),
          explanation: error instanceof Error ? error.message : 'Unknown error',
          reception: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateTranslation();
  }, [selectedMessageId, isDialogOpen, shouldGenerate, context, customTitle, customDescription, user, locale, targetLanguage, t]);
  
  // Fetch user credits when user logs in
  useEffect(() => {
    console.log('[Credits] useEffect triggered, user:', user?.uid || 'null');
    const fetchCredits = async () => {
      if (!user) {
        console.log('[Credits] No user, setting credits to null');
        setCredits(null);
        return;
      }
      try {
        console.log('[Credits] Fetching credits for user:', user.uid);
        const idToken = await user.getIdToken();
        const response = await fetch('/api/credits', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('[Credits] API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[Credits] Credits fetched successfully:', data.credits);
          setCredits(data.credits);
        } else {
          console.error('[Credits] API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('[Credits] Error fetching credits:', error);
      }
    };
    fetchCredits();
  }, [user]);
  
  // Show success toast when returning from payment and re-fetch credits
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (searchParams.get('payment') === 'success' && !paymentToastShownRef.current) {
        console.log('[Payment] Payment successful, re-fetching credits...');
        paymentToastShownRef.current = true;
        
        // Re-fetch credits after successful payment
        if (user) {
          try {
            // Add a delay to ensure webhook has processed
            console.log('[Payment] Waiting for webhook to process...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const idToken = await user.getIdToken();
            const response = await fetch('/api/credits', {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              console.log('[Payment] Credits updated after payment:', data.credits);
              setCredits(data.credits);
              
              // Check for pending translation and trigger it
              const pendingData = localStorage.getItem('pendingTranslation');
              console.log('[Payment] Pending translation data:', pendingData);
              
              if (pendingData) {
                try {
                  const pending = JSON.parse(pendingData);
                  console.log('[Payment] Parsed pending translation:', pending);
                  localStorage.removeItem('pendingTranslation');
                  
                  // Show success toast
                  toast.success(t('payment.success') || 'Payment successful! Generating your translation...');
                  
                  // Clear any error message from the output
                  setTranslation(null);
                  
                  // Restore the saved state
                  console.log('[Payment] Restoring state...');
                  if (pending.selectedMessageId) {
                    console.log('[Payment] Setting selectedMessageId:', pending.selectedMessageId);
                    setSelectedMessageId(pending.selectedMessageId);
                  }
                  if (pending.customTitle) {
                    console.log('[Payment] Setting customTitle:', pending.customTitle);
                    setCustomTitle(pending.customTitle);
                  }
                  if (pending.customDescription) {
                    console.log('[Payment] Setting customDescription:', pending.customDescription);
                    setCustomDescription(pending.customDescription);
                  }
                  if (pending.context) {
                    console.log('[Payment] Setting context');
                    setContext(pending.context);
                  }
                  if (pending.targetLanguage) {
                    console.log('[Payment] Setting targetLanguage:', pending.targetLanguage);
                    setTargetLanguage(pending.targetLanguage);
                  }
                  
                  // Trigger generation after state is set
                  console.log('[Payment] Triggering auto-generation in 1 second...');
                  setTimeout(() => {
                    console.log('[Payment] Executing setShouldGenerate(true)');
                    setShouldGenerate(true);
                  }, 1000);
                } catch (err) {
                  console.error('[Payment] Error parsing pending translation:', err);
                  toast.success(t('payment.success') || 'Payment successful! Your credits have been added.');
                }
              } else {
                console.log('[Payment] No pending translation found in localStorage');
                toast.success(t('payment.success') || 'Payment successful! Your credits have been added.');
              }
            } else {
              console.error('[Payment] Failed to fetch credits after payment');
              toast.success(t('payment.success') || 'Payment successful! Your credits have been added.');
            }
          } catch (error) {
            console.error('[Payment] Error re-fetching credits:', error);
            toast.success(t('payment.success') || 'Payment successful! Your credits have been added.');
          }
        } else {
          console.log('[Payment] No user found after payment redirect');
          toast.success(t('payment.success') || 'Payment successful! Your credits have been added.');
        }
        
        // Clean up URL
        console.log('[Payment] Cleaning up URL...');
        router.replace(`/${locale}/translate`);
      }
    };
    
    handlePaymentSuccess();
  }, [searchParams, router, t, user, locale]);
  
  const selectedMessage = coreMessages.find(m => m.id === selectedMessageId);
  const selectedMessageKey = selectedMessage ? toCamelCase(selectedMessage.id) : '';
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Email Verification Banner */}
      {user && !user.isAnonymous && !isEmailVerified && (
        <div className="bg-gradient-to-r from-orange-500/10 to-primary/10 border-b border-orange-500/20">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Please verify your email to run translations
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check your inbox for a verification link
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResendVerification}
                variant="outline"
                size="sm"
                disabled={resendingVerification}
                className="flex-shrink-0"
              >
                {resendingVerification ? 'Sending...' : 'Resend Email'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Verification Full-Screen Overlay */}
      {user && !user.isAnonymous && !isEmailVerified && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-card border border-border shadow-2xl">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('verification.title')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('verification.sentTo')} <span className="font-medium text-foreground">{user.email}</span>
                </p>
              </div>
              {/* Instructions */}
              <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">1.</span> {t('verification.step1')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">2.</span> {t('verification.step2')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">3.</span> {t('verification.step3')}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  size="sm"
                  disabled={resendingVerification}
                  className="w-full"
                >
                  {resendingVerification ? t('verification.sending') : t('verification.resend')}
                </Button>
              </div>
              {/* Footer */}
              <p className="text-xs text-muted-foreground">
                {t('verification.spamNote')}
              </p>
            </div>
          </div>
        </div>
      )}
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
          <div ref={outputRef}>
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
                  <p className="text-muted-foreground">{t('translatePage.generatingMessage')}</p>
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
                
                <TranslationOutput variant={translation} context={context} targetLanguage={targetLanguage} credits={credits} />
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
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-title" className="text-sm font-medium text-foreground">
                    {t('translatePage.customInputTitleLabel')}
                  </label>
                  <span className={`text-xs ${
                    customTitle.length > 60 
                      ? 'text-destructive font-medium' 
                      : customTitle.length > 54 
                      ? 'text-orange-500' 
                      : 'text-muted-foreground'
                  }`}>
                    {customTitle.length}/60
                  </span>
                </div>
                <input
                  id="custom-title"
                  type="text"
                  placeholder={t('translatePage.customInputTitlePlaceholder')}
                  value={customTitle}
                  onChange={(e) => {
                    if (e.target.value.length <= 60) {
                      setCustomTitle(e.target.value);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    customTitle.length > 60
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-input focus:ring-ring'
                  }`}
                />
                {customTitle.length > 60 && (
                  <p className="text-xs text-destructive mt-1">
                    {t('errors.titleLimitExceeded')}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-description" className="text-sm font-medium text-foreground">
                    {t('translatePage.customInputTopicLabel')}
                  </label>
                  <span className={`text-xs ${
                    customDescription.length > 1000 
                      ? 'text-destructive font-medium' 
                      : customDescription.length > 900 
                      ? 'text-orange-500' 
                      : 'text-muted-foreground'
                  }`}>
                    {customDescription.length}/1000
                  </span>
                </div>
                <textarea
                  id="custom-description"
                  placeholder={t('translatePage.customInputTopicPlaceholder')}
                  value={customDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setCustomDescription(e.target.value);
                    }
                  }}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-md border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${
                    customDescription.length > 1000
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-input focus:ring-ring'
                  }`}
                />
                {customDescription.length > 1000 && (
                  <p className="text-xs text-destructive mt-1">
                    {t('errors.characterLimitExceeded')}
                  </p>
                )}
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
                disabled={!customTitle.trim() || !customDescription.trim() || customTitle.length > 60 || customDescription.length > 1000}
              >
                {t('translatePage.continue')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={async () => {
            // After successful auth, check if email is verified before generating
            // Wait a moment for Firebase auth state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check the actual Firebase user's emailVerified property
            const currentUser = auth.currentUser;
            const isVerified = currentUser?.emailVerified || false;
            
            console.log('[Translate] Auth success - User:', currentUser?.email, 'Email verified:', isVerified);
            
            if (!isVerified) {
              console.log('[Translate] Email linked but not verified, saving pending translation');
              localStorage.setItem('pendingTranslation', JSON.stringify({
                selectedMessageId,
                customTitle,
                customDescription,
                context,
                targetLanguage
              }));
              // Note: Don't show toast here - the full-screen verification overlay
              // will automatically appear with proper instructions
            } else {
              // Email already verified - check credits before triggering generation
              console.log('[Translate] Email already verified, checking credits...');
              if (!currentUser) {
                console.error('[Translate] No current user found');
                return;
              }
              try {
                const idToken = await currentUser.getIdToken();
                const response = await fetch('/api/credits', {
                  headers: {
                    'Authorization': `Bearer ${idToken}`
                  }
                });
                if (response.ok) {
                  const data = await response.json();
                  console.log('[Translate] User has', data.credits, 'credits');
                  setCredits(data.credits);
                  
                  if (data.credits <= 0) {
                    console.log('[Translate] Insufficient credits, saving pending translation and opening pricing modal');
                    
                    // Save pending translation so it can be triggered after payment
                    localStorage.setItem('pendingTranslation', JSON.stringify({
                      selectedMessageId,
                      customTitle,
                      customDescription,
                      context,
                      targetLanguage
                    }));
                    
                    setIsPricingModalOpen(true);
                  } else {
                    console.log('[Translate] Credits available, triggering generation');
                    setShouldGenerate(true);
                  }
                } else {
                  console.error('[Translate] Failed to fetch credits, triggering generation anyway');
                  setShouldGenerate(true);
                }
              } catch (error) {
                console.error('[Translate] Error checking credits:', error);
                setShouldGenerate(true); // Still try to generate, API will handle insufficient credits
              }
            }
          }}
        />

        {/* Pricing Modal */}
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
        />

        {/* Context Adjustment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent hideCloseButton>
            <DialogHeader>
              <DialogDescription className="sr-only">
                Adjust context settings for your translation
              </DialogDescription>
              <div className="flex items-center justify-between">
                <DialogTitle>{t('translatePage.step2')}</DialogTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="orange"
                    size="sm"
                    onClick={async () => {
                      // If no user, try to sign in anonymously first (Option C workflow)
                      if (!user) {
                        try {
                          await signInAnonymouslyWithState();
                          // After anonymous sign-in, show auth modal
                          setIsDialogOpen(false);
                          setIsAuthModalOpen(true);
                        } catch (error: any) {
                          console.error('Error signing in anonymously:', error);
                          
                          // If anonymous auth is not enabled, skip it and show auth modal directly
                          if (error?.code === 'auth/admin-restricted-operation') {
                            console.warn('Anonymous auth not enabled. Showing auth modal directly.');
                            setIsDialogOpen(false);
                            setIsAuthModalOpen(true);
                          } else {
                            toast.error('Failed to initialize session. Please try again.');
                          }
                        }
                        return;
                      }
                      
                      // If anonymous, show auth modal to link account
                      if (user.isAnonymous) {
                        setIsDialogOpen(false);
                        setIsAuthModalOpen(true);
                        return;
                      }
                      
                      // If email not verified, save pending action and show verification gate
                      if (!isEmailVerified) {
                        // Save the full translation request for later execution
                        localStorage.setItem('pendingTranslation', JSON.stringify({
                          selectedMessageId,
                          customTitle,
                          customDescription,
                          context,
                          targetLanguage
                        }));
                        setIsDialogOpen(false);
                        // Note: Don't show toast - the full-screen verification overlay
                        // will automatically appear with clear instructions
                        return;
                      }
                      
                      // Check credits
                      if (credits === 0) {
                        console.log('[Dialog] Insufficient credits, saving pending translation and opening pricing modal');
                        
                        // Save pending translation so it can be triggered after payment
                        localStorage.setItem('pendingTranslation', JSON.stringify({
                          selectedMessageId,
                          customTitle,
                          customDescription,
                          context,
                          targetLanguage
                        }));
                        
                        setIsDialogOpen(false);
                        setIsPricingModalOpen(true);
                        return;
                      }
                      
                      // All checks passed, generate translation
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
                <div className="flex gap-4">
                  {/* Medium Section - 2/3 width */}
                  <div className="flex-[2] space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('translatePage.medium')}</span>
                    <div className="flex flex-col gap-2">
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
                    </div>
                  </div>

                  {/* Language Section - 1/3 width */}
                  <div className="flex-1 space-y-2">
                    <span className="text-sm font-medium text-foreground">{t('translatePage.translateTo')}</span>
                    <button
                      onClick={() => setIsLanguageModalOpen(true)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                        targetLanguage
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      }`}
                      style={{ height: 'calc(100% - 1.75rem)' }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('en');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageEnglish')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('es');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageSpanish')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('fr');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageFrench')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('de');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageGerman')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('it');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageItalian')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('pt');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languagePortuguese')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('nl');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageDutch')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetLanguage('ja');
                  setIsLanguageModalOpen(false);
                }}
                className="px-4 py-6 text-sm font-medium rounded-lg border border-border bg-secondary hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                {t('translatePage.languageJapanese')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
  );}