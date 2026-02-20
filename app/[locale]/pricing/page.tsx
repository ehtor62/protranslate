'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export default function PricingPage() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Load Stripe pricing table script
    if (!document.querySelector('script[src*="stripe.com/v3/pricing-table.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  
  // Clean up URL param if present (toast is shown on translate page)
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      // Just clean up URL without showing toast (handled by translate page)
      router.replace('/pricing');
    }
  }, [searchParams, router]);
  
  const packs = [
    { name: 'starterPack', rewrites: 50, price: '€7.99', description: 'starterDesc' },
    { name: 'professionalPack', rewrites: 150, price: '€19.99', popular: true, description: 'professionalDesc' },
    { name: 'powerPack', rewrites: 500, price: '€49.99', description: 'powerDesc' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-muted text-center">
            <p className="text-sm text-muted-foreground">
              {t('freeTrialNote')}
            </p>
          </div>

          <div className="bg-surface-elevated rounded-xl p-8 shadow-lg">
            {user ? (
              <stripe-pricing-table 
                pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || ''}
                publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                customer-email={user.email || undefined}
                client-reference-id={user.uid}
                success-url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://sentenly.com'}/${locale}/translate?payment=success`}
              />
            ) : (
              <stripe-pricing-table 
                pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || ''}
                publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                success-url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://sentenly.com'}/${locale}/pricing?payment=success`}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-primary font-medium">
                {t('starterNote')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-primary font-medium">
                {t('professionalNote')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-primary font-medium">
                {t('powerNote')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
