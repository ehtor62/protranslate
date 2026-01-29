"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { HeroDemo } from '@/components/HeroDemo';
import { ArrowRight, Languages, Sliders, Globe, FileText, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Sliders,
    title: 'Context-aware translation',
    description: 'Adjust formality, directness, power dynamics, and emotional sensitivity to get exactly the right tone.'
  },
  {
    icon: Globe,
    title: 'Cultural calibration',
    description: 'Translations that respect communication norms across US, UK, German, Japanese, and international contexts.'
  },
  {
    icon: FileText,
    title: 'Medium-specific output',
    description: 'Different wording for in-person conversations, emails, and formal written notices.'
  },
  {
    icon: Users,
    title: 'Power dynamic awareness',
    description: 'Calibrated language whether you\'re speaking up, across, or down the hierarchy.'
  }
];

const messageExamples = [
  'Terminating employment',
  'Rejecting a proposal',
  'Setting boundaries',
  'Giving negative feedback',
  'Saying no',
  'Withdrawing support'
];

export default function Home() {
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
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <Languages className="w-4 h-4" />
                <span>Professional message translation</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The same message.
                <br />
                <span className="gradient-text">50 professional translations.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Not language translation. <em>Meaning</em> translation. Adjust context, 
                power dynamics, and cultural norms to craft the exact professional message 
                you need.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="lg">
                  <Link href="/translate">
                    Translate your message
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
            </div>
            
            {/* Right column - Interactive demo */}
            <div className="lg:pl-8">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Live Preview</span>
                </div>
                <HeroDemo />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Message types */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-muted-foreground">Translate:</span>
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
              Context is everything
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The same intent requires different words depending on who you're speaking to, 
              how they prefer to receive information, and what cultural norms apply.
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
              Ready to translate?
            </h2>
            <p className="text-muted-foreground mb-8">
              Choose your message, adjust the context, and get professionally calibrated 
              wording for any situation.
            </p>
            <Button asChild variant="hero" size="xl">
              <Link href="/translate">
                Start translating
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
              <span className="text-sm text-muted-foreground">ProTranslate</span>
            </div>
            <p className="text-sm text-tertiary">
              A systematic translation engine for professional intent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
