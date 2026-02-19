"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Client component that captures referral codes from URL parameters
 * and stores them in localStorage until the user signs up.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode && refCode.length > 0) {
      // Store the referral code in localStorage
      localStorage.setItem('referralCode', refCode);
      console.log('[ReferralCapture] ✅ Referral code captured and stored:', refCode);
    } else {
      console.log('[ReferralCapture] No referral code in URL');
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
