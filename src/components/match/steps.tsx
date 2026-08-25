import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { CreditCard } from "@/data/types";
import { formatCompactINR, formatINR } from "@/lib/format";
import {
  BRANDS,
  GOALS,
  SCORE_BANDS,
  SPEND_CATEGORIES,
  monthlyTotal,
  type Brand,
  type EmploymentType,
  type Goal,
  type MatchAnswers,
  type ScoreBand,
  type SpendProfile,
} from "@/lib/spend-profile";
import { cn } from "@/lib/utils";

export interface StepProps {
  answers: MatchAnswers;
  patch: (next: Partial<MatchAnswers>) => void;
}

const INCOME_PRESETS = [
  { label: "₹25k", value: 25000 },
  { label: "₹50k", value: 50000 },
  { label: "₹75k", value: 75000 },
  { label: "₹1L", value: 100000 },
  { label: "₹1.5L", value: 150000 },
  { label: "₹2.5L", value: 250000 },
  { label: "₹5L+", value: 500000 },
];

const EMPLOYMENT_TYPES: EmploymentType[] = ["Salaried", "Self-employed", "Student", "NRI"];

export function StepIncome({ answers, patch }: StepProps) {
  const currentIncome = answers.monthlyIncome || 0;
  const annual = currentIncome * 12;
  const maxRange = Math.max(500000, Math.ceil((currentIncome || 75000) / 100000) * 100000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const val = raw ? Math.max(0, parseInt(raw, 10)) : 0;
    patch({ monthlyIncome: val });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label htmlFor="exact-income-input" className="text-sm font-semibold text-foreground">
              Monthly in-hand / gross income
            </label>
            <p className="text-xs text-muted-foreground">
              Used to filter eligibility and calculate realistic card values
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="font-semibold text-muted-foreground">₹</span>
            <input
              id="exact-income-input"
              type="text"
              inputMode="numeric"
              value={currentIncome ? currentIncome.toLocaleString("en-IN") : ""}
              placeholder="0"
              onChange={handleInputChange}
              className="w-32 bg-transparent text-right font-display text-lg font-bold text-foreground focus:outline-none"
              aria-label="Enter exact monthly income in rupees"
            />
            <span className="text-xs text-muted-foreground font-medium">/ mo</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Slider
            id="income-slider"
            min={10000}
            max={maxRange}
            step={2500}
            value={[Math.min(maxRange, Math.max(10000, currentIncome))]}
            onValueChange={([v]) => {
              if (v !== undefined) patch({ monthlyIncome: v });
            }}
            aria-label="Monthly income slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>₹10,000</span>
            <span className="text-primary font-medium">
              {annual >= 100000
                ? `≈ ₹${(annual / 100000).toFixed(annual % 100000 === 0 ? 0 : 1)} Lakhs / year`
                : `≈ ₹${annual.toLocaleString("en-IN")} / year`}
            </span>
            <span>₹{(maxRange / 100000).toFixed(0)}L+</span>
          </div>
        </div>

        <div className="pt-1">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {INCOME_PRESETS.map((preset) => {
              const active = currentIncome === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => patch({ monthlyIncome: preset.value })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs scale-105"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Employment type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EMPLOYMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => patch({ employment: type })}
              aria-pressed={answers.employment === type}
              className={cn(
                "rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:border-primary/50",
                answers.employment === type && "border-primary bg-primary/10 text-primary",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepScore({ answers, patch }: StepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">What is your approximate CIBIL / credit score?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SCORE_BANDS.map((band) => (
          <button
            key={band.value}
            type="button"
            onClick={() => patch({ scoreBand: band.value })}
            aria-pressed={answers.scoreBand === band.value}
            className={cn(
              "flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/50",
              answers.scoreBand === band.value && "border-primary bg-primary/10",
            )}
          >
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  answers.scoreBand === band.value && "text-primary",
                )}
              >
                {band.label}
              </p>
              <p className="text-xs text-muted-foreground">{band.hint}</p>
            </div>
            <Badge variant={answers.scoreBand === band.value ? "default" : "secondary"}>
              {band.approx === 0 ? "No score" : `${band.approx}+`}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepGoal({ answers, patch }: StepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">What's your primary goal for a new card?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => patch({ goal: goal.value })}
            aria-pressed={answers.goal === goal.value}
            className={cn(
              "flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/50",
              answers.goal === goal.value && "border-primary bg-primary/10",
            )}
          >
            <span
              className={cn("text-sm font-semibold", answers.goal === goal.value && "text-primary")}
            >
              {goal.label}
            </span>
            <span className="text-xs text-muted-foreground">{goal.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface StepSpendProps extends StepProps {
  onSpendChange: (spend: SpendProfile) => void;
}

export function StepSpend({ answers, patch, onSpendChange }: StepSpendProps) {
  const total = monthlyTotal(answers.spend);

  const setCategory = (key: keyof SpendProfile, value: number) => {
    const nextSpend = { ...answers.spend, [key]: value };
    patch({ spend: nextSpend });
    onSpendChange(nextSpend);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <span className="text-sm font-medium">Total monthly spend</span>
        <span className="text-xl font-bold text-primary">{formatINR(total)}</span>
      </div>
      <div className="space-y-5">
        {SPEND_CATEGORIES.map((cat) => {
          const value = answers.spend[cat.key] ?? 0;
          return (
            <div key={cat.key} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label htmlFor={`spend-${cat.key}`} className="text-sm font-medium">
                    {cat.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{cat.hint}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                  <span className="text-xs font-semibold text-muted-foreground">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value ? value.toLocaleString("en-IN") : "0"}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const val = raw ? parseInt(raw, 10) : 0;
                      setCategory(cat.key, Math.min(cat.max * 2, val));
                    }}
                    className="w-20 bg-transparent text-right font-mono text-xs font-semibold text-foreground focus:outline-none"
                    aria-label={`${cat.label} spend amount in rupees`}
                  />
                </div>
              </div>
              <Slider
                id={`spend-${cat.key}`}
                min={0}
                max={cat.max}
                step={500}
                value={[Math.min(cat.max, value)]}
                onValueChange={([v]) => setCategory(cat.key, v ?? 0)}
                aria-label={cat.label}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepBrands({ answers, patch }: StepProps) {
  const toggle = (brand: Brand) => {
    const has = answers.brands.includes(brand);
    patch({ brands: has ? answers.brands.filter((b) => b !== brand) : [...answers.brands, brand] });
  };
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Which brands do you already shop with a lot?</p>
      <p className="text-xs text-muted-foreground">Select as many as apply — optional.</p>
      <div className="flex flex-wrap gap-2">
        {BRANDS.map((brand) => {
          const active = answers.brands.includes(brand);
          return (
            <button
              key={brand}
              type="button"
              onClick={() => toggle(brand)}
              aria-pressed={active}
              className={cn(
                "rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/50",
                active && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {brand}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepTravel({ answers, patch }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="travel-slider" className="text-sm font-medium">
            Trips per year
          </label>
          <span className="text-2xl font-bold text-primary">{answers.travelPerYear}</span>
        </div>
        <Slider
          id="travel-slider"
          min={0}
          max={30}
          step={1}
          value={[answers.travelPerYear]}
          onValueChange={([v]) => patch({ travelPerYear: v ?? 0 })}
          aria-label="Trips per year"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Rarely fly</span>
          <span>30+ trips</span>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4">
        <div>
          <p className="text-sm font-medium">Include international travel</p>
          <p className="text-xs text-muted-foreground">
            Toggle on if some of those trips leave India
          </p>
        </div>
        <Switch
          checked={answers.international}
          onCheckedChange={(checked) => patch({ international: checked })}
          aria-label="Include international travel"
        />
      </div>
    </div>
  );
}

export function StepFee({ answers, patch }: StepProps) {
  const label =
    answers.feeTolerance <= 0
      ? "Nil — only free cards"
      : answers.feeTolerance >= 15000
        ? "Any fee is fine"
        : formatINR(answers.feeTolerance);
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor="fee-slider" className="text-sm font-medium">
          Annual fee you're comfortable with
        </label>
        <span className="text-2xl font-bold text-primary">{label}</span>
      </div>
      <Slider
        id="fee-slider"
        min={0}
        max={15000}
        step={500}
        value={[answers.feeTolerance]}
        onValueChange={([v]) => patch({ feeTolerance: v ?? 0 })}
        aria-label="Annual fee tolerance"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Nil</span>
        <span>Any fee</span>
      </div>
    </div>
  );
}

interface StepExistingProps extends StepProps {
  cards: CreditCard[];
}

export function StepExisting({ answers, patch, cards }: StepExistingProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useMemo(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    return cards
      .filter(
        (c) =>
          !answers.existingCardIds.includes(c.id) &&
          (c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [cards, debounced, answers.existingCardIds]);

  const add = (id: string) => {
    patch({ existingCardIds: [...answers.existingCardIds, id] });
    setQuery("");
  };
  const remove = (id: string) =>
    patch({ existingCardIds: answers.existingCardIds.filter((c) => c !== id) });

  const selectedCards = answers.existingCardIds
    .map((id) => cards.find((c) => c.id === id))
    .filter((c): c is CreditCard => Boolean(c));

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Do you already hold any cards? Search to add them.</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by card name or bank…"
          className="pl-9"
          aria-label="Search existing cards"
        />
      </div>
      {results.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => add(c.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <span>
                  <span className="font-medium">{c.name}</span>{" "}
                  <span className="text-muted-foreground">— {c.issuer}</span>
                </span>
                <span className="text-xs text-primary">Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedCards.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCards.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-2">
              {c.name}
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Remove ${c.name}`}
                className="rounded-full p-0.5 hover:bg-background/60"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {selectedCards.length === 0 && !query && (
        <p className="text-xs text-muted-foreground">
          No cards added — skip this if it's your first card.
        </p>
      )}
    </div>
  );
}
