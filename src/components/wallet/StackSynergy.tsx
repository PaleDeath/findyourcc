import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURATED_STACK_COMBOS, type StackCombo } from "@/data/combos";
import { formatFee, formatINR } from "@/lib/format";
import { toast } from "sonner";

interface StackSynergyProps {
  onLoadStack?: (cardIds: string[]) => void;
}

export function StackSynergy({ onLoadStack }: StackSynergyProps) {
  const [selectedComboId, setSelectedComboId] = useState<string>("amex-trifecta-india");

  const selectedCombo =
    CURATED_STACK_COMBOS.find((c) => c.id === selectedComboId) ?? CURATED_STACK_COMBOS[0];

  const handleApplyCombo = () => {
    if (onLoadStack && selectedCombo) {
      onLoadStack(selectedCombo.cards.map((c) => c.cardId));
      toast.success(`Loaded "${selectedCombo.title}" into your wallet!`);
    }
  };

  return (
    <div className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
            <Sparkles className="size-3" />
            <span>Synergistic Portfolio Architecture</span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Curated Card Stacks & "Trifectas"
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Why carry one card when a 2-3 card stack gives you 100% category coverage with zero reward waste?
          </p>
        </div>

        {onLoadStack && (
          <Button
            size="sm"
            onClick={handleApplyCombo}
            className="btn-tactile text-xs self-start sm:self-auto shrink-0"
          >
            <Plus className="size-3.5 mr-1" />
            Load Stack Into Wallet
          </Button>
        )}
      </div>

      {/* Stack Selector Pills */}
      <div className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CURATED_STACK_COMBOS.map((combo) => (
          <button
            key={combo.id}
            type="button"
            onClick={() => setSelectedComboId(combo.id)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-left text-xs transition-all ${
              selectedComboId === combo.id
                ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                : "border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-semibold">{combo.title}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{combo.highlightReturnText}</div>
          </button>
        ))}
      </div>

      {/* Selected Stack Details */}
      {selectedCombo && (
        <div className="space-y-6 pt-2">
          {/* Overview Banner */}
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-foreground">{selectedCombo.title}</h3>
              <Badge variant="outline" className="text-[10px] self-start sm:self-auto">
                {selectedCombo.difficulty} Difficulty
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{selectedCombo.strategySummary}</p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/40">
              <div className="rounded-xl bg-background/80 p-2.5 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Annual Fee</div>
                <div className="font-mono text-sm font-bold text-foreground mt-0.5">
                  {formatFee(selectedCombo.totalAnnualFee)}
                </div>
              </div>

              <div className="rounded-xl bg-background/80 p-2.5 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Blended Return</div>
                <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ~{selectedCombo.blendedEffectiveReturnPct}%
                </div>
              </div>

              <div className="rounded-xl bg-background/80 p-2.5 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Cards in Stack</div>
                <div className="font-mono text-sm font-bold text-foreground mt-0.5">
                  {selectedCombo.cards.length} Cards
                </div>
              </div>

              <div className="rounded-xl bg-background/80 p-2.5 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Est. Net Profit/Yr</div>
                <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatINR(selectedCombo.annualValueEstimate.netProfitRupees)}
                </div>
              </div>
            </div>
          </div>

          {/* Cards & Roles in this Stack */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Cards & Dedicated Roles
            </span>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCombo.cards.map((role) => (
                <div
                  key={role.cardId}
                  className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs transition-all hover:border-foreground/30"
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-display font-bold text-foreground text-sm line-clamp-1">
                      {role.cardName}
                    </strong>
                  </div>
                  <div className="text-primary font-semibold text-[11px]">{role.expectedEarnRate}</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{role.roleDescription}</p>
                  <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                    {role.primarySpendCategories.map((c) => (
                      <span key={c} className="rounded bg-surface px-1.5 py-0.5 border border-border/50">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why It Works & Watch-outs */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Why This Stack Wins</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {selectedCombo.whyItWorks.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" />
                <span>Watch-outs & Maintenance</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                {selectedCombo.watchOuts.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
