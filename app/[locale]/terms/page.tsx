"use client";

import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{t('title')}</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            {t('lastUpdated')}: February 20, 2026
          </p>

          <div className="space-y-8 text-foreground">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('introduction.content')}
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('acceptance.content')}
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('service.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('service.content')}
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('accounts.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('accounts.intro')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('accounts.item1')}</li>
                <li>{t('accounts.item2')}</li>
                <li>{t('accounts.item3')}</li>
                <li>{t('accounts.item4')}</li>
              </ul>
            </section>

            {/* Credits and Payment */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('payment.title')}</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">{t('payment.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>{t('payment.item1')}</li>
                  <li>{t('payment.item2')}</li>
                  <li>{t('payment.item3')}</li>
                  <li>{t('payment.item4')}</li>
                  <li>{t('payment.item5')}</li>
                </ul>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('acceptable.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('acceptable.intro')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('acceptable.item1')}</li>
                <li>{t('acceptable.item2')}</li>
                <li>{t('acceptable.item3')}</li>
                <li>{t('acceptable.item4')}</li>
                <li>{t('acceptable.item5')}</li>
                <li>{t('acceptable.item6')}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('intellectual.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('intellectual.content')}
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('disclaimer.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('disclaimer.content')}
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('liability.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('liability.content')}
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('indemnification.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('indemnification.content')}
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('termination.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('termination.content')}
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('changes.content')}
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('governing.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('governing.content')}
              </p>
            </section>

            {/* Contact */}
            <section className="bg-muted/50 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
              <p className="text-muted-foreground mb-2">
                {t('contact.content')}
              </p>
              <p className="text-foreground">
                <strong>Email:</strong> legal@sentenly.com
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Sentenly. {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
