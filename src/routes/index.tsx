import { useMemo } from "react";
import { canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Fuel,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import { CreditCardTile } from "@/components/CreditCardTile";
import { Button } from "@/components/ui/button";
import { computeEffectiveRate, listIssuers } from "@/data/cards";
import type { Category } from "@/data/types";
import { useCompareTray, useDataset, useFavourites } from "@/lib/card-store";

export const Route = createFileRoute("/")({
  head: () => ({
    links: canonical("/"),
    meta: [
      { title: "FindYourCC — Find the right Indian credit card" },
      {
        name: "description",
        content:
          "An independent, affiliate-free guide to 120+ Indian credit cards: real earn rates, exclusions, lounge access, RuPay UPI support and honest watch-outs.",
      },
      { property: "og:title", content: "FindYourCC — Find the right Indian credit card" },
      {
        property: "og:description",
        content:
          "Compare 120+ Indian credit cards on fees, rewards, lounge access and the fine print. No affiliate links.",
      },
    ],
  }),
  component: Home,
});

const QUICK_PICKS: { label: string; category: Category; Icon: typeof Plane }[] = [
  { label: "Travel & lounges", category: "Travel", Icon: Plane },
  { label: "Cashback", category: "Cashback", Icon: Wallet },
  { label: "Online shopping", category: "Shopping", Icon: ShoppingBag },
  { label: "Fuel savings", category: "Fuel", Icon: Fuel },
  { label: "First card", category: "Student", Icon: Sparkles },
  { label: "FD-backed", category: "Secured (FD)", Icon: ShieldCheck },
];

function Home() {
  const { cards } = useDataset();
  const favourites = useFavourites();
  const compare = useCompareTray();

  const featured = useMemo(
    () =>
      [...cards]
        .filter((card) => card.status === "Active")
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a))
        .slice(0, 6),
    [cards],
  );

  const stats = useMemo(() => {
    const issuers = listIssuers(cards).length;
    const rupay = cards.filter((c) => c.upi.rupayUpiLinkable).length;
    const ltf = cards.filter((c) => c.fees.lifetimeFree).length;
    return { total: cards.length, issuers, rupay, ltf };
  }, [cards]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,hsl(var(--primary)/0.18),transparent_70%),radial-gradient(45%_45%_at_90%_10%,hsl(var(--gold)/0.16),transparent_70%)]"
        />
        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
              Independent · no affiliate links
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Every Indian credit card,
              <span className="text-primary"> honestly explained.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Fees, real earn rates, reward exclusions, lounge rules and UPI support for{" "}
              {stats.total} cards across {stats.issuers} issuers — structured so you can decide for
              yourself.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/explore">
                  Explore cards <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/match">Find my match</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Cards", value: stats.total },
                { label: "Issuers", value: stats.issuers },
                { label: "RuPay UPI", value: stats.rupay },
                { label: "Lifetime free", value: stats.ltf },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                  <dd className="font-display text-2xl font-bold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <div className="grid w-full max-w-md gap-4">
              {featured.slice(0, 2).map((card, index) => (
                <div key={card.id} style={{ transform: `rotate(${index === 0 ? -3 : 2}deg)` }}>
                  <CreditCardTile card={card} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="quick-picks">
        <h2 id="quick-picks" className="font-display text-2xl font-bold tracking-tight">
          What are you optimising for?
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_PICKS.map(({ label, category, Icon }) => (
            <Link
              key={category}
              to="/explore"
              search={{ category }}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-6" aria-labelledby="featured">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured" className="font-display text-2xl font-bold tracking-tight">
              Highest base earn rates
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked purely on best-case value per ₹100 of ordinary spend.
            </p>
          </div>
          <Link
            to="/explore"
            search={{ sort: "rate-desc" }}
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:inline"
          >
            See all
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((card, index) => (
            <CreditCardTile
              key={card.id}
              card={card}
              index={index}
              isFavourite={favourites.ids.includes(card.id)}
              isComparing={compare.ids.includes(card.id)}
              onToggleFavourite={favourites.toggle}
              onToggleCompare={compare.toggle}
            />
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-3 sm:p-8">
          {[
            {
              Icon: ShieldCheck,
              title: "No affiliate links",
              body: "We never earn on an application, so nothing is ranked to pay us.",
            },
            {
              Icon: Smartphone,
              title: "India-specific fields",
              body: "Rent, wallet, fuel and education exclusions are first-class data, not footnotes.",
            },
            {
              Icon: BadgeCheck,
              title: "Confidence labels",
              body: "Every card shows when it was last verified and how confident that data is.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-2">
              <item.Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
