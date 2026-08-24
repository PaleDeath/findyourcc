import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

function Field({
  id,
  label,
  value,
  onChange,
  suffix,
  step = "1",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function InterestCostCalculator() {
  const [balance, setBalance] = useState(50000);
  const [ratePct, setRatePct] = useState(3.5);
  const [months, setMonths] = useState(6);
  const [newSpends, setNewSpends] = useState(true);

  const monthlyRate = ratePct / 100;
  const grown = balance * Math.pow(1 + monthlyRate, Math.max(months, 0));
  const interest = Math.max(grown - balance, 0);
  const gst = interest * 0.18;
  const total = interest + gst;
  const penaltyOnNewSpends = newSpends ? balance * 0.35 * monthlyRate * Math.max(months, 0) : 0;
  const allIn = total + penaltyOnNewSpends * 1.18;
  const annualisedPct = (Math.pow(1 + monthlyRate, 12) - 1) * 100 * 1.18;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold tracking-tight">
        Interest cost calculator
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        What revolving a balance actually costs once compounding and 18% GST are counted.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field
          id="ic-bal"
          label="Outstanding balance"
          value={balance}
          onChange={setBalance}
          step="1000"
        />
        <Field
          id="ic-rate"
          label="Monthly interest rate"
          value={ratePct}
          onChange={setRatePct}
          suffix="%"
          step="0.05"
        />
        <Field id="ic-months" label="Months revolved" value={months} onChange={setMonths} />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[hsl(var(--primary))]"
          checked={newSpends}
          onChange={(e) => setNewSpends(e.target.checked)}
        />
        I keep spending on the card while revolving
      </label>

      <div aria-live="polite" className="mt-4 space-y-2 rounded-xl bg-surface p-4 text-sm">
        <Row label="Interest charged" value={formatINR(Math.round(interest))} />
        <Row label="GST at 18%" value={formatINR(Math.round(gst))} />
        {newSpends && (
          <Row
            label="Extra cost of losing the interest-free period"
            value={formatINR(Math.round(penaltyOnNewSpends * 1.18))}
          />
        )}
        <Row label="Total cost" value={formatINR(Math.round(allIn))} strong />
        <Row label="Effective annualised rate" value={`${annualisedPct.toFixed(1)}%`} />
        <p className="pt-1 text-xs text-muted-foreground">
          {annualisedPct > 40
            ? "That is personal-loan-times-three territory. Clear the balance or convert it to an EMI before the next statement."
            : "Still expensive money — pay in full whenever you can."}
        </p>
      </div>
    </div>
  );
}

export function UtilisationChecker() {
  const [limit, setLimit] = useState(200000);
  const [outstanding, setOutstanding] = useState(90000);
  const pct = limit > 0 ? (outstanding / limit) * 100 : 0;
  const band =
    pct <= 30
      ? { label: "Healthy", tone: "text-emerald-600 dark:text-emerald-400" }
      : pct <= 50
        ? { label: "Watch", tone: "text-warning" }
        : { label: "Risky", tone: "text-destructive" };
  const payDown = Math.max(0, outstanding - limit * 0.3);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold tracking-tight">Utilisation checker</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        CIBIL rewards keeping reported balances under 30% of your total limit.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          id="ut-limit"
          label="Total credit limit"
          value={limit}
          onChange={setLimit}
          step="5000"
        />
        <Field
          id="ut-out"
          label="Current outstanding"
          value={outstanding}
          onChange={setOutstanding}
          step="1000"
        />
      </div>
      <div aria-live="polite" className="mt-4 space-y-2 rounded-xl bg-surface p-4 text-sm">
        <p className="font-display text-2xl font-bold tabular-nums">{pct.toFixed(1)}%</p>
        <p className={cn("font-medium", band.tone)}>{band.label} utilisation</p>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={cn(
              "h-full rounded-full",
              pct <= 30 ? "bg-emerald-500" : pct <= 50 ? "bg-warning" : "bg-destructive",
            )}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-muted-foreground">
          {payDown > 0
            ? `Pay down ${formatINR(Math.round(payDown))} before your statement date to report under 30%.`
            : "You are already reporting in the healthy band."}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn("tabular-nums", strong ? "font-display text-lg font-bold" : "font-medium")}
      >
        {value}
      </span>
    </div>
  );
}
