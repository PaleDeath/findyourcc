import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  DollarSign,
  Info,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useDataset } from "@/lib/card-store";
import { computeEffectiveRate } from "@/data/cards";
import { formatINR } from "@/lib/format";

export type SurchargeSpendType = "rent" | "education" | "utility" | "forex" | "dcc";

interface SurchargeTypeConfig {
  id: SurchargeSpendType;
  label: string;
  bankSurchargePct: number;
  thirdPartyFeePct: number;
  gstPct: number;
  description: string;
}

const SURCHARGE_CONFIGS: Record<SurchargeSpendType, SurchargeTypeConfig> = {
  rent: {
    id: "rent",
    label: "House Rent Payment",
    bankSurchargePct: 1.0,
    thirdPartyFeePct: 1.0,
    gstPct: 18.0,
    description: "Banks charge 1% + 18% GST on rent, and platforms (CRED/NoBroker) charge ~1% convenience fee.",
  },
  education: {
    id: "education",
    label: "College & School Fees",
    bankSurchargePct: 1.0,
    thirdPartyFeePct: 0.0,
    gstPct: 18.0,
    description: "1% fee + 18% GST applies when paying education fees through third-party apps.",
  },
  utility: {
    id: "utility",
    label: "High Utility Spends (> ₹50k/mo)",
    bankSurchargePct: 1.0,
    thirdPartyFeePct: 0.0,
    gstPct: 18.0,
    description: "HDFC, ICICI, and SBI charge 1% + 18% GST on utility spends exceeding monthly threshold caps.",
  },
  forex: {
    id: "forex",
    label: "Foreign Currency (Overseas / Subscriptions)",
    bankSurchargePct: 3.5,
    thirdPartyFeePct: 0.0,
    gstPct: 18.0,
    description: "Standard cards charge 3.5% forex markup + 18% GST on markup (effective 4.13%). Zero-forex cards charge 0%.",
  },
  dcc: {
    id: "dcc",
    label: "DCC (International INR Billing)",
    bankSurchargePct: 1.0,
    thirdPartyFeePct: 0.0,
    gstPct: 18.0,
    description: "Dynamic Currency Conversion 1% fee when an overseas merchant (Netflix, Steam, Airbnb) bills in Indian Rupees.",
  },
};

