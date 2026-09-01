import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  Swords,
  Trophy,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plane,
  Zap,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CardArt } from "@/components/CardArt";
import { useDataset } from "@/lib/card-store";
import { computeEffectiveRate, bestAcceleratedRate, totalLoungeVisits } from "@/data/cards";
import { formatFee, formatINR } from "@/lib/format";
import { Disclaimer } from "@/components/Disclaimer";
import type { CreditCard } from "@/data/types";

export const Route = createFileRoute("/battle")({
  head: () => ({
    links: canonical("/battle"),
    meta: [
      { title: "Credit Card 1v1 Battle Arena — Head to Head Comparison — FindYourCC" },
      {
        name: "description",
        content:
          "Put top Indian credit cards head-to-head in the 1v1 Battle Arena (Infinia vs Atlas, SBI Cashback vs Millennia, Amex MRCC vs Plat Travel). Compare 6 dimensions and net rupee return.",
      },
      { property: "og:title", content: "Credit Card 1v1 Battle Arena — FindYourCC" },
      {
        property: "og:description",
        content:
          "Compare popular Indian credit cards head-to-head with automatic category winners, scorecards, and spend simulations.",
      },
    ],
  }),
  component: BattleArenaPage,
});

const CLASSIC_RIVALRIES = [
  { id: "infinia-vs-atlas", name: "Infinia vs Axis Atlas", cardA: "hdfc-infinia-metal", cardB: "axis-atlas" },
  { id: "sbi-cb-vs-millennia", name: "SBI Cashback vs Millennia", cardA: "sbi-cashback", cardB: "hdfc-millennia" },
  { id: "mrcc-vs-plattravel", name: "Amex MRCC vs Plat Travel", cardA: "amex-mrcc", cardB: "amex-platinum-travel" },
  { id: "amazon-vs-flipkart", name: "Amazon Pay vs Flipkart Axis", cardA: "icici-amazon-pay", cardB: "axis-flipkart" },
  { id: "tata-vs-airtel", name: "Tata Neu vs Airtel Axis", cardA: "tata-neu-infinity", cardB: "axis-airtel" },
];

