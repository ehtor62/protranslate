import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { type CoreMessage } from '@/data/messages';
import { Briefcase, UserX, Shield, MessageSquare, XCircle, LogOut } from 'lucide-react';

interface MessageCardProps {
  message: CoreMessage;
  isSelected: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'termination': UserX,
  'rejection': XCircle,
  'boundary': Shield,
  'negative-feedback': MessageSquare,
  'saying-no': XCircle,
  'withdrawing-support': LogOut,
};

// Convert kebab-case to camelCase for translation keys
const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

export function MessageCard({ message, isSelected, onClick }: MessageCardProps) {
  const Icon = iconMap[message.id] || Briefcase;
  const t = useTranslations('messages');
  const messageKey = toCamelCase(message.id);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all duration-200",
        "hover:border-muted-foreground group",
        isSelected
          ? "bg-primary/5 border-primary shadow-md"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-sm transition-colors",
            isSelected ? "text-foreground" : "text-secondary-foreground"
          )}>
            {t(`${messageKey}.title`)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {t(`${messageKey}.description`)}
          </p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-muted text-tertiary">
            {t(`${messageKey}.category`)}
          </span>
        </div>
      </div>
    </button>
  );
}
