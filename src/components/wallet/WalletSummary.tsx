import { PiggyBank, Sparkles, TrendingUp } from "lucide-react";
import { formatINR, formatPct } from "@/lib/format";
import type { WalletSummary as WalletSummaryData } from "@/components/wallet/wallet-analysis";

export function WalletSummary({
  summary,
  cardCount,
}: {
  summary: WalletSummaryData;
  cardCount: number;
}) {
  const items = [
    {
      icon: PiggyBank,
      label: "Total annual fee outgo",
      value: formatINR(summary.totalAnnualFee),
      hint: "After lifetime-free and spend-based fee waivers",
    },
    {
      icon: Sparkles,
      label: "Combined annual reward value",
      value: formatINR(summary.combinedAnnualReward),
      hint: "If every rupee goes to your best card for that category",
    },
    {
      icon: TrendingUp,
      label: "Combined effective return",
      value: formatPct(summary.combinedReturnPct),
      hint: "Reward value as a share of your monthly spend profile",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <item.icon className="size-4" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide">{item.label}</p>
          </div>
          <p className="mt-2 text-2xl font-semibold">{cardCount === 0 ? "—" : item.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
