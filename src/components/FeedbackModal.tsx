"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const t = useTranslations('feedback');
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error(t('pleaseRate') || 'Please provide a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        rating,
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
      };

      // Add user info if authenticated
      if (user) {
        payload.userId = user.uid;
        payload.userEmail = user.email;
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success(t('thankYou') || 'Thank you for your feedback!');
      
      // Reset form and close modal
      setRating(null);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('errorSubmitting') || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(null);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('title') || 'Share Your Feedback'}
          </DialogTitle>
          <DialogDescription>
            {t('subtitle') || 'Help us improve by sharing your thoughts'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('ratingLabel') || 'How would you rate your experience?'}
            </label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating && star <= rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="feedback-comment" className="text-sm font-medium text-foreground">
              {t('commentLabel') || 'Comments (optional)'}
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder') || 'Tell us what you think...'}
              className="w-full min-h-[120px] p-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="orange"
              disabled={isSubmitting || !rating}
            >
              {isSubmitting ? (t('submitting') || 'Submitting...') : (t('submit') || 'Submit Feedback')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
