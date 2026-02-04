'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

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

export default function PricingPage() {
  const t = useTranslations('pricing');
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
                pricing-table-id="prctbl_1Sx3BECmaIZImua13XHmGnDT"
                publishable-key="pk_test_51SwmHXCmaIZImua1jsq89Qbmzqc64orLNCy3Qg6eSiHvUexZxLXscgAlbEcdZDAe4afLIQTdQSnKYlVmnkCT3yt600sEZxIebU"
                customer-email={user.email || undefined}
                client-reference-id={user.uid}
              />
            ) : (
              <stripe-pricing-table 
                pricing-table-id="prctbl_1Sx3BECmaIZImua13XHmGnDT"
                publishable-key="pk_test_51SwmHXCmaIZImua1jsq89Qbmzqc64orLNCy3Qg6eSiHvUexZxLXscgAlbEcdZDAe4afLIQTdQSnKYlVmnkCT3yt600sEZxIebU"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
