import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, RotateCcw, Scale, Sparkles } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Disclaimer } from "@/components/Disclaimer";
import type { MatchOutcome, MatchResult } from "@/lib/matchEngine";
import { formatFee, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ResultsProps {
  outcome: MatchOutcome;
  totalCards: number;
  favourites: string[];
  compareIds: string[];
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onRetake: () => void;
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <p className="text-sm text-muted-foreground">Crunching your numbers…</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="h-24 w-40 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultCard({
  result,
  rank,
  isFavourite,
  isComparing,
  onToggleFavourite,
  onToggleCompare,
}: {
  result: MatchResult;
  rank: number;
  isFavourite: boolean;
  isComparing: boolean;
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  const { card } = result;
  const topFactors = result.factors.slice(0, 3);

  return (
    <article className="cc-rise flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:p-5">
      <div className="flex shrink-0 items-start gap-3 sm:flex-col sm:items-center">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {rank}
        </span>
        <CardArt
          art={card.art}
          name={card.name}
          issuer={card.issuer}
          network={card.networks[0]}
          className="w-32 sm:w-40"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.issuer}
            </p>
            <h3 className="text-lg font-semibold leading-snug">{card.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Projected net annual value</p>
            <p
              className={cn(
                "text-2xl font-bold",
                result.projectedAnnualValue >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {formatINR(result.projectedAnnualValue)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline">
            Annual fee: {card.fees.lifetimeFree ? "Lifetime free" : formatFee(card.fees.annualFee)}
          </Badge>
          <Badge variant="outline">{card.segment}</Badge>
        </div>

        <div className="rounded-xl bg-surface p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="size-3.5" /> Why this card
          </p>
          <ul className="space-y-1.5 text-sm">
            {topFactors.map((f, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span>
                  <span className="font-medium">{f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.detail}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap text-sm font-semibold",
                    f.points >= 0 ? "text-primary" : "text-destructive",
                  )}
                >
                  {f.points >= 0 ? "+" : "-"}
                  {formatINR(Math.round(Math.abs(f.points)))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm">
            <Link to="/card/$id" params={{ id: card.id }}>
              View card
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleCompare(card.id)}
            aria-pressed={isComparing}
          >
            <Scale className="size-4" /> {isComparing ? "In compare" : "Add to compare"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleFavourite(card.id)}
            aria-pressed={isFavourite}
          >
            <Heart className={cn("size-4", isFavourite && "fill-destructive text-destructive")} />{" "}
            Save
          </Button>
        </div>
      </div>
    </article>
  );
}

export function EmptyResults({ onRetake }: { onRetake: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-lg font-semibold">No cards matched every requirement</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Try loosening your income or credit score answers — several good cards may still be worth
        exploring manually.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={onRetake}>
          <RotateCcw className="size-4" /> Retake quiz
        </Button>
        <Button variant="outline" asChild>
          <Link to="/explore">Explore all cards</Link>
        </Button>
      </div>
    </div>
  );
}

export function Results({
  outcome,
  totalCards,
  favourites,
  compareIds,
  onToggleFavourite,
  onToggleCompare,
  onRetake,
}: ResultsProps) {
  const rejectedSample = outcome.rejected.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Your top matches</h2>
          <p className="text-sm text-muted-foreground">
            {outcome.consideredCount} of {totalCards} cards were eligible for your profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRetake}>
            <RotateCcw className="size-4" /> Retake quiz
          </Button>
          <Button variant="outline" asChild>
            <Link to="/calculator">Tune in calculator</Link>
          </Button>
        </div>
      </div>

      {outcome.top.length === 0 ? (
        <EmptyResults onRetake={onRetake} />
      ) : (
        <div className="space-y-4">
          {outcome.top.map((result, i) => (
            <ResultCard
              key={result.card.id}
              result={result}
              rank={i + 1}
              isFavourite={favourites.includes(result.card.id)}
              isComparing={compareIds.includes(result.card.id)}
              onToggleFavourite={onToggleFavourite}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      )}

      {outcome.nearMisses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Why not these?</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {outcome.nearMisses.map((r) => (
              <div key={r.card.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">{r.card.name}</p>
                <p className="text-xs text-muted-foreground">{r.card.issuer}</p>
                <p className="mt-2 text-sm">{r.rejection}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Eligibility at a glance</h3>
        <p className="text-sm text-muted-foreground">
          {outcome.consideredCount} eligible · {outcome.rejected.length} filtered out of{" "}
          {totalCards} total.
        </p>
        {rejectedSample.length > 0 && (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {rejectedSample.map(({ card, reason }) => (
              <li key={card.id} className="rounded-lg bg-surface px-3 py-2">
                <span className="font-medium">{card.name}</span>
                <span className="block text-xs text-muted-foreground">{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Collapsible className="rounded-xl border border-border bg-card p-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left text-sm font-semibold [&[data-state=open]>svg]:rotate-180">
          How we scored this
          <ChevronDown className="size-4 shrink-0 transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            We first apply a hard eligibility filter: income requirement, minimum credit score,
            employment type, and whether the card is currently open for new applicants. Cards that
            fail any of these are dropped before scoring.
          </p>
          <p>
            For every eligible card we estimate a net annual value: rewards on your actual monthly
            spend, plus milestone benefits you'd realistically hit, plus bundled memberships and
            lounge access, minus the effective annual fee (accounting for spend-based waivers). We
            then nudge the ranking for how well the card fits your stated goal and how much its
            accelerated categories overlap with the brands you use — but the rupee value shown is
            always the real maths, never a hidden score.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <Disclaimer className="mt-4" />
    </div>
  );
}
