import { Check, X } from "lucide-react";
import {
  CATEGORIES,
  MAX_FEE_SLIDER,
  NETWORKS,
  SEGMENTS,
  type CardFilters,
  listCoBrandPartners,
  listIssuers,
} from "@/data/cards";
import type { Category, CreditCard, Network, Segment } from "@/data/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatCompactINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const SCORE_BANDS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "600+", value: 600 },
  { label: "650+", value: 650 },
  { label: "700+", value: 700 },
  { label: "750+", value: 750 },
  { label: "800+", value: 800 },
];

const INCOME_BANDS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "₹25k", value: 25000 },
  { label: "₹50k", value: 50000 },
  { label: "₹75k", value: 75000 },
  { label: "₹1L", value: 100000 },
  { label: "₹1.5L", value: 150000 },
  { label: "₹2.5L+", value: 250000 },
];

interface FilterPanelProps {
  cards: CreditCard[];
  filters: CardFilters;
  onChange: (patch: Partial<CardFilters>) => void;
  onReset: () => void;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {active && <Check className="size-3" aria-hidden="true" />}
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      <div role="group" aria-label={title}>
        {children}
      </div>
    </fieldset>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({ cards, filters, onChange, onReset }: FilterPanelProps) {
  const issuers = listIssuers(cards);
  const partners = listCoBrandPartners(cards);
  const feeValue = filters.maxAnnualFee ?? MAX_FEE_SLIDER;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 min-w-11 rounded-md px-2 text-xs font-medium text-primary hover:underline focus-visible:outline-none"
          aria-label="Reset all filters"
        >
          Reset all
        </button>
      </div>

      <Section title="Segment">
        <div className="flex flex-wrap gap-1.5">
          {SEGMENTS.map((segment: Segment) => (
            <Chip
              key={segment}
              label={segment}
              active={filters.segments.includes(segment)}
              onClick={() => onChange({ segments: toggle(filters.segments, segment) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Category">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((category: Category) => (
            <Chip
              key={category}
              label={category}
              active={filters.categories.includes(category)}
              onClick={() => onChange({ categories: toggle(filters.categories, category) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Network">
        <div className="flex flex-wrap gap-1.5">
          {NETWORKS.map((network: Network) => (
            <Chip
              key={network}
              label={network}
              active={filters.networks.includes(network)}
              onClick={() => onChange({ networks: toggle(filters.networks, network) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Annual fee">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Up to</span>
            <span className="font-semibold tabular-nums">
              {filters.maxAnnualFee === null ? "Any fee" : formatCompactINR(filters.maxAnnualFee)}
            </span>
          </div>
          <Slider
            value={[feeValue]}
            min={0}
            max={MAX_FEE_SLIDER}
            step={500}
            aria-label="Maximum annual fee"
            valueText={[feeValue >= MAX_FEE_SLIDER ? "Any fee" : formatCompactINR(feeValue)]}
            onValueChange={(v) => {
              const next = v[0] ?? MAX_FEE_SLIDER;
              onChange({ maxAnnualFee: next >= MAX_FEE_SLIDER ? null : next });
            }}
          />
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="Any fee"
              active={filters.maxAnnualFee === null}
              onClick={() => onChange({ maxAnnualFee: null })}
            />
            <Chip
              label="Free"
              active={filters.maxAnnualFee === 0}
              onClick={() => onChange({ maxAnnualFee: 0 })}
            />
            <Chip
              label="≤ ₹2,500"
              active={filters.maxAnnualFee === 2500}
              onClick={() => onChange({ maxAnnualFee: 2500 })}
            />
            <Chip
              label="≤ ₹10,000"
              active={filters.maxAnnualFee === 10000}
              onClick={() => onChange({ maxAnnualFee: 10000 })}
            />
          </div>
        </div>
      </Section>

      <Section title="Your monthly income">
        <div className="flex flex-wrap gap-1.5">
          {INCOME_BANDS.map((band) => (
            <Chip
              key={band.label}
              label={band.label}
              active={filters.monthlyIncome === band.value}
              onClick={() => onChange({ monthlyIncome: band.value })}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <span className="font-semibold text-muted-foreground">₹</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Exact amount"
              value={filters.monthlyIncome ? filters.monthlyIncome.toLocaleString("en-IN") : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                onChange({ monthlyIncome: raw ? parseInt(raw, 10) : null });
              }}
              className="w-full bg-transparent font-medium text-foreground focus:outline-none"
              aria-label="Enter exact monthly income in rupees"
            />
            <span className="text-muted-foreground">/mo</span>
          </div>
          {filters.monthlyIncome !== null && (
            <button
              type="button"
              onClick={() => onChange({ monthlyIncome: null })}
              className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Clear income filter"
              aria-label="Clear income filter"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="pt-0.5 text-[11px] text-muted-foreground">
          Shows only cards whose published income threshold you clear.
        </p>
      </Section>

      <Section title="Your credit score">
        <div className="flex flex-wrap gap-1.5">
          {SCORE_BANDS.map((band) => (
            <Chip
              key={band.label}
              label={band.label}
              active={filters.creditScore === band.value}
              onClick={() => onChange({ creditScore: band.value })}
            />
          ))}
        </div>
      </Section>

      {partners.length > 0 && (
        <Section title="Co-brand partner">
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {partners.map((partner) => (
              <Chip
                key={partner}
                label={partner}
                active={filters.coBrandPartners.includes(partner)}
                onClick={() =>
                  onChange({ coBrandPartners: toggle(filters.coBrandPartners, partner) })
                }
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Issuer">
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {issuers.map((issuer) => (
            <label
              key={issuer.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/60"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-[hsl(var(--primary))]"
                  checked={filters.issuerIds.includes(issuer.id)}
                  onChange={() => onChange({ issuerIds: toggle(filters.issuerIds, issuer.id) })}
                />
                {issuer.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">{issuer.count}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Quick toggles">
        <div className="space-y-3">
          {[
            { id: "ltf", label: "Lifetime free only", key: "lifetimeFreeOnly" as const },
            { id: "lounge", label: "Airport lounge access", key: "loungeOnly" as const },
            { id: "upi", label: "RuPay · UPI linkable", key: "rupayUpiOnly" as const },
            { id: "forex", label: "Low forex markup (≤2%)", key: "lowForexOnly" as const },
            { id: "self", label: "Self-employed eligible", key: "selfEmployedOnly" as const },
            { id: "fd", label: "Secured / FD-backed", key: "fdBackedOnly" as const },
            { id: "archived", label: "Include discontinued", key: "includeArchived" as const },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3">
              <Label htmlFor={row.id} className="text-sm font-normal">
                {row.label}
              </Label>
              <Switch
                id={row.id}
                checked={filters[row.key]}
                onCheckedChange={(checked) =>
                  onChange({ [row.key]: checked } as Partial<CardFilters>)
                }
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
