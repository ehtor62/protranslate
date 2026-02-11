"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { User, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const { user, signOutUser } = useAuth();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1];

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Sign out error:', error);
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
      <div className="container flex h-16 items-start md:items-center justify-between pt-4 md:pt-0">
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
        
        <nav className="flex items-center gap-6 mt-8 md:mt-0">
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
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
