"use client";

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extend HTMLElement to include the custom stripe-pricing-table element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': {
        'pricing-table-id': string;
        'publishable-key': string;
        'customer-email'?: string;
        'client-reference-id'?: string;
        'success-url'?: string;
      };
    }
  }
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const t = useTranslations();
  const { user } = useAuth();

  useEffect(() => {
    // Load Stripe pricing table script
    if (isOpen && !document.querySelector('script[src*="stripe.com/v3/pricing-table.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      script.onload = () => {
        console.log('Stripe pricing table script loaded');
      };
      script.onerror = () => {
        console.error('Failed to load Stripe pricing table script');
      };
      document.body.appendChild(script);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      console.log('PricingModal opened with user:', {
        email: user.email,
        uid: user.uid
      });
    }
  }, [isOpen, user]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] xl:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg font-semibold text-center">
            {t('pricingModal.title') || 'This rewrite is ready to go.'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs pt-1">
            {t('pricingModal.subtitle') || 'Add credits to continue.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {user ? (
            <stripe-pricing-table 
              pricing-table-id="prctbl_1Sx3BECmaIZImua13XHmGnDT"
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              customer-email={user.email || undefined}
              client-reference-id={user.uid}
              success-url={typeof window !== 'undefined' ? `${window.location.origin}/translate?payment=success` : undefined}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Loading user information...
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pb-2">
          {t('pricingModal.securePayment') || 'Secure payment powered by Stripe'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
