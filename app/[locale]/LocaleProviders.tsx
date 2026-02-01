import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function LocaleProviders({ children }: { children: ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          {children}
        </TooltipProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
