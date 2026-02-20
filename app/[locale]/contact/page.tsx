"use client";

import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Mail, HelpCircle, CreditCard, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const t = useTranslations('contact');

  const faqCategories = [
    {
      icon: HelpCircle,
      titleKey: 'faq.account.title',
      questions: [
        { q: 'faq.account.q1', a: 'faq.account.a1' },
        { q: 'faq.account.q2', a: 'faq.account.a2' },
        { q: 'faq.account.q3', a: 'faq.account.a3' },
      ]
    },
    {
      icon: CreditCard,
      titleKey: 'faq.billing.title',
      questions: [
        { q: 'faq.billing.q1', a: 'faq.billing.a1' },
        { q: 'faq.billing.q2', a: 'faq.billing.a2' },
        { q: 'faq.billing.q3', a: 'faq.billing.a3' },
      ]
    },
    {
      icon: Settings,
      titleKey: 'faq.technical.title',
      questions: [
        { q: 'faq.technical.q1', a: 'faq.technical.a1' },
        { q: 'faq.technical.q2', a: 'faq.technical.a2' },
        { q: 'faq.technical.q3', a: 'faq.technical.a3' },
      ]
    },
    {
      icon: Lock,
      titleKey: 'faq.privacy.title',
      questions: [
        { q: 'faq.privacy.q1', a: 'faq.privacy.a1' },
        { q: 'faq.privacy.q2', a: 'faq.privacy.a2' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{t('title')}</h1>
          </div>
          
          <p className="text-lg text-muted-foreground mb-12">
            {t('subtitle')}
          </p>

          {/* Contact Section */}
          <section className="bg-muted/50 p-8 rounded-lg border border-border mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('getInTouch')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('emailDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button asChild size="lg">
                <a href="mailto:inbox@sentenly.com">
                  <Mail className="w-4 h-4 mr-2" />
                  {t('emailButton')}
                </a>
              </Button>
              <div className="flex flex-col">
                <p className="text-sm text-foreground font-medium">inbox@sentenly.com</p>
                <p className="text-xs text-muted-foreground">{t('responseTime')}</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">{t('faqTitle')}</h2>
            
            <div className="space-y-8">
              {faqCategories.map((category, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {t(category.titleKey)}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 pl-13">
                    {category.questions.map((item, qIdx) => (
                      <div key={qIdx} className="border-l-2 border-border pl-4 py-2">
                        <h4 className="font-medium text-foreground mb-2">
                          {t(item.q)}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {t(item.a)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Still Need Help */}
          <section className="mt-12 p-6 rounded-lg border border-border bg-card text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('stillNeedHelp')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('stillNeedHelpDescription')}
            </p>
            <Button asChild variant="outline">
              <a href="mailto:inbox@sentenly.com">
                {t('contactUs')}
              </a>
            </Button>
          </section>
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
