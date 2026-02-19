"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackButton() {
  const t = useTranslations('feedback');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        aria-label={t('buttonLabel') || 'Feedback'}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {t('buttonText') || 'Feedback'}
        </span>
      </button>

      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
