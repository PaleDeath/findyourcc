import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Plane, Scale, Smartphone, Sparkles } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Badge } from "@/components/ui/badge";
import { computeEffectiveRate, hasLounge } from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { formatFee } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CreditCardTileProps {
  card: CreditCard;
  index?: number;
  isFavourite?: boolean;
  isComparing?: boolean;
  onToggleFavourite?: (id: string) => void;
  onToggleCompare?: (id: string) => void;
}

function CreditCardTileImpl({
  card,
  index = 0,
  isFavourite = false,
  isComparing = false,
  onToggleFavourite,
  onToggleCompare,
}: CreditCardTileProps) {
  const archived = card.status === "Discontinued";
  const premium = card.segment === "Premium" || card.segment === "Super Premium";

  return (
    <article
      className="cc-rise cv-auto card-bevel card-bevel-hover group relative flex h-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 dark:border-white/[0.08]"
      style={{ animationDelay: `${Math.min(index, 11) * 35}ms` }}
    >
      <div className="relative">
        <CardArt
          art={card.art}
          name={card.name}
          issuer={card.issuer}
          network={card.networks[0]}
          dimmed={archived}
        />
        <div className="absolute right-2.5 top-2.5 flex gap-1.5">
          {onToggleFavourite && (
            <button
              type="button"
              onClick={() => onToggleFavourite(card.id)}
              aria-pressed={isFavourite}
              aria-label={
                isFavourite
                  ? `Remove ${card.name} from favourites`
                  : `Save ${card.name} to favourites`
              }
              className="btn-tactile relative z-10 grid size-8 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-xs backdrop-blur-md transition-colors hover:bg-background dark:border-white/15 dark:bg-black/60"
            >
              <Heart className={cn("size-3.5 transition-transform group-active:scale-90", isFavourite && "fill-destructive text-destructive")} />
            </button>
          )}
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(card.id)}
              aria-pressed={isComparing}
              aria-label={
                isComparing
                  ? `Remove ${card.name} from comparison`
                  : `Add ${card.name} to comparison`
              }
              className={cn(
                "btn-tactile relative z-10 grid size-8 place-items-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-xs backdrop-blur-md transition-colors hover:bg-background dark:border-white/15 dark:bg-black/60",
                isComparing && "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground",
              )}
            >
              <Scale className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {card.issuer}
            </p>
            {card.upi.rupayUpiLinkable && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground dark:border-white/10 dark:bg-white/[0.04]">
                <Smartphone className="size-2.5" aria-hidden="true" /> RuPay UPI
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground transition-colors">
            <Link
              to="/card/$id"
              params={{ id: card.id }}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:underline"
            >
              {card.name}
            </Link>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "border-border/80 text-[10px] font-medium tracking-wide text-foreground dark:border-white/10",
              premium && "font-semibold bg-surface/60 dark:bg-white/[0.04]",
            )}
          >
            {card.segment}
          </Badge>
          {card.categories.slice(0, 2).map((category) => (
            <Badge key={category} variant="outline" className="border-border/60 text-[10px] font-normal text-muted-foreground dark:border-white/10">
              {category}
            </Badge>
          ))}
          {archived && (
            <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
              Archived
            </Badge>
          )}
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-surface/40 p-2.5 text-xs dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Annual fee</dt>
            <dd className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-foreground">
              {card.fees.lifetimeFree ? (
                <span className="font-sans font-semibold text-foreground">Lifetime Free</span>
              ) : (
                formatFee(card.fees.annualFee)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Base earn</dt>
            <dd className="mt-0.5 font-mono text-xs font-bold tabular-nums text-foreground">
              {computeEffectiveRate(card).toFixed(2)}%
            </dd>
          </div>
        </dl>

        <ul className="flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {hasLounge(card) && (
            <li className="inline-flex items-center gap-1">
              <Plane className="size-3 text-muted-foreground/70" aria-hidden="true" /> Lounge access
            </li>
          )}
          {card.bestFor[0] && (
            <li className="inline-flex min-w-0 max-w-full items-center gap-1">
              <Sparkles className="size-3 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <span className="truncate">{card.bestFor[0]}</span>
            </li>
          )}
        </ul>
      </div>
    </article>
  );
}

export function CreditCardTileSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div
        className="w-full animate-pulse rounded-xl bg-muted"
        style={{ aspectRatio: "1.586 / 1" }}
      />
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export const CreditCardTile = memo(CreditCardTileImpl, (prev, next) => {
  return (
    prev.card === next.card &&
    prev.index === next.index &&
    prev.isFavourite === next.isFavourite &&
    prev.isComparing === next.isComparing &&
    prev.onToggleFavourite === next.onToggleFavourite &&
    prev.onToggleCompare === next.onToggleCompare
  );
});
