import { ReactNode, Suspense } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReferralCapture } from '@/components/ReferralCapture';
import { FeedbackButton } from '@/components/FeedbackButton';

export default async function LocaleProviders({ children }: { children: ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <TooltipProvider>
          <Suspense fallback={null}>
            <ReferralCapture />
          </Suspense>
          <Sonner position="top-center" expand={true} richColors />
          <FeedbackButton />
          {children}
        </TooltipProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
