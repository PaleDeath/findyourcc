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

const INCOME_STEPS = [
  10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000,
  250000, 300000, 400000, 500000, 750000, 1000000,
];

function nearestIndex(list: number[], value: number): number {
  let bestIdx = 0;
  let bestDiff = Infinity;
  list.forEach((v, i) => {
    const diff = Math.abs(v - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  });
  return bestIdx;
}

const EMPLOYMENT_TYPES: EmploymentType[] = ["Salaried", "Self-employed", "Student", "NRI"];

export function StepIncome({ answers, patch }: StepProps) {
  const idx = nearestIndex(INCOME_STEPS, answers.monthlyIncome);
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="income-slider" className="text-sm font-medium">
            Monthly income
          </label>
          <span className="text-2xl font-bold text-primary">
            {formatCompactINR(answers.monthlyIncome)}
          </span>
        </div>
        <Slider
          id="income-slider"
          min={0}
          max={INCOME_STEPS.length - 1}
          step={1}
          value={[idx]}
          onValueChange={([v]) => {
            const next = INCOME_STEPS[v ?? 0] ?? INCOME_STEPS[0];
            if (next !== undefined) patch({ monthlyIncome: next });
          }}
          aria-label="Monthly income"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹10K</span>
          <span>₹10L+</span>
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
      <p className="text-sm font-medium">What's your credit score band?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SCORE_BANDS.map((band) => (
          <button
            key={band.value}
            type="button"
            onClick={() => patch({ scoreBand: band.value })}
            aria-pressed={answers.scoreBand === band.value}
            className={cn(
              "rounded-xl border border-border bg-card px-4 py-4 text-left text-sm font-medium transition-colors hover:border-primary/50",
              answers.scoreBand === band.value && "border-primary bg-primary/10 text-primary",
            )}
          >
            {band.label}
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
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <label htmlFor={`spend-${cat.key}`} className="text-sm font-medium">
                    {cat.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{cat.hint}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold">{formatINR(value)}</span>
              </div>
              <Slider
                id={`spend-${cat.key}`}
                min={0}
                max={cat.max}
                step={500}
                value={[value]}
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
