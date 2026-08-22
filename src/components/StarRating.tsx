import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          strokeWidth={1.5}
          className={i <= Math.round(value) ? "fill-gold text-gold" : "text-border"}
        />
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`Rate ${i} stars`}
          className="grid h-11 w-11 place-items-center rounded-sm transition-colors hover:bg-stone"
        >
          <Star
            width={20}
            height={20}
            strokeWidth={1.5}
            className={i <= value ? "fill-gold text-gold" : "text-border"}
          />
        </button>
      ))}
    </div>
  );
}
