"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const pricingTiers = [
  { name: 'starterPack', credits: 10, price: 1.99, popular: false, description: 'starterDesc' },
  { name: 'professionalPack', credits: 50, price: 7.99, popular: true, description: 'professionalDesc' },
  { name: 'powerPack', credits: 150, price: 19.99, popular: false, description: 'powerDesc' },
  { name: 'teamPack', credits: 500, price: 49.99, popular: false, description: 'teamDesc' },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const t = useTranslations();
  const locale = useLocale();

  const handlePurchase = (credits: number, price: number) => {
    // TODO: Implement Stripe payment integration
    console.log(`Purchasing ${credits} credits for $${price}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('pricingModal.title') || 'This rewrite is ready to go.'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm pt-1">
            {t('pricingModal.subtitle') || 'Add credits to continue.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.credits}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                tier.popular
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {t('pricingModal.popular') || 'Most Popular'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {t(`pricing.${tier.name}`) || tier.name}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">€{tier.price}</span>
                    <span className="text-sm text-muted-foreground">
                      {t('pricingModal.forCredits', { count: tier.credits }) || `for ${tier.credits} balance`}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {t('pricing.feature1') || 'All languages supported'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {t('pricing.feature2') || 'Meaning-aware professional rewriting'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {t('pricing.feature3') || 'Never expires'}
                    </span>
                  </div>
                  {tier.description && (
                    <div className="mt-2 text-xs text-primary font-medium">
                      👉 {t(`pricing.${tier.description}`)}
                    </div>
                  )}
                </div>
                
                <Button
                  variant={tier.popular ? "default" : "outline"}
                  size="sm"
                  className={tier.popular ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => handlePurchase(tier.credits, tier.price)}
                >
                  {t('pricingModal.buyNow') || 'Buy Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground pb-2">
          {t('pricingModal.securePayment') || 'Secure payment powered by Stripe'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
