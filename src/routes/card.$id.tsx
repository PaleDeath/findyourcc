import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Heart,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Disclaimer } from "@/components/Disclaimer";
import { ReportDataButton } from "@/components/ReportDataButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALL_CARDS,
  comparedWithCards,
  computeEffectiveRate,
  getCardById,
  similarCards,
} from "@/data/cards";
import type { CreditCard } from "@/data/types";
import { jsonLdScript, absoluteUrl, canonical } from "@/lib/seo";
import { formatCompactINR, formatDate, formatFee, formatINR, formatPct } from "@/lib/format";
import { useCompareTray, useDataset, useFavourites, useSpendProfile } from "@/lib/card-store";
import { valueCard } from "@/lib/rewardEngine";
import { monthlyTotal } from "@/lib/spend-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/card/$id")({
  // Resolve on the server so an unknown id is a real 404, not a 200 with an
  // empty shell, and so the page HTML is complete before hydration.
  loader: ({ params }) => {
    if (!getCardById(ALL_CARDS, params.id)) throw notFound();
    return { id: params.id };
  },
  head: ({ params }) => {
    const card = getCardById(ALL_CARDS, params.id);
    const name = card ? `${card.name} (${card.issuer})` : params.id.replace(/-/g, " ");

    const title = `${name} — fees, rewards & fine print | FindYourCC`.slice(0, 65);
    const description = card
      ? `${card.name}: ${card.fees.lifetimeFree ? "lifetime free" : `₹${card.fees.annualFee} annual fee`}, ${computeEffectiveRate(card).toFixed(2)}% base earn, ${card.rewards.earningExclusions.length} earning exclusions and the watch-outs before you apply.`.slice(
          0,
          158,
        )
      : "Full breakdown of this Indian credit card: fees, effective reward rate, exclusions, lounge access and eligibility.";
    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (!card) {
      meta.push({ name: "robots", content: "noindex, nofollow" });
      return { meta };
    }

    const path = `/card/${card.id}`;
    const url = absoluteUrl(path);
    const scripts = [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: card.name,
        url,
        category: card.segment,
        description,
        provider: { "@type": "BankOrCreditUnion", name: card.issuer },
        brand: { "@type": "Brand", name: card.issuer },
        feesAndCommissionsSpecification: card.fees.lifetimeFree
          ? "Lifetime free — no joining or annual fee"
          : `Joining fee ₹${card.fees.joiningFee}, annual fee ₹${card.fees.annualFee} plus GST`,
        annualPercentageRate: Number((card.fees.apr.maxMonthlyPct * 12).toFixed(2)),
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: "Explore cards",
            item: absoluteUrl("/explore"),
          },
          { "@type": "ListItem", position: 3, name: card.name, item: url },
        ],
      }),
    ];

    return { meta, scripts, links: canonical(path) };
  },
  component: CardDetail,
});

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="card-bevel rounded-2xl border border-border/80 bg-card p-5 transition-colors sm:p-6 dark:border-white/[0.08]"
    >
      <h2 id={id} className="font-display text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0 dark:border-white/[0.06]">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ValueStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 p-3 backdrop-blur-xs dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-base font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function CardDetail() {
  const { id } = Route.useParams();
  const { cards } = useDataset();
  const favourites = useFavourites();
  const compare = useCompareTray();
  const { spend } = useSpendProfile();

  // The loader already guaranteed the bundled card exists; a user override may
  // supply its own version of the same id.
  const card = cards.find((c) => c.id === id) ?? getCardById(ALL_CARDS, id);

  const valuation = useMemo(() => (card ? valueCard(card, spend) : null), [card, spend]);
  const related = useMemo(
    () =>
      card
        ? { similar: similarCards(cards, card, 6), rivals: comparedWithCards(cards, card, 6) }
        : { similar: [], rivals: [] },
    [cards, card],
  );

  if (!card || !valuation) throw notFound();

  return (
    <div className="container-page py-8">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to explore
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CardArt
            art={card.art}
            name={card.name}
            issuer={card.issuer}
            network={card.networks[0]}
            size="lg"
            dimmed={card.status === "Discontinued"}
          />
          <div className="flex gap-2">
            <Button
              variant={favourites.ids.includes(card.id) ? "default" : "outline"}
              className="flex-1"
              onClick={() => favourites.toggle(card.id)}
              aria-pressed={favourites.ids.includes(card.id)}
            >
              <Heart className="size-4" aria-hidden="true" /> Save
            </Button>
            <Button
              variant={compare.ids.includes(card.id) ? "default" : "outline"}
              className="flex-1"
              onClick={() => compare.toggle(card.id)}
              aria-pressed={compare.ids.includes(card.id)}
            >
              <Scale className="size-4" aria-hidden="true" /> Compare
            </Button>
          </div>
          {card.applyUrl && (
            <Button asChild variant="secondary" className="w-full">
              <a href={card.applyUrl} target="_blank" rel="noopener noreferrer nofollow">
                Official issuer page <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
          )}
          <ConfidenceNote card={card} />
        </div>

        <div className="min-w-0 space-y-6">
          <header className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {card.issuer}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {card.name}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                className={cn(
                  (card.segment === "Premium" || card.segment === "Super Premium") &&
                    "bg-gold text-gold-foreground",
                )}
              >
                {card.segment}
              </Badge>
              {card.networks.map((network) => (
                <Badge key={network} variant="secondary">
                  {network}
                </Badge>
              ))}
              {card.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
              {card.status !== "Active" && (
                <Badge variant="outline" className="border-destructive/50 text-destructive">
                  {card.status}
                </Badge>
              )}
            </div>
            {card.bestFor.length > 0 && (
              <p className="text-sm text-muted-foreground">Best for: {card.bestFor.join(" · ")}</p>
            )}
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Joining fee",
                value: card.fees.lifetimeFree ? "Nil" : formatFee(card.fees.joiningFee),
              },
              {
                label: "Annual fee",
                value: card.fees.lifetimeFree ? "Lifetime free" : formatFee(card.fees.annualFee),
              },
              { label: "Base earn", value: `${computeEffectiveRate(card).toFixed(2)}%` },
              { label: "Forex markup", value: `${card.fees.forexMarkupPct}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-bevel rounded-xl border border-border/70 bg-surface/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.02]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <section
            aria-labelledby="your-value"
            className="card-bevel rounded-2xl border border-border/80 bg-card p-5 sm:p-6 dark:border-white/[0.08]"
          >
            <h2
              id="your-value"
              className="flex items-center gap-2 font-display text-lg font-bold text-foreground"
            >
              <Sparkles className="size-4 text-foreground/70" aria-hidden="true" /> What it&rsquo;s worth
              to you
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Calculated on your monthly spend profile of <span className="font-mono font-semibold text-foreground">{formatINR(monthlyTotal(spend))}</span>.{" "}
              <Link to="/calculator" className="font-semibold text-foreground hover:underline">
                Tune your spends →
              </Link>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ValueStat label="Net value / year" value={<span className="text-emerald-600 dark:text-emerald-400">+{formatINR(valuation.netAnnualValue)}</span>} />
              <ValueStat label="Gross rewards / year" value={formatINR(valuation.annualRewardValue)} />
              <ValueStat label="Effective return" value={formatPct(valuation.effectiveReturnPct)} />
              <ValueStat
                label="Effective fee"
                value={valuation.feeWaived ? "Waived" : formatFee(valuation.effectiveAnnualFee)}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {valuation.effectiveAnnualFee <= 0
                ? "No fee to earn back — every rupee of reward is net profit."
                : valuation.breakEvenMonthlySpend === null
                  ? "On this profile the annual fee never quite breaks even — the earn rate is too thin on your spend categories."
                  : `You need approximately ${formatINR(valuation.breakEvenMonthlySpend)}/month on this card to break even on the annual fee.`}
            </p>
            {valuation.excludedMonthlySpend > 0 && (
              <p className="mt-2 text-xs font-medium text-warning">
                ⚠️ {formatINR(valuation.excludedMonthlySpend)} of your monthly spend earns zero rewards on this card.
              </p>
            )}
          </section>

          {card.watchOuts.length > 0 && (
            <Section id="watchouts" title="Watch-outs">
              <ul className="space-y-2">
                {card.watchOuts.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="fees" title="Fees & charges">
            <dl>
              <Row label="Joining fee" value={formatFee(card.fees.joiningFee)} />
              <Row label="Renewal fee" value={formatFee(card.fees.annualFee)} />
              {card.fees.feeWaiverSpend !== undefined && (
                <Row
                  label="Fee waived on annual spend"
                  value={formatCompactINR(card.fees.feeWaiverSpend)}
                />
              )}
              {card.fees.addOnCardFee !== undefined && (
                <Row label="Add-on card" value={formatFee(card.fees.addOnCardFee)} />
              )}
              <Row label="Forex markup" value={`${card.fees.forexMarkupPct}%`} />
              {card.fees.cashAdvancePct !== undefined && (
                <Row label="Cash advance" value={`${card.fees.cashAdvancePct}%`} />
              )}
              <Row
                label="Interest (monthly)"
                value={`${card.fees.apr.minMonthlyPct}% – ${card.fees.apr.maxMonthlyPct}%`}
              />
              {card.fees.latePaymentSlabs && (
                <Row label="Late payment" value={card.fees.latePaymentSlabs} />
              )}
              <Row label="First year free" value={card.fees.firstYearFree ? "Yes" : "No"} />
            </dl>
          </Section>

          <Section id="rewards" title="Rewards">
            <dl>
              <Row label="Base earn" value={`${card.rewards.baseRatePer100} per ₹100`} />
              <Row
                label="Point value (best case)"
                value={`${formatINR(card.rewards.pointValueInRupees)} approx.`}
              />
              <Row
                label="Effective base rate"
                value={`${computeEffectiveRate(card).toFixed(2)}%`}
              />
              <Row label="Redemption" value={card.rewards.redemptionModes.join(", ")} />
              {card.rewards.transferPartners && card.rewards.transferPartners.length > 0 && (
                <Row label="Transfer partners" value={card.rewards.transferPartners.join(", ")} />
              )}
              {card.rewards.pointsExpiry && (
                <Row label="Points expiry" value={card.rewards.pointsExpiry} />
              )}
            </dl>

            {card.rewards.acceleratedEarn.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Accelerated earn
                </h3>
                <ul className="mt-3 space-y-2">
                  {card.rewards.acceleratedEarn.map((tier) => (
                    <li
                      key={tier.label}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-surface p-3 text-sm"
                    >
                      <span className="font-medium">{tier.label}</span>
                      <span className="text-muted-foreground">
                        {tier.multiplier} · ~{tier.ratePct}%
                        {tier.monthlyCapPoints
                          ? ` · cap ${tier.monthlyCapPoints.toLocaleString("en-IN")} pts/mo`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {card.rewards.milestones.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Milestones
                </h3>
                <ul className="mt-3 space-y-2">
                  {card.rewards.milestones.map((milestone) => (
                    <li
                      key={`${milestone.period}-${milestone.spend}`}
                      className="rounded-lg bg-surface p-3 text-sm"
                    >
                      <span className="font-medium">
                        {formatCompactINR(milestone.spend)} {milestone.period.toLowerCase()}
                      </span>{" "}
                      <span className="text-muted-foreground">— {milestone.benefit}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {card.rewards.earningExclusions.length > 0 && (
              <div className="mt-6 rounded-xl border border-warning/40 bg-warning/10 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldAlert className="size-4 text-warning" aria-hidden="true" /> Earns nothing
                  on
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {card.rewards.earningExclusions.join(" · ")}
                </p>
              </div>
            )}
          </Section>

          <Section id="benefits" title="Benefits">
            <dl>
              {card.benefits.loungeDomestic && (
                <Row
                  label="Domestic lounge"
                  value={[
                    card.benefits.loungeDomestic.unlimited ||
                    (card.benefits.loungeDomestic.visitsPerYear &&
                      card.benefits.loungeDomestic.visitsPerYear >= 999)
                      ? "Unlimited"
                      : card.benefits.loungeDomestic.visitsPerQuarter
                        ? `${card.benefits.loungeDomestic.visitsPerQuarter}/quarter`
                        : card.benefits.loungeDomestic.visitsPerYear
                          ? `${card.benefits.loungeDomestic.visitsPerYear}/year`
                          : null,
                    card.benefits.loungeDomestic.program,
                    card.benefits.loungeDomestic.spendCondition,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
              {card.benefits.loungeInternational && (
                <Row
                  label="International lounge"
                  value={[
                    card.benefits.loungeInternational.unlimited ||
                    (card.benefits.loungeInternational.visitsPerYear &&
                      card.benefits.loungeInternational.visitsPerYear >= 999)
                      ? "Unlimited"
                      : card.benefits.loungeInternational.visitsPerYear
                        ? `${card.benefits.loungeInternational.visitsPerYear}/year`
                        : null,
                    card.benefits.loungeInternational.program,
                    card.benefits.loungeInternational.guestVisits
                      ? `+${card.benefits.loungeInternational.guestVisits} guest visits`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
              {card.benefits.golf && <Row label="Golf" value={card.benefits.golf} />}
              {card.benefits.fuelSurchargeWaiver && (
                <Row
                  label="Fuel surcharge waiver"
                  value={`${card.benefits.fuelSurchargeWaiver.pct}% on ₹${card.benefits.fuelSurchargeWaiver.minTxn}–₹${card.benefits.fuelSurchargeWaiver.maxTxn}, cap ₹${card.benefits.fuelSurchargeWaiver.monthlyCap}/mo`}
                />
              )}
              {card.benefits.memberships && card.benefits.memberships.length > 0 && (
                <Row label="Memberships" value={card.benefits.memberships.join(", ")} />
              )}
              {card.benefits.diningPrograms && card.benefits.diningPrograms.length > 0 && (
                <Row label="Dining" value={card.benefits.diningPrograms.join(", ")} />
              )}
              {card.benefits.movieOffers && (
                <Row label="Movies" value={card.benefits.movieOffers} />
              )}
              {card.benefits.insurance && card.benefits.insurance.length > 0 && (
                <Row
                  label="Insurance"
                  value={card.benefits.insurance
                    .map((item) => `${item.type}: ${formatCompactINR(item.cover)}`)
                    .join(", ")}
                />
              )}
              <Row label="Concierge" value={card.benefits.concierge ? "Yes" : "No"} />
              {card.benefits.emiAndOther && card.benefits.emiAndOther.length > 0 && (
                <Row label="Other" value={card.benefits.emiAndOther.join(", ")} />
              )}
            </dl>
          </Section>

          <Section id="eligibility" title="Eligibility & UPI">
            <dl>
              <Row
                label="Age"
                value={`${card.eligibility.minAge}–${card.eligibility.maxAge} years`}
              />
              {card.eligibility.minMonthlyIncomeSalaried !== undefined && (
                <Row
                  label="Min monthly income (salaried)"
                  value={formatCompactINR(card.eligibility.minMonthlyIncomeSalaried)}
                />
              )}
              {card.eligibility.minAnnualIncomeSalaried !== undefined && (
                <Row
                  label="Min annual income (salaried)"
                  value={formatCompactINR(card.eligibility.minAnnualIncomeSalaried)}
                />
              )}
              {card.eligibility.minAnnualIncomeSelfEmployed !== undefined && (
                <Row
                  label="Min annual income (self-employed)"
                  value={formatCompactINR(card.eligibility.minAnnualIncomeSelfEmployed)}
                />
              )}
              <Row label="Min credit score" value={card.eligibility.minCreditScore} />
              <Row label="Employment" value={card.eligibility.employmentTypes.join(", ")} />
              {card.eligibility.fdBacked && (
                <Row
                  label="FD-backed"
                  value={
                    card.eligibility.minFdAmount
                      ? `Yes · min FD ${formatCompactINR(card.eligibility.minFdAmount)}`
                      : "Yes"
                  }
                />
              )}
              <Row label="Availability" value={card.eligibility.cityAvailability} />
              <Row label="Documents" value={card.eligibility.documents.join(", ")} />
              <Row label="RuPay UPI linkable" value={card.upi.rupayUpiLinkable ? "Yes" : "No"} />
              {card.upi.rewardsOnUpiSpends && (
                <Row label="Rewards on UPI" value={card.upi.rewardsOnUpiSpends} />
              )}
            </dl>
          </Section>

          <CardRail title="Similar cards" cards={related.similar} />
          <CardRail title="Usually compared with" cards={related.rivals} />

          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

function ConfidenceNote({ card }: { card: CreditCard }) {
  const tone =
    card.dataConfidence === "High"
      ? "text-success"
      : card.dataConfidence === "Medium"
        ? "text-warning"
        : "text-destructive";
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground">
      <p className="flex items-center gap-2 font-medium text-foreground">
        <BadgeCheck className={cn("size-4", tone)} aria-hidden="true" />
        Data confidence: {card.dataConfidence}
      </p>
      <p className="mt-1">Last verified {formatDate(card.lastVerified)}.</p>
      <div className="mt-2">
        <ReportDataButton card={card} />
      </div>
      {card.mitcUrl && (
        <a
          href={card.mitcUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
        >
          Most Important Terms & Conditions <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function CardRail({ title, cards }: { title: string; cards: CreditCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {cards.map((c) => (
          <Link
            key={c.id}
            to="/card/$id"
            params={{ id: c.id }}
            className="w-44 shrink-0 snap-start rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
          >
            <CardArt
              art={c.art}
              name={c.name}
              issuer={c.issuer}
              network={c.networks[0]}
              size="sm"
            />
            <p className="mt-2 line-clamp-2 text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">
              {c.fees.lifetimeFree ? "Lifetime free" : formatFee(c.fees.annualFee)} ·{" "}
              {computeEffectiveRate(c).toFixed(1)}%
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
