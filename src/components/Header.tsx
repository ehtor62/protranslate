"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const pathname = usePathname();
  const t = useTranslations('common');
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Languages className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">{t('appName')}</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className={cn(
              "text-sm transition-colors",
              pathname === `/${locale}` || pathname === `/${locale}/`
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/translate`}
            className={cn(
              "text-sm transition-colors",
              pathname.startsWith(`/${locale}/translate`)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('translate')}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
