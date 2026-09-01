import { useState, useMemo } from "react";
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Gift,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { BRAND_PORTAL_RATES, type BrandVoucherPortal } from "@/data/portals";
import { formatINR } from "@/lib/format";

export function PortalVoucherFinder() {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("amazon-shopping");
  const [voucherSpend, setVoucherSpend] = useState<number>(10000);

  const currentBrand = useMemo(() => {
    return (
      BRAND_PORTAL_RATES.find((b) => b.brandId === selectedBrandId) ?? BRAND_PORTAL_RATES[0]
    );
  }, [selectedBrandId]);

  return (
    <div className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
            <Gift className="size-3" />
            <span>Bank Portal & Voucher Multiplier Engine</span>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            SmartBuy & Reward Multiplier Rate Finder
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buying vouchers via SmartBuy, Gyftr, or Reward Multiplier boosts returns from 3% to 33.3%. Compare your options before shopping.
          </p>
        </div>
      </div>

      {/* Brand Selection Tabs */}
      <div className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {BRAND_PORTAL_RATES.map((brand) => (
          <button
            key={brand.brandId}
            type="button"
            onClick={() => setSelectedBrandId(brand.brandId)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-left text-xs transition-all ${
              selectedBrandId === brand.brandId
                ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                : "border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div>{brand.brandName.split(" ")[0]}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{brand.bestRatePct}% Peak</div>
          </button>
        ))}
      </div>

      {/* Spend Slider */}
      <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span className="text-xs font-semibold text-muted-foreground">Estimated Voucher Purchase</span>
          <span className="font-mono text-base font-bold text-foreground">{formatINR(voucherSpend)}</span>
        </div>
        <Slider
          value={[voucherSpend]}
          min={1000}
          max={50000}
          step={1000}
          onValueChange={(v) => setVoucherSpend(v[0] ?? 10000)}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>₹1,000</span>
          <span>₹25,000</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* Rates Matrix */}
      {currentBrand && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Channels Ranked for {currentBrand.brandName}
            </span>
            <Badge variant="outline" className="text-[10px]">
              Top Rate: {currentBrand.bestRateCard} ({currentBrand.bestRatePct}%)
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentBrand.rates.map((rate, rank) => {
              const estimatedRewardRupees = Math.round((voucherSpend * rate.effectiveEarnPct) / 100);
              const isBest = rank === 0;

              return (
                <div
                  key={rate.cardId + rate.portalName}
                  className={`rounded-xl border p-4 space-y-2 text-xs transition-all ${
                    isBest
                      ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                      : "border-border bg-card hover:bg-surface/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                      {isBest && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                      <span>{rate.cardName}</span>
                    </div>
                    <Badge variant={isBest ? "default" : "outline"} className="text-[10px] font-mono">
                      {rate.effectiveEarnPct}% Return
                    </Badge>
                  </div>

                  <div className="text-primary font-semibold text-[11px]">{rate.portalName} • {rate.multiplier}</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{rate.notes}</p>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{rate.monthlyCapText}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(estimatedRewardRupees)} Value
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
