'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('404')}</h1>
        <p className="text-muted-foreground mb-8">{t('pageNotFound')}</p>
        <Link
          href="/"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          {t('returnHome')}
        </Link>
      </div>
    </div>
  );
}
