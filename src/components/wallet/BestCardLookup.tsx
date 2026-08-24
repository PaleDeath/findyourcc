import { useMemo, useState } from "react";
import { CreditCard as CardIcon, Wand2 } from "lucide-react";
import { bestForCategory } from "@/components/wallet/wallet-analysis";
import { SPEND_CATEGORIES, type SpendKey } from "@/lib/spend-profile";
import type { CreditCard } from "@/data/types";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/format";

const MERCHANT_CHIPS: { label: string; key: SpendKey }[] = [
  { label: "Amazon", key: "online" },
  { label: "Flipkart", key: "online" },
  { label: "Swiggy", key: "dining" },
  { label: "Zomato", key: "dining" },
  { label: "Fuel pump", key: "fuel" },
  { label: "Dining out", key: "dining" },
];

export function BestCardLookup({ ownedCards }: { ownedCards: CreditCard[] }) {
  const [key, setKey] = useState<SpendKey>("online");

  const result = useMemo(() => bestForCategory(ownedCards, key, 0), [ownedCards, key]);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 text-primary" aria-hidden="true" />
        <h3 className="font-semibold">Best card to swipe here</h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MERCHANT_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setKey(chip.key)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary/50",
              key === chip.key && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="best-card-category"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Or pick a category
        </label>
        <select
          id="best-card-category"
          value={key}
          onChange={(e) => setKey(e.target.value as SpendKey)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {SPEND_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {ownedCards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a card to your wallet to get a recommendation.
        </p>
      ) : result.excludedOnAll ? (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          Every card in your wallet excludes {result.label.toLowerCase()} from rewards — none is
          ideal here.
        </p>
      ) : result.winner ? (
        <div className="flex items-start gap-3 rounded-lg bg-surface p-3">
          <CardIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm">
            Use <strong>{result.winner.name}</strong> — it earns {formatPct(result.bestRatePct)} on{" "}
            {result.label.toLowerCase()}, the best in your wallet.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No wallet card has a rate for this category.
        </p>
      )}
    </div>
  );
}
