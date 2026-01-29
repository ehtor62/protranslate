"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Languages className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">ProTranslate</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm transition-colors",
              pathname === '/'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/translate"
            className={cn(
              "text-sm transition-colors",
              pathname === '/translate'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Translate
          </Link>
        </nav>
      </div>
    </header>
  );
}
