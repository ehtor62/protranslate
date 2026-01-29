
import { cn } from '@/lib/utils';

interface ContextSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  className?: string;
}

export function ContextSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
  className
}: ContextSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground font-mono">{value}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2"
        />
      </div>
      <div className="flex justify-between text-xs text-tertiary">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
