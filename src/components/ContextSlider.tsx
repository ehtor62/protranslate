
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContextSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  multipleLabels?: { value: number; label: string; tooltip?: string }[];
  inline?: boolean;
  showLabelInHandle?: boolean;
  className?: string;
}

export function ContextSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
  multipleLabels,
  inline = false,
  showLabelInHandle = false,
  className
}: ContextSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn(
        "flex items-center gap-4",
        inline && !showLabelInHandle ? "flex-row" : "flex-col"
      )}>
        {!showLabelInHandle && (
          <div className={cn(
            "flex items-center gap-2",
            inline ? "min-w-[140px]" : "w-full justify-between"
          )}>
            <label className="text-sm font-medium text-foreground">{label}</label>
            <span className="text-xs text-muted-foreground font-mono">{value}%</span>
          </div>
        )}
        <div className={cn("relative", inline && !showLabelInHandle ? "flex-1" : "w-full", showLabelInHandle && "px-12")}>
          {showLabelInHandle && (
            <div 
              className="absolute top-1/2 pointer-events-none z-10 transition-all duration-150"
              style={{ 
                left: `${value}%`,
                transform: `translate(-${value}%, -50%)`
              }}
            >
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shadow-md">
                {label} {value}%
              </div>
            </div>
          )}
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            step="1"
            className={cn(
              "w-full h-2 cursor-pointer touch-none",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
              "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
              "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-webkit-slider-thumb]:active:scale-125",
              "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
              "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0",
              "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md",
              "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
              "[&::-webkit-slider-runnable-track]:bg-muted",
              "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
              showLabelInHandle && "range-with-label"
            )}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'none'
            }}
          />
        </div>
      </div>
      {multipleLabels ? (
        <TooltipProvider>
          <div className="flex justify-between text-xs text-tertiary">
            {multipleLabels.map((item, index) => (
              item.tooltip ? (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <span className="text-center cursor-help" style={{ flex: 1 }}>
                      {item.label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="max-w-[180px] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                    side="bottom"
                    align="center"
                    sideOffset={8}
                    collisionPadding={20}
                  >
                    <p className="text-xs leading-relaxed">{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span key={index} className="text-center" style={{ flex: 1 }}>
                  {item.label}
                </span>
              )
            ))}
          </div>
        </TooltipProvider>
      ) : leftLabel && rightLabel ? (
        <div className="flex justify-between text-xs text-tertiary">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
