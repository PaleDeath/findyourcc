import { canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { Glossary } from "@/components/learn/Glossary";
import { InterestCostCalculator, UtilisationChecker } from "@/components/learn/MiniTools";
import { TopicIndex } from "@/components/learn/TopicIndex";

const DESCRIPTION =
  "Plain-English guides to Indian credit cards: billing cycles, the minimum-due trap, CIBIL utilisation, RuPay UPI, forex markup, point devaluation — plus interest and utilisation calculators.";

export const Route = createFileRoute("/learn")({
  head: () => ({
    links: canonical("/learn"),
    meta: [
      { title: "Learn credit cards, India edition — FindYourCC" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Learn credit cards, India edition — FindYourCC" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="container-page space-y-12 py-8">
      <header className="max-w-3xl space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <GraduationCap className="size-3.5" aria-hidden="true" /> Education hub
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Learn credit cards, India edition
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          No affiliate spin, no &ldquo;top 10 cards&rdquo; filler. Just how interest, CIBIL, RuPay
          UPI and reward programmes actually behave here — and what that costs you.{" "}
          <Link to="/match" className="font-medium text-primary hover:underline">
            Take the match quiz
          </Link>{" "}
          once you know what to look for.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <InterestCostCalculator />
        <UtilisationChecker />
      </div>

      <TopicIndex />

      <Glossary />

      <Disclaimer />
    </div>
  );
}
