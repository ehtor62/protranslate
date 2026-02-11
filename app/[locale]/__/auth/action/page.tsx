"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../../../../i18n.routing';

// Redirect handler for Firebase's default /__/ pattern
// This handles legacy links that use Firebase Hosting's default path structure
export default function FirebaseAuthRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get all query parameters
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const apiKey = searchParams.get('apiKey');
    const lang = searchParams.get('lang');

    // Build the correct URL without __
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    if (oobCode) params.set('oobCode', oobCode);
    if (apiKey) params.set('apiKey', apiKey);
    if (lang) params.set('lang', lang);

    // Redirect to the correct path
    router.push(`/auth/action?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
