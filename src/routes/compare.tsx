import { canonical } from "@/lib/seo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Download, Plus, Printer, Scale, X } from "lucide-react";
import { toast } from "sonner";

import { CardArt } from "@/components/CardArt";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Disclaimer } from "@/components/Disclaimer";
import {
  ALL_CARDS,
  bestAcceleratedRate,
  computeEffectiveRate,
  getCardById,
  popularityScore,
} from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { useCompareTray, useDataset, MAX_COMPARE } from "@/lib/card-store";
import { formatFee, formatINR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CompareSearch {
  cards?: string;
}

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>): CompareSearch =>
    typeof search["cards"] === "string" ? { cards: search["cards"] } : {},
  head: () => ({
    links: canonical("/compare"),
    meta: [
      { title: "Compare credit cards side by side — FindYourCC" },
      {
        name: "description",
        content:
          "Line up up to four Indian credit cards side by side on fees, rewards, lounge access, insurance, eligibility and exclusions.",
      },
      { property: "og:title", content: "Compare credit cards — FindYourCC" },
      {
        property: "og:description",
        content: "A detailed, highlighted side-by-side comparison of Indian credit cards.",
      },
    ],
  }),
  component: ComparePage,
});

type Direction = "higher-better" | "lower-better" | "none";

interface Row {
  label: string;
  render: (card: CreditCard) => ReactNode;
  /** Raw numeric value used for highlighting; undefined = not comparable. */
  value?: (card: CreditCard) => number | undefined;
  direction: Direction;
  /** Plain-text form of the rendered value, used for the "differences only" check. */
  text: (card: CreditCard) => string;
}

interface Section {
  title: string;
  rows: Row[];
}

function yesNo(v: boolean | undefined): string {
  return v ? "Yes" : "No";
}

function listOrDash(list: string[] | undefined): string {
  return list && list.length > 0 ? list.join(", ") : "—";
}

