import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  Trophy,
  Flame,
  Plane,
  Sparkles,
  Zap,
  ShoppingBag,
  Fuel,
  Utensils,
  Globe,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/lib/card-store";
import { CardArt } from "@/components/CardArt";
import { computeEffectiveRate } from "@/data/cards";
import { formatFee } from "@/lib/format";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/categories")({
  head: () => ({
    links: canonical("/categories"),
    meta: [
      { title: "Best Credit Cards in India by Category (2026) — FindYourCC" },
      {
        name: "description",
        content:
          "Curated rankings of the best credit cards in India for cashback, airport lounge access, lifetime free, zero forex, RuPay UPI, dining, and fuel.",
      },
      { property: "og:title", content: "Best Credit Cards in India by Category (2026) — FindYourCC" },
      {
        property: "og:description",
        content:
          "Discover the top 3-5 credit cards for every spending category with honest pros, cons, and earn rate benchmarks.",
      },
    ],
  }),
  component: CategoriesHubPage,
});

interface CategoryHubConfig {
  id: string;
  title: string;
  shortDesc: string;
  icon: typeof Trophy;
  accent: string;
  filterFn: (cards: any[]) => any[];
  editorialRationale: string;
}

const CATEGORY_HUBS: CategoryHubConfig[] = [
  {
    id: "cashback",
    title: "Best Cashback Credit Cards",
    shortDesc: "Flat 5% online cashback, automatic statement credit, and zero redemption hurdles.",
    icon: Flame,
    accent: "from-amber-500/20 to-rose-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && (c.categories.includes("Cashback") || c.name.toLowerCase().includes("cashback")))
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a)),
    editorialRationale:
      "Cashback cards remove loyalty catalog markups and point expiration worries. Top cards provide 5% direct statement credit with minimal exclusions.",
  },
  {
    id: "lounge",
    title: "Best Airport Lounge Cards",
    shortDesc: "High quarterly visit quotas, domestic & international Priority Pass, and low spend hurdles.",
    icon: Plane,
    accent: "from-blue-500/20 to-indigo-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && (c.benefits.loungeDomestic || c.benefits.loungeInternational))
        .sort((a, b) => {
          const aV = (a.benefits.loungeDomestic?.unlimited ? 50 : (a.benefits.loungeDomestic?.visitsPerQuarter ?? 0) * 4) +
            (a.benefits.loungeInternational?.unlimited ? 50 : (a.benefits.loungeInternational?.visitsPerYear ?? 0));
          const bV = (b.benefits.loungeDomestic?.unlimited ? 50 : (b.benefits.loungeDomestic?.visitsPerQuarter ?? 0) * 4) +
            (b.benefits.loungeInternational?.unlimited ? 50 : (b.benefits.loungeInternational?.visitsPerYear ?? 0));
          return bV - aV;
        }),
    editorialRationale:
      "Following the 2025–2026 issuer shakeup, we prioritize cards with zero or modest quarterly spend conditions (like IndusInd Tiger) alongside powerhouse cards like Infinia and Atlas.",
  },
  {
    id: "lifetime-free",
    title: "Best Lifetime Free (LTF) Cards",
    shortDesc: "Zero joining fee, zero annual renewal fee forever. Keep your credit score strong for ₹0.",
    icon: Sparkles,
    accent: "from-emerald-500/20 to-teal-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && c.fees.lifetimeFree)
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a)),
    editorialRationale:
      "Lifetime Free cards are essential foundation pieces. They age your credit history forever with zero recurring costs and provide unconditional benefits.",
  },
  {
    id: "forex-travel",
    title: "Best International Travel & Zero Forex",
    shortDesc: "0% to 1% forex markups, worldwide lounge access, and generous airline air miles transfers.",
    icon: Globe,
    accent: "from-sky-500/20 to-cyan-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && (c.fees.forexMarkupPct <= 2 || c.categories.includes("Travel")))
        .sort((a, b) => a.fees.forexMarkupPct - b.fees.forexMarkupPct),
    editorialRationale:
      "Standard cards quietly charge 3.5% + 18% GST (4.13%) on foreign currency transactions. These cards save you thousands on overseas trips and international subscriptions.",
  },
  {
    id: "rupay-upi",
    title: "Best RuPay UPI Credit Cards",
    shortDesc: "Link directly to BHIM, Google Pay, PhonePe, and Paytm to earn credit card rewards on small tea, grocery, and local QR spends.",
    icon: Zap,
    accent: "from-purple-500/20 to-pink-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && c.upi.rupayUpiLinkable)
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a)),
    editorialRationale:
      "RuPay credit on UPI allows you to monetize daily offline QR transactions that previously earned nothing.",
  },
  {
    id: "dining-grocery",
    title: "Best Food Delivery & Grocery Cards",
    shortDesc: "10% on Swiggy, Zomato, Blinkit, Instamart, Zepto, and BigBasket.",
    icon: Utensils,
    accent: "from-orange-500/20 to-yellow-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && (c.categories.includes("Dining") || c.categories.includes("Shopping")))
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a)),
    editorialRationale:
      "Food and quick commerce represent everyday recurring spend. Special co-branded partnerships provide unprecedented 10% cash savings.",
  },
  {
    id: "fuel",
    title: "Best Fuel Surcharge & Co-branded Cards",
    shortDesc: "Up to 7.25% value back on BPCL, IOCL, and HPCL fuel dispensing pumps.",
    icon: Fuel,
    accent: "from-red-500/20 to-amber-500/20",
    filterFn: (cards) =>
      cards
        .filter((c) => c.status === "Active" && (c.categories.includes("Fuel") || c.name.toLowerCase().includes("fuel") || c.name.toLowerCase().includes("bpcl") || c.name.toLowerCase().includes("iocl") || c.name.toLowerCase().includes("hpcl")))
        .sort((a, b) => computeEffectiveRate(b) - computeEffectiveRate(a)),
    editorialRationale:
      "Fuel spends are excluded from rewards on 90% of cards. Co-branded fuel cards give you back real value on mandatory commutes.",
  },
];

