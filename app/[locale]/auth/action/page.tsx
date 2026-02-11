"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../../../i18n.routing';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function AuthAction() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode');
      const actionCode = searchParams.get('oobCode');

      if (!mode || !actionCode) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new one.');
        return;
      }

      setMode(mode);

      try {
        switch (mode) {
          case 'verifyEmail':
            // Handle email verification
            await applyActionCode(auth, actionCode);
            setStatus('success');
            setMessage('Email verified successfully! You can now use all features.');
            
            // Redirect to translate page after 3 seconds
            setTimeout(() => {
              router.push('/translate');
            }, 3000);
            break;

          case 'resetPassword':
            // Handle password reset
            setStatus('error');
            setMessage('Password reset flow not yet implemented. Please contact support.');
            break;

          case 'recoverEmail':
            // Handle email recovery
            setStatus('error');
            setMessage('Email recovery flow not yet implemented. Please contact support.');
            break;

          default:
            setStatus('error');
            setMessage('Unknown action type. Please try again.');
        }
      } catch (error: any) {
        console.error('Error handling auth action:', error);
        
        let errorMessage = 'Verification failed. ';
        
        switch (error.code) {
          case 'auth/expired-action-code':
            errorMessage += 'This link has expired. Please request a new one.';
            break;
          case 'auth/invalid-action-code':
            errorMessage += 'This link is invalid or has already been used.';
            break;
          case 'auth/user-disabled':
            errorMessage += 'This account has been disabled. Please contact support.';
            break;
          case 'auth/user-not-found':
            errorMessage += 'User not found. Please try signing up again.';
            break;
          default:
            errorMessage += 'Please try again or contact support.';
        }
        
        setStatus('error');
        setMessage(errorMessage);
      }
    };

    handleAuthAction();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-3">
            {status === 'loading' && 'Verifying...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-center text-muted-foreground mb-6">
            {message || 'Processing your request...'}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <Button
                  onClick={() => router.push('/translate')}
                  variant="orange"
                  size="lg"
                  className="w-full"
                >
                  Go to Translate Page
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Redirecting automatically in 3 seconds...
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <Button
                  onClick={() => router.push('/translate')}
                  variant="orange"
                  size="lg"
                  className="w-full"
                >
                  Return to App
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>

          {/* Help Text */}
          {status === 'error' && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <strong>Need help?</strong> If you continue to experience issues, please visit the translate page and use the "Resend Verification Email" button.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
