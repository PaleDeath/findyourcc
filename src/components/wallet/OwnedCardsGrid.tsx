import { Link } from "@tanstack/react-router";
import { Wallet, X } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Button } from "@/components/ui/button";
import type { CreditCard } from "@/data/types";
import { formatFee } from "@/lib/format";
import { popularityScore } from "@/data/cards";

interface OwnedCardsGridProps {
  cards: CreditCard[];
  onRemove: (id: string) => void;
  suggestions: CreditCard[];
  onAdd: (id: string) => void;
}

export function OwnedCardsGrid({ cards, onRemove, suggestions, onAdd }: OwnedCardsGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <Wallet className="size-9 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">Your wallet is empty</p>
          <p className="text-sm text-muted-foreground">
            Search above to add the cards you already carry — we'll work out fees, rewards and gaps
            for you.
          </p>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <span className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Popular starting points
            </span>
            {suggestions.map((card) => (
              <Button key={card.id} variant="outline" size="sm" onClick={() => onAdd(card.id)}>
                + {card.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
        >
          <button
            type="button"
            onClick={() => onRemove(card.id)}
            aria-label={`Remove ${card.name} from wallet`}
            className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full border border-border/60 bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="size-3.5" />
          </button>
          <CardArt
            art={card.art}
            name={card.name}
            issuer={card.issuer}
            network={card.networks[0]}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              <Link to="/card/$id" params={{ id: card.id }} className="hover:text-primary">
                {card.name}
              </Link>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {card.issuer} ·{" "}
              {card.fees.lifetimeFree ? "Lifetime free" : formatFee(card.fees.annualFee)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function pickPopularSuggestions(
  cards: CreditCard[],
  excludeIds: string[],
  limit = 4,
): CreditCard[] {
  return [...cards]
    .filter((c) => c.status === "Active" && !excludeIds.includes(c.id))
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, limit);
}