const SECTIONS: Section[] = [
  {
    title: "Fees",
    rows: [
      {
        label: "Joining fee",
        render: (c) => formatFee(c.fees.joiningFee),
        value: (c) => c.fees.joiningFee,
        direction: "lower-better",
        text: (c) => formatFee(c.fees.joiningFee),
      },
      {
        label: "Annual fee",
        render: (c) => (c.fees.lifetimeFree ? "Lifetime free" : formatFee(c.fees.annualFee)),
        value: (c) => c.fees.annualFee,
        direction: "lower-better",
        text: (c) => (c.fees.lifetimeFree ? "Lifetime free" : formatFee(c.fees.annualFee)),
      },
      {
        label: "Lifetime free",
        render: (c) => yesNo(c.fees.lifetimeFree),
        direction: "none",
        text: (c) => yesNo(c.fees.lifetimeFree),
      },
      {
        label: "Fee waiver spend",
        render: (c) => (c.fees.feeWaiverSpend ? formatINR(c.fees.feeWaiverSpend) : "—"),
        value: (c) => c.fees.feeWaiverSpend,
        direction: "lower-better",
        text: (c) => (c.fees.feeWaiverSpend ? formatINR(c.fees.feeWaiverSpend) : "—"),
      },
      {
        label: "Forex markup",
        render: (c) => formatPct(c.fees.forexMarkupPct),
        value: (c) => c.fees.forexMarkupPct,
        direction: "lower-better",
        text: (c) => formatPct(c.fees.forexMarkupPct),
      },
      {
        label: "APR range (monthly)",
        render: (c) =>
          `${formatPct(c.fees.apr.minMonthlyPct)} – ${formatPct(c.fees.apr.maxMonthlyPct)}`,
        value: (c) => c.fees.apr.minMonthlyPct,
        direction: "lower-better",
        text: (c) =>
          `${formatPct(c.fees.apr.minMonthlyPct)} – ${formatPct(c.fees.apr.maxMonthlyPct)}`,
      },
      {
        label: "Add-on card fee",
        render: (c) => (c.fees.addOnCardFee !== undefined ? formatFee(c.fees.addOnCardFee) : "—"),
        value: (c) => c.fees.addOnCardFee,
        direction: "lower-better",
        text: (c) => (c.fees.addOnCardFee !== undefined ? formatFee(c.fees.addOnCardFee) : "—"),
      },
    ],
  },
  {
    title: "Rewards",
    rows: [
      {
        label: "Base earn rate",
        render: (c) => formatPct(computeEffectiveRate(c)),
        value: (c) => computeEffectiveRate(c),
        direction: "higher-better",
        text: (c) => formatPct(computeEffectiveRate(c)),
      },
      {
        label: "Best accelerated rate",
        render: (c) => formatPct(bestAcceleratedRate(c)),
        value: (c) => bestAcceleratedRate(c),
        direction: "higher-better",
        text: (c) => formatPct(bestAcceleratedRate(c)),
      },
      {
        label: "Point value",
        render: (c) => `₹${c.rewards.pointValueInRupees}`,
        value: (c) => c.rewards.pointValueInRupees,
        direction: "higher-better",
        text: (c) => `₹${c.rewards.pointValueInRupees}`,
      },
      {
        label: "Redemption modes",
        render: (c) => listOrDash(c.rewards.redemptionModes),
        direction: "none",
        text: (c) => listOrDash(c.rewards.redemptionModes),
      },
      {
        label: "Milestones",
        render: (c) =>
          c.rewards.milestones.length > 0
            ? `${c.rewards.milestones.length} milestone${c.rewards.milestones.length === 1 ? "" : "s"}`
            : "None",
        value: (c) => c.rewards.milestones.length,
        direction: "higher-better",
        text: (c) => `${c.rewards.milestones.length}`,
      },
      {
        label: "Points expiry",
        render: (c) => c.rewards.pointsExpiry ?? "—",
        direction: "none",
        text: (c) => c.rewards.pointsExpiry ?? "—",
      },
    ],
  },
  {
    title: "Lounge",
    rows: [
      {
        label: "Domestic visits / yr",
        render: (c) => {
          const d = c.benefits.loungeDomestic;
          if (!d) return "—";
          if (d.unlimited || (d.visitsPerYear && d.visitsPerYear >= 999)) return "Unlimited";
          const visits =
            d.visitsPerYear ?? (d.visitsPerQuarter ? d.visitsPerQuarter * 4 : undefined);
          return visits === undefined ? "—" : String(visits);
        },
        value: (c) => {
          const d = c.benefits.loungeDomestic;
          if (!d) return undefined;
          if (d.unlimited || (d.visitsPerYear && d.visitsPerYear >= 999)) return 50;
          return d.visitsPerYear ?? (d.visitsPerQuarter ? d.visitsPerQuarter * 4 : undefined);
        },
        direction: "higher-better",
        text: (c) => {
          const d = c.benefits.loungeDomestic;
          if (!d) return "—";
          if (d.unlimited || (d.visitsPerYear && d.visitsPerYear >= 999)) return "Unlimited";
          const visits =
            d.visitsPerYear ?? (d.visitsPerQuarter ? d.visitsPerQuarter * 4 : undefined);
          return visits === undefined ? "—" : String(visits);
        },
      },
      {
        label: "International visits / yr",
        render: (c) => {
          const i = c.benefits.loungeInternational;
          if (!i) return "—";
          if (i.unlimited || (i.visitsPerYear && i.visitsPerYear >= 999)) return "Unlimited";
          return i.visitsPerYear === undefined ? "—" : String(i.visitsPerYear);
        },
        value: (c) => {
          const i = c.benefits.loungeInternational;
          if (!i) return undefined;
          if (i.unlimited || (i.visitsPerYear && i.visitsPerYear >= 999)) return 50;
          return i.visitsPerYear;
        },
        direction: "higher-better",
        text: (c) => {
          const i = c.benefits.loungeInternational;
          if (!i) return "—";
          if (i.unlimited || (i.visitsPerYear && i.visitsPerYear >= 999)) return "Unlimited";
          return i.visitsPerYear === undefined ? "—" : String(i.visitsPerYear);
        },
      },
      {
        label: "Lounge program",
        render: (c) =>
          c.benefits.loungeInternational?.program ?? c.benefits.loungeDomestic?.program ?? "—",
        direction: "none",
        text: (c) =>
          c.benefits.loungeInternational?.program ?? c.benefits.loungeDomestic?.program ?? "—",
      },
      {
        label: "Golf",
        render: (c) => c.benefits.golf ?? "—",
        direction: "none",
        text: (c) => c.benefits.golf ?? "—",
      },
    ],
  },
  {
    title: "Insurance",
    rows: [
      {
        label: "Insurance cover",
        render: (c) =>
          c.benefits.insurance && c.benefits.insurance.length > 0
            ? c.benefits.insurance.map((i) => `${i.type}: ${formatINR(i.cover)}`).join(", ")
            : "—",
        value: (c) => c.benefits.insurance?.reduce((sum, i) => sum + i.cover, 0),
        direction: "higher-better",
        text: (c) =>
          c.benefits.insurance && c.benefits.insurance.length > 0
            ? c.benefits.insurance.map((i) => `${i.type}: ${formatINR(i.cover)}`).join(", ")
            : "—",
      },
      {
        label: "Concierge",
        render: (c) => yesNo(c.benefits.concierge),
        direction: "none",
        text: (c) => yesNo(c.benefits.concierge),
      },
      {
        label: "Memberships",
        render: (c) => listOrDash(c.benefits.memberships),
        direction: "none",
        text: (c) => listOrDash(c.benefits.memberships),
      },
    ],
  },
  {
    title: "Eligibility",
    rows: [
      {
        label: "Min age",
        render: (c) => `${c.eligibility.minAge} yrs`,
        value: (c) => c.eligibility.minAge,
        direction: "lower-better",
        text: (c) => `${c.eligibility.minAge} yrs`,
      },
      {
        label: "Min monthly income",
        render: (c) =>
          c.eligibility.minMonthlyIncomeSalaried !== undefined
            ? formatINR(c.eligibility.minMonthlyIncomeSalaried)
            : "—",
        value: (c) => c.eligibility.minMonthlyIncomeSalaried,
        direction: "lower-better",
        text: (c) =>
          c.eligibility.minMonthlyIncomeSalaried !== undefined
            ? formatINR(c.eligibility.minMonthlyIncomeSalaried)
            : "—",
      },
      {
        label: "Min credit score",
        render: (c) => String(c.eligibility.minCreditScore),
        value: (c) => c.eligibility.minCreditScore,
        direction: "lower-better",
        text: (c) => String(c.eligibility.minCreditScore),
      },
      {
        label: "Employment types",
        render: (c) => listOrDash(c.eligibility.employmentTypes),
        direction: "none",
        text: (c) => listOrDash(c.eligibility.employmentTypes),
      },
      {
        label: "FD-backed",
        render: (c) => yesNo(c.eligibility.fdBacked),
        direction: "none",
        text: (c) => yesNo(c.eligibility.fdBacked),
      },
      {
        label: "City availability",
        render: (c) => c.eligibility.cityAvailability,
        direction: "none",
        text: (c) => c.eligibility.cityAvailability,
      },
    ],
  },
  {
    title: "Exclusions",
    rows: [
      {
        label: "Earning exclusions",
        render: (c) => listOrDash(c.rewards.earningExclusions),
        direction: "none",
        text: (c) => listOrDash(c.rewards.earningExclusions),
      },
      {
        label: "Watch-outs",
        render: (c) => listOrDash(c.watchOuts),
        direction: "none",
        text: (c) => listOrDash(c.watchOuts),
      },
    ],
  },
];

