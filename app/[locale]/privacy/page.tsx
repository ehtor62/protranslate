"use client";

import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
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

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('infoCollect.title')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">{t('infoCollect.account.title')}</h3>
                  <p className="text-muted-foreground">{t('infoCollect.account.content')}</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{t('infoCollect.usage.title')}</h3>
                  <p className="text-muted-foreground">{t('infoCollect.usage.content')}</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{t('infoCollect.content.title')}</h3>
                  <p className="text-muted-foreground">{t('infoCollect.content.content')}</p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('howWeUse.title')}</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('howWeUse.item1')}</li>
                <li>{t('howWeUse.item2')}</li>
                <li>{t('howWeUse.item3')}</li>
                <li>{t('howWeUse.item4')}</li>
                <li>{t('howWeUse.item5')}</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('security.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('security.content')}
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('thirdParty.title')}</h2>
              <p className="text-muted-foreground mb-4">{t('thirdParty.intro')}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Firebase:</strong> {t('thirdParty.firebase')}</li>
                <li><strong>OpenAI:</strong> {t('thirdParty.openai')}</li>
                <li><strong>Stripe:</strong> {t('thirdParty.stripe')}</li>
              </ul>
            </section>

            {/* Your Rights (GDPR) */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('rights.title')}</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>{t('rights.access')}</li>
                <li>{t('rights.rectification')}</li>
                <li>{t('rights.erasure')}</li>
                <li>{t('rights.restriction')}</li>
                <li>{t('rights.portability')}</li>
                <li>{t('rights.objection')}</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('cookies.content')}
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('retention.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('retention.content')}
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('transfers.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('transfers.content')}
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('children.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('children.content')}
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('changes.content')}
              </p>
            </section>

            {/* Contact */}
            <section className="bg-muted/50 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
              <p className="text-muted-foreground mb-2">
                {t('contact.content')}
              </p>
              <p className="text-foreground">
                <strong>Email:</strong> inbox@sentenly.com
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
