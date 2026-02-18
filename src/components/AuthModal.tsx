"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const t = useTranslations('auth');
  const { user, linkAnonymousAccount } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Check if user is anonymous and link account
        if (user?.isAnonymous) {
          await linkAnonymousAccount(email, password);
          // Close modal and show verification screen
          onSuccess();
          handleClose();
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Initialize user document in Firestore
          try {
            const { doc, setDoc, getFirestore } = await import('firebase/firestore');
            const db = getFirestore();
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
              credits: 5,
              email: email,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          } catch (firestoreError) {
            console.error('Error initializing user document:', firestoreError);
            // Don't block signup if Firestore fails
          }
          
          // Send verification email via SendGrid API
          try {
            const idToken = await userCredential.user.getIdToken();
            console.log('[AuthModal] 📧 Sending verification email via API to:', email);
            
            const response = await fetch('/api/send-verification-email', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.details || 'Failed to send email');
            }

            const result = await response.json();
            console.log('[AuthModal] ✅ Verification email sent:', result.provider);
          } catch (emailError: any) {
            console.error('[AuthModal] ❌ Error sending verification email:', emailError);
            // Don't block signup, but warn the user
            throw new Error('Account created but failed to send verification email. Please use "Resend Email" button.');
          }
          
          // Check for stored referral code and track it
          const referralCode = localStorage.getItem('referralCode');
          if (referralCode) {
            try {
              const idToken = await userCredential.user.getIdToken();
              const response = await fetch('/api/referral/track', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ referralCode }),
              });
              
              if (response.ok) {
                // Clear the referral code from storage
                localStorage.removeItem('referralCode');
              }
            } catch (trackError) {
              // Log error but don't block signup
              console.error('Failed to track referral:', trackError);
            }
          }
          
          // Close modal and show verification screen
          onSuccess();
          handleClose();
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorCode = err.code || '';
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Initialize user document in Firestore (for new users)
      try {
        const { doc, setDoc, getDoc, getFirestore } = await import('firebase/firestore');
        const db = getFirestore();
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // New user - initialize with all required fields
          await setDoc(userDocRef, {
            credits: 5,
            email: userCredential.user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          // Ensure credits field exists for existing users
          const data = userDoc.data();
          if (data && typeof data.credits !== 'number') {
            await setDoc(userDocRef, {
              credits: 5
            }, { merge: true });
          }
        }
      } catch (firestoreError) {
        console.error('Error initializing user document:', firestoreError);
        // Don't block signin if Firestore fails
      }
      
      // Check for stored referral code and track it
      const referralCode = localStorage.getItem('referralCode');
      if (referralCode) {
        try {
          const idToken = await userCredential.user.getIdToken();
          const response = await fetch('/api/referral/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ referralCode }),
          });
          
          if (response.ok) {
            // Clear the referral code from storage
            localStorage.removeItem('referralCode');
          }
        } catch (trackError) {
          // Log error but don't block signup
          console.error('Failed to track referral:', trackError);
        }
      }
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorCode = err.code || '';
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      const errorCode = err.code || '';
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsSignUp(false);
    setIsForgotPassword(false);
    setResetEmailSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {isForgotPassword ? (t('forgotPassword') || 'Forgot Password') : isSignUp ? (t('signUp') || 'Sign Up') : (t('signIn') || 'Sign In')}
          </DialogTitle>
          <DialogDescription className="text-white whitespace-pre-line text-xl">
            {isForgotPassword
              ? (t('forgotPasswordDescription') || 'Enter your email address and we will send you a link to reset your password.')
              : isSignUp 
              ? (t('signUpDescription') || 'Create an account to continue') 
              : (t('signInDescription') || 'Sign in to your account to continue')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4 py-4">
          {resetEmailSent ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  {t('resetEmailSent') || 'Password reset email sent! Check your inbox for instructions.'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                {t('backToSignIn') || 'Back to Sign In'}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('email') || 'Email'}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('emailPlaceholder') || 'you@example.com'}
                />
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    {t('password') || 'Password'}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('passwordPlaceholder') || '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {t('forgotPassword') || 'Forgot password?'}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  variant="orange"
                  disabled={loading}
                  className="w-full"
                >
                  {loading 
                    ? (t('loading') || 'Loading...') 
                    : isForgotPassword
                      ? (t('sendResetLink') || 'Send Reset Link')
                      : isSignUp 
                      ? (t('signUp') || 'Sign Up') 
                      : (t('signIn') || 'Sign In')}
                </Button>

                {isForgotPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError('');
                    }}
                    className="w-full"
                  >
                    {t('backToSignIn') || 'Back to Sign In'}
                  </Button>
                )}

                {!isForgotPassword && (
                  <>
                    <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('orContinueWith') || 'Or continue with'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('continueWithGoogle') || 'Continue with Google'}
            </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                      }}
                      className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {isSignUp 
                        ? (t('alreadyHaveAccount') || 'Already have an account? Sign in') 
                        : (t('needAccount') || "Don't have an account? Sign up")}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
