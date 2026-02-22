"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { User, LogOut, Menu } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const { user, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1];

  const handleSignOut = async () => {
    console.log('[Header] Sign out button clicked');
    try {
      console.log('[Header] Calling signOutUser');
      await signOutUser();
      console.log('[Header] signOutUser complete, redirecting to home');
      router.push(`/${locale}`);
    } catch (error) {
      console.error('[Header] Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Sentenly Logo"
              width={32}
              height={32}
              className="w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Sentenly</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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
          <Link
            href={`/${locale}/pricing`}
            className={cn(
              "text-sm transition-colors",
              pathname.startsWith(`/${locale}/pricing`)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('pricing')}
          </Link>
          <LanguageSwitcher />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-9 w-9 rounded-full p-0 bg-primary/10 hover:bg-primary/20"
                >
                  <User className="w-4 h-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium text-foreground">{user.displayName || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-9 w-9 rounded-full p-0 bg-primary/10 hover:bg-primary/20"
                >
                  <User className="w-4 h-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium text-foreground">{user.displayName || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href={`/${locale}/translate`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors py-2",
                    pathname.startsWith(`/${locale}/translate`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('translate')}
                </Link>
                <Link
                  href={`/${locale}/pricing`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors py-2",
                    pathname.startsWith(`/${locale}/pricing`)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t('pricing')}
                </Link>
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-3">
                    {t('language')}
                  </div>
                  <LanguageSwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