export function SurchargeCalculator() {
  const { cards } = useDataset();

  const [spendType, setSpendType] = useState<SurchargeSpendType>("rent");
  const [txnAmount, setTxnAmount] = useState<number>(30000);
  const [selectedCardId, setSelectedCardId] = useState<string>("hdfc-infinia-metal");

  const selectedCard = useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) ?? cards[0];
  }, [cards, selectedCardId]);

  const config = SURCHARGE_CONFIGS[spendType];

  const calculation = useMemo(() => {
    if (!selectedCard) return null;

    const exclusions = selectedCard.rewards.earningExclusions.map((e) => e.toLowerCase());
    const isExcluded =
      (spendType === "rent" && exclusions.some((e) => e.includes("rent"))) ||
      (spendType === "education" && exclusions.some((e) => e.includes("education") || e.includes("school"))) ||
      (spendType === "utility" && exclusions.some((e) => e.includes("utility") || e.includes("bill")));

    const baseEarnRate = isExcluded ? 0 : computeEffectiveRate(selectedCard);
    const rewardEarnedRupees = Math.round((txnAmount * baseEarnRate) / 100);

    const bankSurchargeRate =
      spendType === "forex" ? selectedCard.fees.forexMarkupPct : config.bankSurchargePct;

    const bankFeeBase = (txnAmount * bankSurchargeRate) / 100;
    const gstOnBankFee = (bankFeeBase * config.gstPct) / 100;
    const totalBankSurcharge = bankFeeBase + gstOnBankFee;

    const platformFee = (txnAmount * config.thirdPartyFeePct) / 100;
    const gstOnPlatformFee = (platformFee * config.gstPct) / 100;
    const totalPlatformFee = platformFee + gstOnPlatformFee;

    const totalFeesIncurred = Math.round(totalBankSurcharge + totalPlatformFee);
    const netBenefit = rewardEarnedRupees - totalFeesIncurred;
    const isProfitable = netBenefit > 0;

    return {
      isExcluded,
      baseEarnRate,
      rewardEarnedRupees,
      bankFeeBase,
      gstOnBankFee,
      totalBankSurcharge: Math.round(totalBankSurcharge),
      totalPlatformFee: Math.round(totalPlatformFee),
      totalFeesIncurred,
      netBenefit,
      isProfitable,
    };
  }, [selectedCard, spendType, txnAmount, config]);

  return (
    <div className="card-bevel rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <Calculator className="size-3" />
          <span>India Surcharge Decoupler</span>
        </div>
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
          Surcharges vs Rewards Net Profit Calculator
        </h3>
        <p className="text-xs text-muted-foreground">
          Banks charge 1% to 3.5% + 18% GST on rent, education, utilities, and forex. Find out if your card earns real profit or loses you money.
        </p>
      </div>

      {/* Spend Category Tabs */}
      <div className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(Object.keys(SURCHARGE_CONFIGS) as SurchargeSpendType[]).map((key) => {
          const item = SURCHARGE_CONFIGS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSpendType(key)}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                spendType === key
                  ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                  : "border-border/70 bg-surface/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-12 min-w-0">
        {/* Left Inputs */}
        <div className="space-y-4 md:col-span-6 min-w-0">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Credit Card</label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.issuer})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Transaction Amount</label>
              <span className="font-mono text-sm font-bold text-foreground">{formatINR(txnAmount)}</span>
            </div>
            <Slider
              value={[txnAmount]}
              min={5000}
              max={200000}
              step={5000}
              onValueChange={(v) => setTxnAmount(v[0] ?? 30000)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹5,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground bg-surface/60 p-3 rounded-xl border border-border/50">
            <Info className="size-3.5 inline mr-1 text-primary" />
            {config.description}
          </p>
        </div>

        {/* Right Output Verdict */}
        {calculation && (
          <div className="space-y-4 md:col-span-6 min-w-0">
            <div
              className={`rounded-2xl border p-4 sm:p-5 text-left transition-all ${
                calculation.isProfitable
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-destructive/40 bg-destructive/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Final Net Result
                </span>
                <Badge
                  variant={calculation.isProfitable ? "default" : "destructive"}
                  className="text-[10px] font-bold"
                >
                  {calculation.isProfitable ? "Net Profit ✓" : "Net Loss ✕"}
                </Badge>
              </div>

              <div className="mt-2 font-mono text-2xl font-bold tabular-nums">
                {calculation.isProfitable ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{formatINR(calculation.netBenefit)} Net Reward
                  </span>
                ) : (
                  <span className="text-destructive">
                    -{formatINR(Math.abs(calculation.netBenefit))} Net Loss
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {calculation.isProfitable
                  ? `Your card's earn rate (${calculation.baseEarnRate}%) exceeds the total surcharge fee drag.`
                  : calculation.isExcluded
                    ? `This card strictly excludes ${config.label} from rewards (0% earned), so you lose 100% of the surcharge fee.`
                    : `Surcharges and 18% GST (₹${calculation.totalFeesIncurred}) exceed the reward points earned (₹${calculation.rewardEarnedRupees}).`}
              </p>
            </div>

            {/* Line-by-Line Breakdown */}
            <div className="rounded-xl border border-border/60 bg-surface/40 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gross Rewards Earned:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatINR(calculation.rewardEarnedRupees)} ({calculation.baseEarnRate}%)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bank Surcharge + 18% GST:</span>
                <span className="font-mono font-bold text-destructive">
                  -{formatINR(calculation.totalBankSurcharge)}
                </span>
              </div>
              {calculation.totalPlatformFee > 0 && (
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Platform Convenience Fee:</span>
                  <span className="font-mono font-bold text-destructive">
                    -{formatINR(calculation.totalPlatformFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-bold">
                <span>Net In Pocket:</span>
                <span
                  className={`font-mono ${
                    calculation.isProfitable
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {calculation.isProfitable ? "+" : "-"}
                  {formatINR(Math.abs(calculation.netBenefit))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
