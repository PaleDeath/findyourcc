import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator as CalculatorIcon } from "lucide-react";
import { CardSelector } from "@/components/calculator/CardSelector";
import { CardValuationCard } from "@/components/calculator/CardValuationCard";
import { ComparisonCharts } from "@/components/calculator/ComparisonCharts";
import { SpendSlidersPanel } from "@/components/calculator/SpendSlidersPanel";
import { PortalVoucherFinder } from "@/components/calculator/PortalVoucherFinder";
import { Disclaimer } from "@/components/Disclaimer";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCompareTray, useDataset, useSpendProfile } from "@/lib/card-store";
import { valueCard } from "@/lib/rewardEngine";
import { seoMeta, canonical } from "@/lib/seo";
import type { SpendProfile } from "@/lib/spend-profile";

const DESCRIPTION =
  "Set your monthly spends and see the real monthly and annual reward value of any Indian credit card, plus how much you must spend to break even on its fee.";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    links: canonical("/calculator"),
    meta: seoMeta({
      title: "Credit card reward & break-even calculator — FindYourCC",
      description: DESCRIPTION,
    }),
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { cards } = useDataset();
  const { spend, setCategory, reset } = useSpendProfile();
  const compare = useCompareTray();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => compare.ids.slice(0, 4));
  const [countLounge, setCountLounge] = useState(true);
  const [countMemberships, setCountMemberships] = useState(true);

  const selectedCards = useMemo(
    () =>
      selectedIds
        .map((id) => cards.find((card) => card.id === id))
        .filter((card): card is (typeof cards)[number] => Boolean(card)),
    [selectedIds, cards],
  );

  const valuations = useMemo(
    () => selectedCards.map((card) => valueCard(card, spend, { countLounge, countMemberships })),
    [selectedCards, spend, countLounge, countMemberships],
  );

  const handleSpendChange = (key: keyof SpendProfile, value: number) => {
    setCategory(key, value);
  };

  return (
    <div className="container-page space-y-6 sm:space-y-8 py-6 sm:py-8 min-w-0">
      <header className="max-w-3xl space-y-3 min-w-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalculatorIcon className="size-3.5" aria-hidden="true" /> Reward calculator
        </span>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          What is this card actually worth to you?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground sm:text-base leading-relaxed">
          Move the sliders to match your real spending. Every number below is computed on this
          device from the published earn rates, caps and exclusions — not marketing claims. Not sure
          where to start?{" "}
          <Link to="/match" className="font-medium text-primary hover:underline">
            Take the match quiz
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start min-w-0">
        <div className="space-y-4 lg:sticky lg:top-24 min-w-0">
          <SpendSlidersPanel spend={spend} onChange={handleSpendChange} onReset={reset} />

          <fieldset className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <legend className="px-1 text-sm font-semibold">Count perks as value</legend>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="count-lounge" className="text-sm font-normal">
                Lounge visits (4 trips/year)
              </Label>
              <Switch id="count-lounge" checked={countLounge} onCheckedChange={setCountLounge} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="count-memberships" className="text-sm font-normal">
                Bundled memberships
              </Label>
              <Switch
                id="count-memberships"
                checked={countMemberships}
                onCheckedChange={setCountMemberships}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Turn these off if you would never actually use them — that is where inflated
              &ldquo;card value&rdquo; claims come from.
            </p>
          </fieldset>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="pick-cards" className="space-y-3">
            <h2 id="pick-cards" className="font-display text-xl font-semibold tracking-tight">
              Pick up to 4 cards
            </h2>
            <CardSelector cards={cards} selectedIds={selectedIds} onChange={setSelectedIds} />
          </section>

          {valuations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Add a card above to see its monthly and annual reward value, category breakdown and
                fee break-even point.
              </p>
              <Link
                to="/explore"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Browse all cards
              </Link>
            </div>
          ) : (
            <>
              <section aria-labelledby="valuations" className="space-y-4">
                <h2 id="valuations" className="font-display text-xl font-semibold tracking-tight">
                  Your numbers
                </h2>
                <div className="grid gap-4 xl:grid-cols-2">
                  {valuations.map((valuation) => (
                    <CardValuationCard key={valuation.card.id} valuation={valuation} />
                  ))}
                </div>
              </section>

              {valuations.length > 1 && (
                <section aria-labelledby="charts" className="space-y-4">
                  <h2 id="charts" className="font-display text-xl font-semibold tracking-tight">
                    Side by side
                  </h2>
                  <ComparisonCharts valuations={valuations} />
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <section aria-labelledby="voucher-portals" className="space-y-4">
        <PortalVoucherFinder />
      </section>

      <Disclaimer />
    </div>
  );
}
