import { useMemo } from "react";
import { canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings2, Wallet as WalletIcon } from "lucide-react";
import { BestCardLookup } from "@/components/wallet/BestCardLookup";
import { CardPicker } from "@/components/wallet/CardPicker";
import { CategoryHeatmap } from "@/components/wallet/CategoryHeatmap";
import { GapPlugger } from "@/components/wallet/GapPlugger";
import { OverlapWarnings } from "@/components/wallet/OverlapWarnings";
import { OwnedCardsGrid, pickPopularSuggestions } from "@/components/wallet/OwnedCardsGrid";
import { WalletSummary } from "@/components/wallet/WalletSummary";
import {
  coverageForWallet,
  findCategoryOverlaps,
  findFeeOverlap,
  suggestGapPlugger,
  summariseWallet,
} from "@/components/wallet/wallet-analysis";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/data/cards";
import { useDataset, useSpendProfile, useWallet } from "@/lib/card-store";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    links: canonical("/wallet"),
    meta: [
      { title: "Card Stack Builder — FindYourCC" },
      {
        name: "description",
        content:
          "Track the credit cards you own, see your combined annual fee and reward value, spot category gaps and overlaps, and find the best card to swipe for any purchase.",
      },
      { property: "og:title", content: "Card Stack Builder — FindYourCC" },
      {
        property: "og:description",
        content:
          "Build and optimise your Indian credit card wallet against your real spend profile.",
      },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { cards } = useDataset();
  const { ids, toggle } = useWallet();
  const { spend } = useSpendProfile();

  const ownedCards = useMemo(
    () =>
      ids.map((id) => getCardById(cards, id)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [cards, ids],
  );

  const summary = useMemo(() => summariseWallet(ownedCards, spend), [ownedCards, spend]);
  const coverage = useMemo(() => coverageForWallet(ownedCards, spend), [ownedCards, spend]);
  const categoryOverlaps = useMemo(
    () => findCategoryOverlaps(ownedCards, spend),
    [ownedCards, spend],
  );
  const feeOverlap = useMemo(() => findFeeOverlap(ownedCards, spend), [ownedCards, spend]);
  const gapSuggestion = useMemo(
    () => suggestGapPlugger(cards, ownedCards, spend),
    [cards, ownedCards, spend],
  );
  const suggestions = useMemo(() => pickPopularSuggestions(cards, ids), [cards, ids]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <WalletIcon className="size-5" aria-hidden="true" />
          <p className="text-sm font-semibold uppercase tracking-wide">Card Stack Builder</p>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Your wallet, optimised</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Add the cards you actually carry to see combined fees, rewards and coverage gaps against
          your spend profile.{" "}
          <Link
            to="/calculator"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Settings2 className="size-3.5" aria-hidden="true" /> Edit your spend profile
          </Link>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cards I own
        </h2>
        <CardPicker cards={cards} ownedIds={ids} onAdd={toggle} />
        <OwnedCardsGrid
          cards={ownedCards}
          onRemove={toggle}
          suggestions={suggestions}
          onAdd={toggle}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Wallet summary
        </h2>
        <WalletSummary summary={summary} cardCount={ownedCards.length} />
      </section>

      {ownedCards.length > 0 && (
        <>
          <OverlapWarnings categoryOverlaps={categoryOverlaps} feeOverlap={feeOverlap} />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Category coverage
            </h2>
            <CategoryHeatmap coverage={coverage} />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Fill the gap
            </h2>
            <GapPlugger suggestion={gapSuggestion} onAdd={toggle} />
          </section>

          <section className="space-y-3">
            <BestCardLookup ownedCards={ownedCards} />
          </section>
        </>
      )}

      {ownedCards.length === 0 && (
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/explore">Browse all cards</Link>
          </Button>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