function CategoriesHubPage() {
  const { cards } = useDataset();
  const [selectedHubId, setSelectedHubId] = useState<string>("cashback");

  const currentHub = useMemo(() => {
    return CATEGORY_HUBS.find((h) => h.id === selectedHubId) ?? CATEGORY_HUBS[0];
  }, [selectedHubId]);

  const rankedCards = useMemo(() => {
    return currentHub.filterFn(cards).slice(0, 6);
  }, [currentHub, cards]);

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Trophy className="size-3.5" />
          <span>Curated Indian Credit Card Directory</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Best Credit Cards in India by Category
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Skip generic marketing claims. Explore hand-picked category winners ranked on real reward rates, fees, exclusions, and verified 2026 perks.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="mt-6 flex w-full max-w-full items-center gap-2 overflow-x-auto no-scrollbar border-b border-border pb-3">
        {CATEGORY_HUBS.map((hub) => {
          const Icon = hub.icon;
          const isSelected = hub.id === selectedHubId;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHubId(hub.id)}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{hub.title.replace("Best ", "")}</span>
            </button>
          );
        })}
      </div>

      {/* Active Hub View */}
      <div className="mt-6 sm:mt-8 space-y-6 min-w-0">
        {/* Hub Banner */}
        <div className={`rounded-2xl border border-border bg-gradient-to-r ${currentHub.accent} p-4 sm:p-6 lg:p-8 backdrop-blur-sm min-w-0`}>
          <div className="max-w-2xl space-y-2 min-w-0">
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{currentHub.title}</h2>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{currentHub.shortDesc}</p>
            <div className="mt-4 pt-4 border-t border-foreground/10 text-xs text-foreground/90 flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong>Why these win: </strong>
                {currentHub.editorialRationale}
              </div>
            </div>
          </div>
        </div>

        {/* Ranked Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          {rankedCards.map((card, index) => {
            const effectiveRate = computeEffectiveRate(card);
            return (
              <div
                key={card.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-foreground/30 hover:shadow-sm min-w-0"
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <span>#{index + 1} Choice</span>
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{card.issuer}</span>
                  </div>

                  {/* Card Art */}
                  <div className="relative mb-3.5">
                    <CardArt card={card} />
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground line-clamp-1">{card.name}</h3>

                  {/* Highlights */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Effective Return:</span>
                      <strong className="text-foreground">{effectiveRate}% Base Rate</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <strong className="text-foreground">{formatFee(card.fees.annualFee, card.fees.lifetimeFree)}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Forex Markup:</span>
                      <strong className="text-foreground">{card.fees.forexMarkupPct}%</strong>
                    </div>
                  </div>

                  {/* Best For Tags */}
                  {card.bestFor.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {card.bestFor.slice(0, 2).map((bf: string, i: number) => (
                        <span key={i} className="rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50">
                          {bf}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center gap-2">
                  <Link to="/card/$id" params={{ id: card.id }} className="flex-1">
                    <Button variant="default" size="sm" className="w-full text-xs">
                      View Full Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Disclaimer className="mt-12" />
    </div>
  );
}
