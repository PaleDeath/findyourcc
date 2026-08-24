import { Link } from "@tanstack/react-router";
import { Lightbulb, Plus } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Button } from "@/components/ui/button";
import type { GapSuggestion } from "@/components/wallet/wallet-analysis";
import { formatINR, formatPct } from "@/lib/format";

interface GapPluggerProps {
  suggestion: GapSuggestion | null;
  onAdd: (id: string) => void;
}

export function GapPlugger({ suggestion, onAdd }: GapPluggerProps) {
  if (!suggestion) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        No obvious gap to plug right now — your wallet already covers your spend profile well.
      </div>
    );
  }

  const { card, category, annualGain, candidateRate } = suggestion;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <div className="w-full max-w-[160px] sm:w-36 shrink-0">
        <CardArt
          art={card.art}
          name={card.name}
          issuer={card.issuer}
          network={card.networks[0]}
          size="sm"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-1.5 text-primary">
          <Lightbulb className="size-4" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-wide">Gap plugger suggestion</p>
        </div>
        <p className="font-semibold">{card.name}</p>
        <p className="text-sm text-muted-foreground">
          Adds {formatPct(candidateRate)} on {category.label.toLowerCase()}, where your best card
          earns {formatPct(category.bestRatePct)} — worth about{" "}
          <strong className="text-foreground">{formatINR(annualGain)}</strong> a year.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" onClick={() => onAdd(card.id)}>
          <Plus className="mr-1 size-3.5" aria-hidden="true" /> Add to wallet
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/card/$id" params={{ id: card.id }}>
            View card
          </Link>
        </Button>
      </div>
    </div>
  );
}
