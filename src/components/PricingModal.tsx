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
      document.body.appendChild(script);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('pricingModal.title') || 'This rewrite is ready to go.'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm pt-1">
            {t('pricingModal.subtitle') || 'Add credits to continue.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1Sx3BECmaIZImua13XHmGnDT"
            publishable-key="pk_test_51SwmHXCmaIZImua1jsq89Qbmzqc64orLNCy3Qg6eSiHvUexZxLXscgAlbEcdZDAe4afLIQTdQSnKYlVmnkCT3yt600sEZxIebU"
            customer-email={user?.email || undefined}
            client-reference-id={user?.uid || undefined}
          />
        </div>

        <div className="text-center text-xs text-muted-foreground pb-2">
          {t('pricingModal.securePayment') || 'Secure payment powered by Stripe'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
