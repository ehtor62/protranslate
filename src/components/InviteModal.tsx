"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Copy, Check, Loader2 } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !referralCode) {
      fetchReferralCode();
    }
  }, [isOpen]);

  const fetchReferralCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const token = await user.getIdToken();
      
      const response = await fetch('/api/referral/generate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral code');
      }
      const data = await response.json();
      setReferralCode(data.referralCode);
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setError('Failed to load referral link');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = typeof window !== 'undefined' && referralCode
    ? `${window.location.origin}?ref=${referralCode}`
    : 'Loading...';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            {t('inviteModal.title') || 'Invite & Earn Credits'}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-3 leading-relaxed">
            {t('inviteModal.description') || 'Know someone who struggles with difficult professional messages? Invite them and earn 10 free rewrites when they start using the tool.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={fetchReferralCode} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('inviteModal.yourLink') || 'Your referral link'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="default"
                    size="sm"
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        {t('inviteModal.linkCopied') || 'Link copied!'}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        {t('inviteModal.copyLink') || 'Copy Link'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('inviteModal.shareInstructions') || 'Share this link with colleagues who need help with professional messaging.'}
              </p>
            </>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pb-2 px-4 leading-relaxed">
          {t('inviteModal.footnote') || "You'll receive the credits after your invitee finishes their free rewrites and generates their next message."}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            {t('inviteModal.close') || 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
