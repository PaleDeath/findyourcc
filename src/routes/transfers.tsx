import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo";
import {
  Send,
  Plane,
  Building2,
  Sparkles,
  Calculator,
  ChevronRight,
  Info,
  TrendingUp,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  TRANSFER_PARTNERS,
  CARD_TRANSFERS,
  type TransferPartner,
  type CardTransferOption,
} from "@/data/transfers";
import { formatINR } from "@/lib/format";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/transfers")({
  head: () => ({
    links: canonical("/transfers"),
    meta: [
      { title: "Points & Miles Transfer Matrix & Calculator — FindYourCC" },
      {
        name: "description",
        content:
          "Convert credit card reward points to airline miles and hotel loyalty points. Transfer ratios for Axis Atlas, HDFC Infinia, Amex, Accor, KrisFlyer, Marriott, and Air India.",
      },
      { property: "og:title", content: "Points & Miles Transfer Matrix & Calculator — FindYourCC" },
      {
        property: "og:description",
        content:
          "Master airline & hotel reward transfer ratios, sweetspots, and rupee value calculations for Indian credit cards.",
      },
    ],
  }),
  component: TransfersPage,
});

function TransfersPage() {
  const [selectedCardId, setSelectedCardId] = useState<string>("axis-atlas");
  const [pointsInput, setPointsInput] = useState<number>(10000);
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<"all" | "Airline" | "Hotel">("all");

  const selectedCardTransfer = useMemo(() => {
    return CARD_TRANSFERS.find((c) => c.cardId === selectedCardId) ?? CARD_TRANSFERS[0];
  }, [selectedCardId]);

  // Calculate transfer outcomes
  const calculatedPartners = useMemo(() => {
    if (!selectedCardTransfer) return [];

    return selectedCardTransfer.transferPartners
      .map((option) => {
        const partnerInfo = TRANSFER_PARTNERS.find((p) => p.id === option.partnerId);
        if (!partnerInfo) return null;

        const effectiveMultiplier = option.partnerPointsReceived / option.cardPointsRequired;
        const totalPartnerUnits = Math.floor(pointsInput * effectiveMultiplier);
        const estimatedRupeeValue = Math.round(totalPartnerUnits * partnerInfo.approxValueINR);

        return {
          ...option,
          partner: partnerInfo,
          totalPartnerUnits,
          estimatedRupeeValue,
          effectiveMultiplier,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => partnerTypeFilter === "all" || item.partner.category === partnerTypeFilter)
      .sort((a, b) => b.estimatedRupeeValue - a.estimatedRupeeValue);
  }, [selectedCardTransfer, pointsInput, partnerTypeFilter]);

  return (
    <div className="container-page py-8 lg:py-12">
      {/* Hero Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Send className="size-3.5" />
          <span>Reward Miles & Partner Transfer Intelligence</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Points & Miles Transfer Matrix
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Unlock 2X to 5X higher value by transferring your credit card points to global airline frequent flyer and hotel loyalty programs (Accor, KrisFlyer, Marriott, Air India, Qatar Avios, Taj).
        </p>
      </div>

      {/* Interactive Calculator Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Control Panel */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-5">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              <span>Transfer Calculator</span>
            </h2>

            {/* Select Card */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Your Card</label>
              <div className="space-y-1.5">
                {CARD_TRANSFERS.map((card) => {
                  const isSelected = card.cardId === selectedCardId;
                  return (
                    <button
                      key={card.cardId}
                      type="button"
                      onClick={() => setSelectedCardId(card.cardId)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "bg-surface/50 text-foreground hover:bg-surface border border-border/50"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{card.cardName}</div>
                        <div className="text-[10px] opacity-75">{card.issuer} • {card.baseRewardName}</div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${isSelected ? "border-white/30 text-white" : ""}`}>
                        {card.transferPartners.length} partners
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Points Slider / Input */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  {selectedCardTransfer.baseRewardName} Balance
                </label>
                <span className="font-display text-sm font-bold text-foreground">
                  {pointsInput.toLocaleString("en-IN")}
                </span>
              </div>

              <Slider
                value={[pointsInput]}
                min={1000}
                max={100000}
                step={500}
                onValueChange={(val) => setPointsInput(val[0] ?? 1000)}
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1,000</span>
                <span>50,000</span>
                <span>1,00,000</span>
              </div>
            </div>

            {/* Filter by Airline / Hotel */}
            <div className="pt-3 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground block mb-2">Filter Partners</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["all", "Airline", "Hotel"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setPartnerTypeFilter(filter)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      partnerTypeFilter === filter
                        ? "bg-foreground text-background font-semibold"
                        : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "all" ? "All" : filter === "Airline" ? "✈️ Airlines" : "🏨 Hotels"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Grid */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {selectedCardTransfer.cardName} Transfer Outcomes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Calculated value for <strong className="text-foreground">{pointsInput.toLocaleString("en-IN")} {selectedCardTransfer.baseRewardName}</strong>
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold self-start sm:self-auto">
                {calculatedPartners.length} Available Programs
              </Badge>
            </div>

            <div className="grid gap-3 pt-2">
              {calculatedPartners.map((item) => (
                <div
                  key={item.partnerId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface/40 p-4 transition-all hover:border-foreground/20 hover:bg-surface"
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-bold text-foreground">{item.partner.name}</h4>
                      <Badge variant={item.partner.category === "Airline" ? "default" : "secondary"} className="text-[10px]">
                        {item.partner.category}
                      </Badge>
                      {item.partner.alliance && (
                        <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                          {item.partner.alliance}
                        </span>
                      )}
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Ratio: <strong className="text-foreground">{item.ratio}</strong></span>
                      <span>•</span>
                      <span>Min Block: <strong className="text-foreground">{item.minTransferBlock}</strong></span>
                      <span>•</span>
                      <span>Speed: <strong className="text-foreground">{item.transferDurationDays}</strong></span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-border/40 shrink-0">
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-primary">
                        {item.totalPartnerUnits.toLocaleString("en-IN")} {item.partner.category === "Airline" ? "Miles" : "Points"}
                      </div>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ≈ {formatINR(item.estimatedRupeeValue)} Est. Value
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sweetspots Info Guide */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <span>Top Loyalty Program Sweetspots in India</span>
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {TRANSFER_PARTNERS.slice(0, 6).map((partner) => (
                <div key={partner.id} className="rounded-xl border border-border bg-surface/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-foreground">{partner.name}</h4>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      ≈ ₹{partner.approxValueINR.toFixed(2)}/pt
                    </span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    {partner.popularSweetspots.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Disclaimer className="mt-12" />
    </div>
  );
}