function highlightFor(row: Row, cards: CreditCard[]): Map<string, "best" | "worst"> {
  const map = new Map<string, "best" | "worst">();
  if (row.direction === "none" || !row.value || cards.length < 2) return map;
  const values = cards
    .map((c) => ({ id: c.id, v: row.value?.(c) }))
    .filter((x): x is { id: string; v: number } => typeof x.v === "number" && Number.isFinite(x.v));
  if (values.length < 2) return map;
  const allEqual = values.every((x) => x.v === values[0]?.v);
  if (allEqual) return map;
  const best =
    row.direction === "higher-better"
      ? Math.max(...values.map((v) => v.v))
      : Math.min(...values.map((v) => v.v));
  const worst =
    row.direction === "higher-better"
      ? Math.min(...values.map((v) => v.v))
      : Math.max(...values.map((v) => v.v));
  for (const { id, v } of values) {
    if (v === best) map.set(id, "best");
    else if (v === worst) map.set(id, "worst");
  }
  return map;
}

const POPULAR_PICKS = [...ALL_CARDS]
  .filter((c) => c.status === "Active")
  .sort((a, b) => popularityScore(b) - popularityScore(a))
  .slice(0, 8);

function ComparePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/compare" });
  const { ids: trayIds, toggle, hydrated } = useCompareTray();
  const { cards: dataset } = useDataset();
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const initializedFromUrl = useRef(false);

  const urlIds = useMemo(
    () => (search.cards ? search.cards.split(",").filter(Boolean).slice(0, MAX_COMPARE) : null),
    [search.cards],
  );

  const [ids, setIds] = useState<string[]>(() => urlIds ?? []);

  // On first hydration, prefer URL ids; otherwise fall back to the tray.
  useEffect(() => {
    if (initializedFromUrl.current || !hydrated) return;
    initializedFromUrl.current = true;
    if (urlIds && urlIds.length > 0) {
      setIds(urlIds);
    } else {
      setIds(trayIds.slice(0, MAX_COMPARE));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Keep URL in sync with the tray once initialized (only when no explicit URL override differs).
  useEffect(() => {
    if (!initializedFromUrl.current) return;
    const next = ids.length > 0 ? ids.join(",") : undefined;
    if (next !== search.cards) {
      navigate({ search: next ? { cards: next } : {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const cards = ids
    .map((id) => getCardById(dataset, id))
    .filter((c): c is CreditCard => Boolean(c));

  const removeCard = (id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
    if (trayIds.includes(id)) toggle(id);
  };

  const addCard = (id: string) => {
    setIds((prev) => (prev.includes(id) || prev.length >= MAX_COMPARE ? prev : [...prev, id]));
  };

  const rows = useMemo(() => {
    if (cards.length < 2) return SECTIONS;
    if (!differencesOnly) return SECTIONS;
    return SECTIONS.map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        const texts = cards.map((c) => row.text(c));
        return !texts.every((t) => t === texts[0]);
      }),
    })).filter((section) => section.rows.length > 0);
  }, [cards, differencesOnly]);

  const handleExportImage = async () => {
    if (!tableWrapRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(tableWrapRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "findyourcc-comparison.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Comparison image downloaded");
    } catch {
      toast.error("Couldn't export the comparison image. Try again.");
    }
  };

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Scale className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Nothing to compare yet</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add up to {MAX_COMPARE} cards from Explore to see fees, rewards, lounge access and
            eligibility lined up side by side.
          </p>
          <div className="mt-5 flex justify-center">
            <Button asChild>
              <Link to="/explore">Browse cards</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Or quick-add a popular card
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR_PICKS.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => addCard(card.id)}
                  className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:border-primary/50"
                >
                  <CardArt art={card.art} name={card.name} issuer={card.issuer} size="sm" />
                  <span className="truncate text-xs font-medium">{card.name}</span>
                  <span className="inline-flex items-center gap-1 text-[0.7rem] text-primary">
                    <Plus className="size-3" aria-hidden="true" /> Add
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compare cards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cards.length} of {MAX_COMPARE} cards selected.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
            <Switch id="diff-only" checked={differencesOnly} onCheckedChange={setDifferencesOnly} />
            <Label htmlFor="diff-only" className="text-xs font-medium">
              Differences only
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportImage}>
            <Download className="size-4" aria-hidden="true" /> Export PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" /> Print / PDF
          </Button>
          {cards.length < MAX_COMPARE && (
            <Button asChild size="sm">
              <Link to="/explore">
                <Plus className="size-4" aria-hidden="true" /> Add card
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div
        ref={tableWrapRef}
        className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card"
      >
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-36 min-w-36 border-b border-border bg-card p-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Card
              </th>
              {cards.map((card) => (
                <th
                  key={card.id}
                  scope="col"
                  className="min-w-[10.5rem] border-b border-border p-3 align-bottom text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-24">
                      <CardArt art={card.art} name={card.name} issuer={card.issuer} size="sm" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      aria-label={`Remove ${card.name} from comparison`}
                      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground print:hidden"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {card.issuer}
                  </p>
                  <Link
                    to="/card/$id"
                    params={{ id: card.id }}
                    className="mt-0.5 block text-sm font-semibold leading-snug hover:text-primary"
                  >
                    {card.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((section) => (
              <Fragment key={section.title}>
                <tr key={`${section.title}-heading`}>
                  <th
                    scope="colgroup"
                    colSpan={cards.length + 1}
                    className="sticky left-0 z-10 border-b border-border bg-surface p-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {section.title}
                  </th>
                </tr>
                {section.rows.map((row) => {
                  const highlights = highlightFor(row, cards);
                  return (
                    <tr
                      key={`${section.title}-${row.label}`}
                      className="border-b border-border last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 w-36 min-w-36 bg-card p-3 text-left text-xs font-medium text-muted-foreground"
                      >
                        {row.label}
                      </th>
                      {cards.map((card) => {
                        const kind = highlights.get(card.id);
                        return (
                          <td
                            key={card.id}
                            className={cn(
                              "min-w-[10.5rem] p-3 align-top text-sm",
                              kind === "best" &&
                                "text-emerald-600 dark:text-emerald-400 font-semibold",
                              kind === "worst" && "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {row.render(card)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Disclaimer className="mt-8" />
    </div>
  );
}