function BattleArenaPage() {
  const { cards } = useDataset();

  const [cardAId, setCardAId] = useState<string>("hdfc-infinia-metal");
  const [cardBId, setCardBId] = useState<string>("axis-atlas");
  const [monthlySpend, setMonthlySpend] = useState<number>(75000);

  const cardA = useMemo(() => cards.find((c) => c.id === cardAId) ?? cards[0], [cards, cardAId]);
  const cardB = useMemo(() => cards.find((c) => c.id === cardBId) ?? cards[1], [cards, cardBId]);

  // Dimension Evaluations
  const evaluation = useMemo(() => {
    if (!cardA || !cardB) return null;

    const rateA = computeEffectiveRate(cardA);
    const rateB = computeEffectiveRate(cardB);

    const accelA = bestAcceleratedRate(cardA);
    const accelB = bestAcceleratedRate(cardB);

    const loungeA = totalLoungeVisits(cardA);
    const loungeB = totalLoungeVisits(cardB);

    const feeA = cardA.fees.lifetimeFree ? 0 : cardA.fees.annualFee;
    const feeB = cardB.fees.lifetimeFree ? 0 : cardB.fees.annualFee;

    const forexA = cardA.fees.forexMarkupPct;
    const forexB = cardB.fees.forexMarkupPct;

    const upiA = cardA.upi.rupayUpiLinkable;
    const upiB = cardB.upi.rupayUpiLinkable;

    // Dimensions
    const dimensions = [
      {
        name: "Base Reward Return",
        valA: `${rateA.toFixed(2)}%`,
        valB: `${rateB.toFixed(2)}%`,
        winner: rateA > rateB ? "A" : rateB > rateA ? "B" : "Tie",
        detail: "Base earn on non-category general retail spends.",
      },
      {
        name: "Accelerated & Portal Peak",
        valA: `${accelA.toFixed(1)}%`,
        valB: `${accelB.toFixed(1)}%`,
        winner: accelA > accelB ? "A" : accelB > accelA ? "B" : "Tie",
        detail: "Max return possible on official partner portals / multipliers.",
      },
      {
        name: "Airport Lounge Quota",
        valA: loungeA >= 50 ? "Unlimited" : `${loungeA} visits/yr`,
        valB: loungeB >= 50 ? "Unlimited" : `${loungeB} visits/yr`,
        winner: loungeA > loungeB ? "A" : loungeB > loungeA ? "B" : "Tie",
        detail: "Domestic + International complimentary annual visits.",
      },
      {
        name: "Annual Fee & Holding Cost",
        valA: formatFee(cardA.fees.annualFee, cardA.fees.lifetimeFree),
        valB: formatFee(cardB.fees.annualFee, cardB.fees.lifetimeFree),
        winner: feeA < feeB ? "A" : feeB < feeA ? "B" : "Tie",
        detail: "Annual renewal fee (lower fee wins).",
      },
      {
        name: "Forex Markup on Travel",
        valA: `${forexA}%`,
        valB: `${forexB}%`,
        winner: forexA < forexB ? "A" : forexB < forexA ? "B" : "Tie",
        detail: "Foreign currency transaction fee (lower markup wins).",
      },
      {
        name: "RuPay UPI Compatibility",
        valA: upiA ? "Yes (Scan & Pay)" : "No",
        valB: upiB ? "Yes (Scan & Pay)" : "No",
        winner: upiA && !upiB ? "A" : upiB && !upiA ? "B" : "Tie",
        detail: "Linkable to Google Pay, PhonePe, Paytm for QR payments.",
      },
    ];

    const scoreA = dimensions.filter((d) => d.winner === "A").length;
    const scoreB = dimensions.filter((d) => d.winner === "B").length;

    // Simulation math
    const annualSpend = monthlySpend * 12;
    const returnA = (annualSpend * rateA) / 100 - feeA;
    const returnB = (annualSpend * rateB) / 100 - feeB;
    const netDiff = Math.abs(returnA - returnB);
    const returnWinner = returnA > returnB ? "A" : "B";

    return {
      dimensions,
      scoreA,
      scoreB,
      overallWinner: scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "Tie",
      returnA: Math.max(0, Math.round(returnA)),
      returnB: Math.max(0, Math.round(returnB)),
      netDiff: Math.round(netDiff),
      returnWinner,
    };
  }, [cardA, cardB, monthlySpend]);

  return (
    <div className="container-page py-8 lg:py-12 min-w-0">
      {/* Header */}
      <div className="max-w-3xl space-y-3 min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Swords className="size-3.5" />
          <span>Head-to-Head 1v1 Battle Arena</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Credit Card Battle Arena
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          Put any two Indian credit cards head-to-head. Our 6-dimension evaluation matrix grades base returns, portal accelerators, lounge perks, fees, forex, and RuPay UPI support to declare a decisive category-by-category winner.
        </p>
      </div>

      {/* Quick Rivalry Buttons */}
      <div className="mt-6 flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">Classic Battles:</span>
        {CLASSIC_RIVALRIES.map((rivalry) => (
          <button
            key={rivalry.id}
            type="button"
            onClick={() => {
              setCardAId(rivalry.cardA);
              setCardBId(rivalry.cardB);
            }}
            className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
              cardAId === rivalry.cardA && cardBId === rivalry.cardB
                ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                : "border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {rivalry.name}
          </button>
        ))}
      </div>

      {/* The 1v1 Arena Main Stage */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12 min-w-0">
        {/* Card A Stage */}
        <div className="space-y-4 lg:col-span-5 min-w-0">
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Corner A</span>
              <Badge variant="outline" className="text-[10px] font-mono">{cardA.issuer}</Badge>
            </div>

            {/* Selector dropdown for Card A */}
            <select
              value={cardAId}
              onChange={(e) => setCardAId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.issuer})
                </option>
              ))}
            </select>

            <div className="relative pt-2">
              <CardArt card={cardA} />
            </div>

            <div className="pt-2 text-center">
              <h3 className="font-display text-lg font-bold text-foreground">{cardA.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{cardA.issuer}</p>
            </div>
          </div>
        </div>

        {/* Versus Indicator & Overall Verdict in Middle */}
        <div className="flex flex-col items-center justify-center lg:col-span-2 space-y-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-foreground text-background shadow-md">
            <Swords className="size-6" />
          </div>
          {evaluation && (
            <div className="text-center">
              <div className="font-mono text-xl font-bold tabular-nums text-foreground">
                {evaluation.scoreA} - {evaluation.scoreB}
              </div>
              <Badge
                className={`mt-1 text-[10px] ${
                  evaluation.overallWinner === "A"
                    ? "bg-primary text-primary-foreground"
                    : evaluation.overallWinner === "B"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {evaluation.overallWinner === "A"
                  ? `${cardA.name.split(" ")[0]} Wins`
                  : evaluation.overallWinner === "B"
                    ? `${cardB.name.split(" ")[0]} Wins`
                    : "Tie / Equal Score"}
              </Badge>
            </div>
          )}
        </div>

        {/* Card B Stage */}
        <div className="space-y-4 lg:col-span-5 min-w-0">
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corner B</span>
              <Badge variant="outline" className="text-[10px] font-mono">{cardB.issuer}</Badge>
            </div>

            {/* Selector dropdown for Card B */}
            <select
              value={cardBId}
              onChange={(e) => setCardBId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.issuer})
                </option>
              ))}
            </select>

            <div className="relative pt-2">
              <CardArt card={cardB} />
            </div>

            <div className="pt-2 text-center">
              <h3 className="font-display text-lg font-bold text-foreground">{cardB.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{cardB.issuer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed 6-Dimension Scorecard */}
      {evaluation && (
        <div className="mt-8 space-y-6 min-w-0">
          <div className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Trophy className="size-5 text-primary" />
                  <span>6-Dimension Head-to-Head Scorecard</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct metric comparison with automatic category winner badges.
                </p>
              </div>
            </div>

            <div className="grid gap-3 min-w-0">
              {evaluation.dimensions.map((dim) => (
                <div
                  key={dim.name}
                  className="grid grid-cols-12 items-center gap-2 rounded-xl border border-border/70 bg-surface/40 p-3 sm:p-4 text-xs transition-colors hover:bg-surface/80"
                >
                  {/* Card A Score */}
                  <div className="col-span-3 sm:col-span-3 text-left">
                    <div className="font-mono font-bold text-foreground sm:text-sm">{dim.valA}</div>
                    {dim.winner === "A" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <CheckCircle2 className="size-3" /> Winner
                      </span>
                    )}
                  </div>

                  {/* Dimension Label */}
                  <div className="col-span-6 sm:col-span-6 text-center px-1">
                    <strong className="text-foreground font-semibold block text-xs sm:text-sm">{dim.name}</strong>
                    <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">{dim.detail}</span>
                  </div>

                  {/* Card B Score */}
                  <div className="col-span-3 sm:col-span-3 text-right">
                    <div className="font-mono font-bold text-foreground sm:text-sm">{dim.valB}</div>
                    {dim.winner === "B" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <CheckCircle2 className="size-3" /> Winner
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Spend Battle Simulator */}
          <div className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <span>Annual Spend Return Simulator</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  See which card yields more net rupees in your pocket after deducting annual fees.
                </p>
              </div>

              <div className="font-mono text-base font-bold text-foreground bg-surface px-3 py-1.5 rounded-xl border border-border">
                {formatINR(monthlySpend)} <span className="text-xs font-normal text-muted-foreground">/ month</span>
              </div>
            </div>

            <Slider
              value={[monthlySpend]}
              min={10000}
              max={250000}
              step={5000}
              onValueChange={(val) => setMonthlySpend(val[0] ?? 50000)}
              className="py-2"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className={`rounded-xl border p-4 text-left transition-all ${
                evaluation.returnWinner === "A" ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-surface/40"
              }`}>
                <div className="text-xs text-muted-foreground">{cardA.name}</div>
                <div className="font-mono text-xl font-bold text-foreground mt-1">
                  +{formatINR(evaluation.returnA)} <span className="text-xs font-normal text-muted-foreground">net/yr</span>
                </div>
              </div>

              <div className={`rounded-xl border p-4 text-left transition-all ${
                evaluation.returnWinner === "B" ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-surface/40"
              }`}>
                <div className="text-xs text-muted-foreground">{cardB.name}</div>
                <div className="font-mono text-xl font-bold text-foreground mt-1">
                  +{formatINR(evaluation.returnB)} <span className="text-xs font-normal text-muted-foreground">net/yr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Disclaimer className="mt-12" />
    </div>
  );
}
