import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  SPEND_CATEGORIES,
  annualTotal,
  monthlyTotal,
  type SpendProfile,
} from "@/lib/spend-profile";
import { formatCompactINR, formatINR } from "@/lib/format";

interface SpendSlidersPanelProps {
  spend: SpendProfile;
  onChange: (key: keyof SpendProfile, value: number) => void;
  onReset: () => void;
}

export function SpendSlidersPanel({ spend, onChange, onReset }: SpendSlidersPanelProps) {
  const monthly = monthlyTotal(spend);
  const annual = annualTotal(spend);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Your monthly spend</h2>
          <p className="text-sm text-muted-foreground">
            Shared with the Match quiz — adjust and every card below recalculates instantly.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-surface p-3 text-sm sm:w-fit sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Monthly total</p>
          <p className="text-lg font-semibold">{formatINR(monthly)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Annual total</p>
          <p className="text-lg font-semibold">{formatINR(annual)}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {SPEND_CATEGORIES.map((cat) => {
          const value = spend[cat.key] || 0;
          const sliderId = `spend-${cat.key}`;
          return (
            <div key={cat.key} className="space-y-2 rounded-xl border border-border/60 bg-surface/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <label htmlFor={sliderId} className="text-sm font-semibold text-foreground">
                    {cat.label}
                  </label>
                  <p className="truncate text-xs text-muted-foreground">{cat.hint}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <span className="text-xs font-semibold text-muted-foreground">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value ? value.toLocaleString("en-IN") : "0"}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const val = raw ? parseInt(raw, 10) : 0;
                      onChange(cat.key, Math.min(cat.max * 2, val));
                    }}
                    className="w-20 bg-transparent text-right font-mono text-xs font-semibold text-foreground focus:outline-none"
                    aria-label={`${cat.label} monthly amount in rupees`}
                  />
                </div>
              </div>
              <Slider
                id={sliderId}
                aria-label={cat.label}
                min={0}
                max={cat.max}
                step={500}
                value={[Math.min(cat.max, value)]}
                onValueChange={([v]) => onChange(cat.key, v ?? 0)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SpendSlidersPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-1.5 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
