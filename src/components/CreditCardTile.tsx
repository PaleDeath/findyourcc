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
      className="cc-rise cv-auto group relative flex h-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-within:border-primary/50"
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
        <div className="absolute right-2 top-2 flex gap-1.5">
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
              className="tap-target-44 relative z-10 grid size-8 place-items-center rounded-full border border-border/60 bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Heart className={cn("size-4", isFavourite && "fill-destructive text-destructive")} />
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
                "tap-target-44 relative z-10 grid size-8 place-items-center rounded-full border border-border/60 bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isComparing && "bg-primary text-primary-foreground",
              )}
            >
              <Scale className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {card.issuer}
          </p>
          <h3 className="text-base font-semibold leading-snug">
            <Link
              to="/card/$id"
              params={{ id: card.id }}
              className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:text-primary"
            >
              {card.name}
            </Link>
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={premium ? "default" : "secondary"}
            className={cn(premium && "bg-gold text-gold-foreground")}
          >
            {card.segment}
          </Badge>
          {card.categories.slice(0, 2).map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
          {archived && (
            <Badge variant="outline" className="border-destructive/50 text-destructive">
              Archived
            </Badge>
          )}
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Annual fee</dt>
            <dd className="font-semibold">
              {card.fees.lifetimeFree ? "Lifetime free" : formatFee(card.fees.annualFee)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Base earn</dt>
            <dd className="font-semibold text-primary">{computeEffectiveRate(card).toFixed(2)}%</dd>
          </div>
        </dl>

        <ul className="flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {hasLounge(card) && (
            <li className="inline-flex items-center gap-1">
              <Plane className="size-3.5" aria-hidden="true" /> Lounge
            </li>
          )}
          {card.upi.rupayUpiLinkable && (
            <li className="inline-flex items-center gap-1">
              <Smartphone className="size-3.5" aria-hidden="true" /> UPI
            </li>
          )}
          {card.bestFor[0] && (
            <li className="inline-flex min-w-0 max-w-full items-center gap-1">
              <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
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
