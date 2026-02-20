"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { HeroDemo } from '@/components/HeroDemo';
import { ArrowRight, Languages, Sliders, Globe, FileText, Users, Shield } from 'lucide-react';

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  
  const features = [
    {
      icon: Sliders,
      title: t('features.contextAware.title'),
      description: t('features.contextAware.description')
    },
    {
      icon: Globe,
      title: t('features.culturalCalibration.title'),
      description: t('features.culturalCalibration.description')
    },
    {
      icon: FileText,
      title: t('features.mediumSpecific.title'),
      description: t('features.mediumSpecific.description')
    },
    {
      icon: Users,
      title: t('features.powerDynamic.title'),
      description: t('features.powerDynamic.description')
    }
  ];

  const messageExamples = [
    t('messageTypes.termination'),
    t('messageTypes.rejection'),
    t('messageTypes.boundary'),
    t('messageTypes.negativeFeedback'),
    t('messageTypes.sayingNo'),
    t('messageTypes.withdrawing')
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero section */}
      <section className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--gradient-hero)' }}
        />
        
        <div className="container py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
            {/* Left column - Text */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <Languages className="w-4 h-4" />
                <span>{t('hero.badge')}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-foreground">{t('hero.headline1')}</span>
                <br />
                <span className="gradient-text">{t('hero.headline2')}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl"
                dangerouslySetInnerHTML={{ __html: t.raw('hero.description') }}
              />
              
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="xl">
                  <Link href={`/${locale}/translate`}>
                    {t('hero.ctaPrimary')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <a href="#how-it-works">{t('hero.ctaSecondary')}</a>
                </Button>
              </div>
            </div>
            
            {/* Right column - Interactive demo */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0">
              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('hero.livePreview')}</span>
                </div>
                <HeroDemo locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Message types */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-muted-foreground">{t('messageTypes.title')}</span>
            {messageExamples.map((example, i) => (
              <span
                key={i}
                className="text-sm text-secondary-foreground hover:text-foreground transition-colors cursor-default"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.sectionTitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.sectionDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card border border-border hover:border-muted-foreground transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <Button asChild variant="hero" size="xl">
              <Link href={`/${locale}/translate`}>
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('common.appName')}</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.terms')}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 {t('common.appName')}. {t('common.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
