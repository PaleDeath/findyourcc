import { useState, useMemo } from "react";
import { canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Compass,
  CreditCard as CreditCardIcon,
  Flame,
  Fuel,
  Plane,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { CreditCardTile } from "@/components/CreditCardTile";
import { CardArt } from "@/components/CardArt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { computeEffectiveRate, listIssuers, popularityScore, searchCards } from "@/data/cards";
import type { Category, CreditCard } from "@/data/types";
import { useCompareTray, useDataset, useFavourites } from "@/lib/card-store";
import { formatFee, formatINR } from "@/lib/format";
import { openCommandPalette } from "@/components/CommandPalette";

export const Route = createFileRoute("/")({
  head: () => ({
    links: canonical("/"),
    meta: [
      { title: "FindYourCC — The Transparent Index of Indian Credit Cards" },
      {
        name: "description",
        content:
          "Independent, affiliate-free intelligence on 149+ Indian credit cards: real earn rates, exclusions, lounge access, RuPay UPI support and honest fine print.",
      },
      { property: "og:title", content: "FindYourCC — The Transparent Index of Indian Credit Cards" },
      {
        property: "og:description",
        content:
          "Compare 149+ Indian credit cards on real reward rates, lounge rules, annual fee waivers, and the fine print. Zero affiliate bias.",
      },
    ],
  }),
  component: Home,
});

const SPOTLIGHT_CARDS = [
  {
    tag: "Premium",
    id: "hdfc-infinia-metal",
    label: "HDFC Infinia Metal",
    desc: "Up to 33.3% return on SmartBuy flight & hotel bookings. 1:1 reward transfer to top airlines.",
  },
  {
    tag: "Air Miles",
    id: "axis-atlas",
    label: "Axis Bank Atlas",
    desc: "Direct tier points on flights & hotels with flexible transfer partners across major airlines.",
  },
  {
    tag: "Cashback",
    id: "sbi-cashback",
    label: "SBI Cashback",
    desc: "Flat 5% direct cashback on online merchant spends with direct statement credit and zero hassle.",
  },
  {
    tag: "Rewards",
    id: "amex-mrcc",
    label: "Amex MRCC",
    desc: "1,000 bonus points on 4 monthly spends of ₹1,500. Ideal 18k & 24k gold collection redemption.",
  },
];

const SEARCH_PROMPTS = [
  "Infinia",
  "Axis Atlas",
  "SBI Cashback",
  "Lifetime Free",
  "RuPay UPI",
  "Amex",
  "DCB",
  "Zero Forex",
];

function Home() {
  const { cards } = useDataset();
  const favourites = useFavourites();
  const compare = useCompareTray();

  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(50000);
  const [activeTab, setActiveTab] = useState<"rates" | "popular" | "ltf" | "rupay">("rates");

  const spotlightCard = useMemo(() => {
    const config = SPOTLIGHT_CARDS[spotlightIdx] ?? SPOTLIGHT_CARDS[0];
    return cards.find((c) => c.id === config?.id) ?? cards[0];
  }, [cards, spotlightIdx]);

  const stats = useMemo(() => {
    const issuers = listIssuers(cards).length;
    const rupay = cards.filter((c) => c.upi.rupayUpiLinkable).length;
    const ltf = cards.filter((c) => c.fees.lifetimeFree).length;
    return { total: cards.length, issuers, rupay, ltf };
  }, [cards]);

  // Spend Simulator Calculations
  const topCalculatedCards = useMemo(() => {
    const annualSpend = monthlySpend * 12;
    return [...cards]
      .filter((c) => c.status === "Active")
      .map((c) => {
        const rate = computeEffectiveRate(c) / 100;
        const grossReturn = annualSpend * rate;
        const fee = c.fees.lifetimeFree
          ? 0
          : c.fees.feeWaiverSpend && annualSpend >= c.fees.feeWaiverSpend
            ? 0
            : c.fees.annualFee;
        const netValue = Math.max(0, grossReturn - fee);
        return { card: c, netValue, grossReturn, feeWaved: fee === 0 };
      })
      .sort((a, b) => b.netValue - a.netValue)
      .slice(0, 3);
  }, [cards, monthlySpend]);

  const displayCards = useMemo(() => {
    const active = cards.filter((c) => c.status === "Active");
    switch (activeTab) {
      case "popular":
        return [...active].sort((a, b) => popularityScore(b) - popularityScore(a)).slice(0, 6);
      case "ltf":
        return active.filter((c) => c.fees.lifetimeFree).slice(0, 6);
      case "rupay":
        return active.filter((c) => c.upi.rupayUpiLinkable).slice(0, 6);
      default:
        return [...active]
          .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a))
          .slice(0, 6);
    }
  }, [cards, activeTab]);

  return (
    <div className="relative">
      {/* Subtle architectural grid pattern in hero */}
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 h-[640px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-20" />

      {/* --- HERO SECTION -------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-border/80 dark:border-white/[0.08]">
        <div className="container-page relative grid gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            {/* Live Independence Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">Independent Index</span>
              <span className="text-border dark:text-white/20">|</span>
              <span>Zero Affiliate Links</span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              The transparent index of{" "}
              <span className="text-foreground">Indian credit cards.</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Structured reward earn rates, hidden caps, lounge access rules, and RuPay UPI support for{" "}
              <span className="font-semibold text-foreground">{stats.total} cards</span> across{" "}
              <span className="font-semibold text-foreground">{stats.issuers} issuers</span>. Built for precision.
            </p>

            {/* Quick Interactive Search Trigger */}
            <div className="mt-7">
              <button
                type="button"
                onClick={openCommandPalette}
                className="btn-tactile flex w-full max-w-lg items-center justify-between rounded-2xl border border-border/80 bg-surface/60 px-4 py-3 text-left text-sm text-muted-foreground shadow-xs backdrop-blur-md transition-colors hover:border-foreground/40 hover:bg-surface focus:outline-none dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="size-4 text-foreground/70" aria-hidden="true" />
                  <span className="text-foreground font-medium">Search by card, bank, perk or acronym…</span>
                </span>
                <kbd className="rounded-lg border border-border bg-background px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/[0.08]">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Filter Prompt Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-[11px] font-medium text-muted-foreground/70">Trending:</span>
                {SEARCH_PROMPTS.map((prompt) => (
                  <Link
                    key={prompt}
                    to="/explore"
                    search={{ q: prompt }}
                    className="rounded-lg border border-border/70 bg-surface/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Database Stat Counters */}
            <dl className="mt-9 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Verified Cards", value: stats.total, icon: CreditCardIcon },
                { label: "Bank Issuers", value: stats.issuers, icon: Compass },
                { label: "RuPay UPI", value: stats.rupay, icon: Smartphone },
                { label: "Lifetime Free", value: stats.ltf, icon: Zap },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card-bevel rounded-xl border border-border/80 bg-card p-3 dark:border-white/[0.08]"
                >
                  <dt className="text-[11px] font-medium text-muted-foreground">{item.label}</dt>
                  <dd className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* --- HERO RIGHT: 3D CARD SPOTLIGHT SHOWCASE -------------------- */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Card Spotlight Selector Tabs */}
            <div className="mb-4 grid w-full max-w-sm grid-cols-4 gap-1 rounded-xl border border-border/80 bg-surface/80 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
              {SPOTLIGHT_CARDS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSpotlightIdx(idx)}
                  className={`btn-tactile w-full truncate rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all ${
                    spotlightIdx === idx
                      ? "bg-foreground text-background shadow-xs dark:bg-white dark:text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.tag}
                </button>
              ))}
            </div>

            {/* Interactive Physical 3D Card Display */}
            {spotlightCard && (
              <div className="w-full max-w-sm">
                <div className="card-bevel rounded-2xl border border-border/80 bg-card p-4 transition-all dark:border-white/[0.08]">
                  <CardArt
                    art={spotlightCard.art}
                    name={spotlightCard.name}
                    issuer={spotlightCard.issuer}
                    network={spotlightCard.networks[0]}
                    size="lg"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {spotlightCard.issuer}
                      </span>
                      <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-bold text-foreground">
                        {computeEffectiveRate(spotlightCard).toFixed(2)}% Base Earn
                      </Badge>
                    </div>
                    <h3 className="truncate font-display text-base font-bold text-foreground">
                      {spotlightCard.name}
                    </h3>
                    <p className="h-10 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {SPOTLIGHT_CARDS[spotlightIdx]?.desc ?? ""}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <Button asChild size="sm" className="w-full">
                        <Link to="/card/$id" params={{ id: spotlightCard.id }}>
                          View Full Dossier <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => compare.toggle(spotlightCard.id)}
                        className="shrink-0"
                      >
                        <Scale className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- LIVE 5-SECOND SPEND ROI SIMULATOR ------------------------------ */}
      <section className="container-page py-12" aria-labelledby="simulator-title">
        <div className="card-bevel relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 dark:border-white/[0.08]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-foreground dark:border-white/10">
                <Calculator className="size-3.5 text-foreground/70" aria-hidden="true" />
                <span>Live Spend ROI Engine</span>
              </div>
              <h2 id="simulator-title" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                What is your spend actually worth?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Adjust your estimated monthly credit card spend to instantly reveal the mathematically optimal cards for net rupee return.
              </p>

              {/* Monthly Spend Slider */}
              <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-surface/50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Monthly Spends
                  </span>
                  <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                    {formatINR(monthlySpend)} <span className="text-xs font-normal text-muted-foreground">/ month</span>
                  </span>
                </div>
                <Slider
                  value={[monthlySpend]}
                  min={10000}
                  max={250000}
                  step={5000}
                  onValueChange={(val) => setMonthlySpend(val[0] ?? 50000)}
                  className="py-2"
                />
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>₹10,000/mo</span>
                  <span>₹1,00,000/mo</span>
                  <span>₹2,50,000/mo</span>
                </div>
              </div>
            </div>

            {/* Output Top 3 Optimal Cards */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Calculated Recommendations (Annual Return)
              </span>
              <div className="space-y-2.5">
                {topCalculatedCards.map(({ card, netValue }, rank) => (
                  <Link
                    key={card.id}
                    to="/card/$id"
                    params={{ id: card.id }}
                    className="card-bevel-hover group flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 text-left transition-all dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface font-mono text-xs font-bold text-foreground dark:bg-white/10">
                        #{rank + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground group-hover:underline">
                          {card.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {card.issuer} · {card.fees.lifetimeFree ? "Lifetime Free" : formatFee(card.fees.annualFee)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatINR(netValue)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">net / year</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/calculator">
                    Open Full Multi-Category Calculator <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE CREDIT CARD OPTIMIZATION TOOLKIT ------------------------ */}
      <section className="container-page py-12" aria-labelledby="toolkit-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Everything You Need</span>
            </div>
            <h2 id="toolkit-title" className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              The Credit Card Optimization Toolkit
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Instant utilities to check lounge access, decode MCC exclusions, convert miles, and optimize your wallet.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tool 1: Lounge Access Checker */}
          <Link
            to="/lounge"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Plane className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600 dark:text-blue-400">
                  2026 Guide
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                Airport Lounge Checker
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Instantly check if your card unlocks lounges across 49+ Indian airports. Verify quarterly spend gates & HDFC SMS voucher rules before flying.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Check your card & airport</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tool 2: MCC Code Guide */}
          <Link
            to="/mcc"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Tag className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  80+ Merchants
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                MCC Code & Exclusion Guide
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Search Swiggy, Amazon, CRED, fuel, utility, and rent MCCs. See which cards pay 5% cashback vs 0% excluded before big transactions.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Search merchant MCCs</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tool 3: Points & Miles Transfer Matrix */}
          <Link
            to="/transfers"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Send className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-purple-500/30 text-purple-600 dark:text-purple-400">
                  Live Calculator
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                Points & Miles Transfers
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Convert Atlas, Infinia, and Amex points into Accor ALL, Singapore KrisFlyer, Marriott Bonvoy, and Air India miles with exact rupee valuations.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Calculate transfer value</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tool 4: Best by Category */}
          <Link
            to="/categories"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Trophy className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-600 dark:text-amber-400">
                  Curated Ranks
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                Best Cards by Category
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Hand-picked top 3 winners for Cashback, Airport Lounge, Lifetime Free, Zero Forex, RuPay UPI, Dining, and Fuel with transparent rationale.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Explore category winners</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tool 5: Head-to-Head Compare */}
          <Link
            to="/compare"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Scale className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-rose-500/30 text-rose-600 dark:text-rose-400">
                  Side-by-Side
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                Compare Cards Head-to-Head
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Put your top picks side-by-side. Compare real reward percentages, milestone slabs, fee waivers, forex charges, and the fine print.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Launch comparison dock</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tool 6: Spend Profile Matcher */}
          <Link
            to="/match"
            className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 text-left transition-all dark:border-white/[0.08]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-5" />
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                  2-Min Quiz
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:underline">
                Find Your Perfect Card
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Answer a few quick questions about your monthly spends (grocery, travel, dining, bills) and get matched to the optimal card stack.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50 text-xs font-semibold text-primary">
              <span>Start matching quiz</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* --- CURATED ARCHETYPES BENTO MATRIX ------------------------------- */}
      <section className="container-page py-6" aria-labelledby="archetypes-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="archetypes-title" className="font-display text-2xl font-bold tracking-tight">
              Curated Card Archetypes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct strategies built around how you actually spend.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-foreground hover:underline"
          >
            Explore all 149+ cards →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "The Air Miles Maximiser",
              icon: Plane,
              desc: "1:1 partner transfer to airline programs like Singapore KrisFlyer, Qatar Avios, and Accor.",
              badge: "Up to 33% Return",
              category: "Travel" as Category,
            },
            {
              title: "5% Direct Cashback",
              icon: Wallet,
              desc: "Statement credit deposited directly into your bill. No loyalty catalogue markup.",
              badge: "Pure Liquid Cash",
              category: "Cashback" as Category,
            },
            {
              title: "Lifetime Free Daily Drivers",
              icon: ShieldCheck,
              desc: "Zero annual fees, zero renewal conditions, with complimentary lounge & movie tickets.",
              badge: "₹0 Annual Fee",
              category: "Secured (FD)" as Category,
            },
            {
              title: "RuPay UPI Power Tier",
              icon: Smartphone,
              desc: "Link to Google Pay, PhonePe, and Paytm to earn accelerated rewards on local QR codes.",
              badge: "Scan & Pay",
              category: "Shopping" as Category,
            },
          ].map((item) => (
            <Link
              key={item.title}
              to="/explore"
              search={{ category: item.category }}
              className="card-bevel card-bevel-hover group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 text-left transition-all dark:border-white/[0.08]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-surface/80 text-foreground dark:border-white/10 dark:bg-white/[0.05]">
                    <item.icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground dark:border-white/10">
                    {item.badge}
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-foreground group-hover:underline">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center text-xs font-semibold text-foreground">
                View stack <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* --- VERIFIED CARDS INDEX WITH FILTER TABS -------------------------- */}
      <section className="container-page py-10" aria-labelledby="featured-title">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 dark:border-white/10">
          <div>
            <h2 id="featured-title" className="font-display text-2xl font-bold tracking-tight">
              Verified Cards Index
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked with transparent data and honest fine-print breakdowns.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex max-w-full overflow-x-auto no-scrollbar gap-1 rounded-xl border border-border/80 bg-surface/80 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] sm:flex-wrap">
            {[
              { id: "rates", label: "Top Base Earn" },
              { id: "popular", label: "Most Popular" },
              { id: "ltf", label: "Lifetime Free" },
              { id: "rupay", label: "RuPay UPI" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as never)}
                className={`btn-tactile shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-background shadow-xs dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {displayCards.map((card, index) => (
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

      {/* --- TRANSPARENCY & TRUST FOOTER BANNER ----------------------------- */}
      <section className="container-page py-12">
        <div className="card-bevel grid gap-6 rounded-3xl border border-border/80 bg-surface/50 p-6 sm:grid-cols-3 sm:p-8 dark:border-white/[0.08] dark:bg-white/[0.02]">
          {[
            {
              Icon: ShieldCheck,
              title: "Strict Zero-Affiliate Policy",
              body: "We earn zero commissions on card applications. No issuer can pay for higher ranking.",
            },
            {
              Icon: Smartphone,
              title: "India-Specific Nuances",
              body: "Reward exclusions on rent, utilities, fuel, education, and wallet loads are transparently audited.",
            },
            {
              Icon: BadgeCheck,
              title: "Community Audited",
              body: "Every card features timestamped verification and verified issuer fee schedule mappings.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-surface text-foreground dark:border-white/10 dark:bg-white/[0.04]">
                <item.Icon className="size-4.5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
