
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface ContextSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export function ContextSelector({
  label,
  value,
  onChange,
  options,
  className
}: ContextSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-2 text-sm rounded-lg border transition-all duration-200",
              value === option.value
                ? "bg-primary/10 border-primary text-primary"
                : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
