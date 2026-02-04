'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const t = useTranslations('pricing');
  
  const packs = [
    { name: 'starterPack', rewrites: 10, price: '€1.99', description: 'starterDesc' },
    { name: 'professionalPack', rewrites: 50, price: '€7.99', popular: true, description: 'professionalDesc' },
    { name: 'powerPack', rewrites: 150, price: '€19.99', description: 'powerDesc' },
    { name: 'teamPack', rewrites: 500, price: '€49.99', description: 'teamDesc' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.rewrites}
                className={`relative p-6 rounded-xl border-2 transition-colors flex flex-col ${
                  pack.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface-elevated hover:border-primary'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {t('popular') || 'Most Popular'}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-base font-bold text-foreground mb-2">
                    ⭐ {t(pack.name)}
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {pack.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('rewriteCount', { count: pack.rewrites })}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{t('feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{t('feature2')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{t('feature3')}</span>
                  </li>
                </ul>

                <div className="flex-1">
                  {pack.description && (
                    <div className="mb-4 text-xs text-primary font-medium">
                      👉 {t(pack.description)}
                    </div>
                  )}
                </div>

                <Button className="w-full mt-auto">
                  {t('buyNow')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
