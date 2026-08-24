import { AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CardValuation } from "@/lib/rewardEngine";
import { formatFee, formatINR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CardValuationCardProps {
  valuation: CardValuation;
}

export function CardValuationCard({ valuation }: CardValuationCardProps) {
  const {
    card,
    categories,
    monthlyRewardValue,
    annualRewardValue,
    effectiveReturnPct,
    effectiveAnnualFee,
    feeWaived,
    netAnnualValue,
    breakEvenMonthlySpend,
    milestones,
    benefitLines,
  } = valuation;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.issuer}
          </p>
          <h3 className="font-display text-lg font-semibold">{card.name}</h3>
        </div>
        <Badge variant={netAnnualValue >= 0 ? "default" : "outline"} className="whitespace-nowrap">
          Net {formatINR(netAnnualValue)}/yr
        </Badge>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Monthly reward" value={formatINR(monthlyRewardValue)} />
        <Stat label="Annual reward" value={formatINR(annualRewardValue)} />
        <Stat label="Effective return" value={formatPct(effectiveReturnPct)} />
        <Stat
          label="Annual fee"
          value={feeWaived ? "Waived" : formatFee(effectiveAnnualFee)}
          hint={feeWaived ? "Waived on your spend / lifetime-free" : undefined}
        />
      </div>

      <div
        className={cn(
          "mb-5 flex items-start gap-2 rounded-xl border p-3 text-sm",
          breakEvenMonthlySpend === null
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-border bg-surface",
        )}
      >
        <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {effectiveAnnualFee === 0 ? (
          <p>This card has no fee to earn back — every rupee of reward is upside.</p>
        ) : breakEvenMonthlySpend === null ? (
          <p>
            At your current spend mix, this card's rewards can never earn back its{" "}
            {formatFee(effectiveAnnualFee)} fee. You'd need a fundamentally different spend pattern
            to justify it.
          </p>
        ) : (
          <p>
            You need <strong>{formatINR(breakEvenMonthlySpend)}/month</strong> at your current spend
            mix to justify this card's {formatFee(effectiveAnnualFee)} fee.
          </p>
        )}
      </div>

      <div className="mb-5 overflow-x-auto">
        <h4 className="mb-2 text-sm font-semibold">Category breakdown</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Monthly spend</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Monthly value</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow
                key={cat.key}
                className={cat.excluded ? "text-amber-600 dark:text-amber-400" : undefined}
              >
                <TableCell className={cn(cat.excluded && "line-through decoration-amber-500/70")}>
                  {cat.label}
                </TableCell>
                <TableCell className="text-right">{formatINR(cat.monthlySpend)}</TableCell>
                <TableCell className="text-right">
                  {cat.excluded ? "0%" : formatPct(cat.ratePct)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatINR(cat.monthlyValue)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {cat.reason}
                  {cat.cappedAt !== undefined && ` (capped at ${formatINR(cat.cappedAt)}/mo)`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories
          .filter((c) => c.excluded && c.monthlySpend > 0)
          .map((c) => (
            <p
              key={c.key}
              className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400"
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {formatINR(c.monthlySpend)} of your monthly spend on {c.label.toLowerCase()} earns
              nothing on this card.
            </p>
          ))}
      </div>

      {benefitLines.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-2 text-sm font-semibold">Perks counted</h4>
          <ul className="space-y-2">
            {benefitLines.map((line) => (
              <li key={line.label} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm">{line.label}</span>
                <span className="text-sm font-medium">{formatINR(line.value)}/yr</span>
                <span className="w-full text-xs text-muted-foreground">{line.basis}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {milestones.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Milestone benefits</h4>
          <ul className="space-y-3">
            {milestones.map((m, i) => (
              <li key={i}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-sm">
                  <span>{m.label}</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      m.achieved ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {m.achieved ? "On track" : "Not on track"} · {formatINR(m.spendRequired)}/
                    {m.period.toLowerCase()}
                  </span>
                </div>
                <Progress value={m.progressPct} aria-label={`${m.label} progress`} />
                {m.achieved && m.annualValue > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Worth ~{formatINR(m.annualValue)}/year if maintained.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string | undefined }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function CardValuationCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
