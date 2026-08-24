import { canonical } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SkipForward, Sparkles } from "lucide-react";
import { QuizProgress } from "@/components/match/QuizProgress";
import {
  StepBrands,
  StepExisting,
  StepFee,
  StepGoal,
  StepIncome,
  StepScore,
  StepSpend,
  StepTravel,
} from "@/components/match/steps";
import { EmptyResults, Results, ResultsSkeleton } from "@/components/match/Results";
import { Button } from "@/components/ui/button";
import {
  useCompareTray,
  useDataset,
  useFavourites,
  useMatchAnswers,
  useSpendProfile,
} from "@/lib/card-store";
import { usePersistentState } from "@/hooks/usePersistentState";
import { runMatch, type MatchOutcome } from "@/lib/matchEngine";

export const Route = createFileRoute("/match")({
  head: () => ({
    links: canonical("/match"),
    meta: [
      { title: "Find your credit card match — FindYourCC" },
      {
        name: "description",
        content:
          "An 8-step quiz that maps your income, credit score, goals and spending to the Indian credit cards that reward it, with the rupee maths shown for every match.",
      },
      { property: "og:title", content: "Find your credit card match — FindYourCC" },
      {
        property: "og:description",
        content:
          "Answer a few questions about your spending and get matched to the right Indian credit card.",
      },
    ],
  }),
  component: MatchPage,
});

const STEP_LABELS = [
  "Income",
  "Credit score",
  "Your goal",
  "Monthly spend",
  "Brands you use",
  "Travel",
  "Fee comfort",
  "Existing cards",
];

const TOTAL_STEPS = STEP_LABELS.length;

function MatchPage() {
  const { answers, patch, reset, hydrated: answersHydrated } = useMatchAnswers();
  const { setSpend, hydrated: spendHydrated } = useSpendProfile();
  const { cards, hydrated: datasetHydrated } = useDataset();
  const favourites = useFavourites();
  const compare = useCompareTray();

  const [step, setStep, stepHydrated] = usePersistentState<number>("match-step", 0);
  const [submitted, setSubmitted] = usePersistentState<boolean>("match-submitted", false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [dismissedResume, setDismissedResume] = useState(false);
  const [computing, setComputing] = useState(false);
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const hydrated = answersHydrated && spendHydrated && datasetHydrated && stepHydrated;
  const showResumeBanner =
    hydrated && !dismissedResume && !submitted && (step > 0 || answers.monthlyIncome !== 75000);

  useEffect(() => {
    if (!submitted) return;
    setComputing(true);
    const id = setTimeout(() => {
      setOutcome(runMatch(cards, answers));
      setComputing(false);
    }, 350);
    return () => clearTimeout(id);
  }, [submitted, cards, answers]);

  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [step, submitted, hydrated]);

  const goNext = () => {
    setDirection("forward");
    if (step >= TOTAL_STEPS - 1) {
      setSubmitted(true);
    } else {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    setDirection("back");
    if (step > 0) setStep(step - 1);
  };

  const skip = () => goNext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      goNext();
    }
  };

  const startOver = () => {
    reset();
    setStep(0);
    setSubmitted(false);
    setOutcome(null);
    setDismissedResume(true);
  };

  const retake = () => {
    setSubmitted(false);
    setStep(0);
    setOutcome(null);
  };

  const stepComponent = useMemo(() => {
    switch (step) {
      case 0:
        return <StepIncome answers={answers} patch={patch} />;
      case 1:
        return <StepScore answers={answers} patch={patch} />;
      case 2:
        return <StepGoal answers={answers} patch={patch} />;
      case 3:
        return <StepSpend answers={answers} patch={patch} onSpendChange={setSpend} />;
      case 4:
        return <StepBrands answers={answers} patch={patch} />;
      case 5:
        return <StepTravel answers={answers} patch={patch} />;
      case 6:
        return <StepFee answers={answers} patch={patch} />;
      case 7:
        return <StepExisting answers={answers} patch={patch} cards={cards} />;
      default:
        return null;
    }
  }, [step, answers, patch, setSpend, cards]);

  if (submitted) {
    return (
      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold outline-none sm:text-3xl"
            >
              Your match results
            </h1>
          </div>
          {computing || !outcome ? (
            <ResultsSkeleton />
          ) : outcome.top.length === 0 && outcome.consideredCount === 0 ? (
            <EmptyResults onRetake={retake} />
          ) : (
            <Results
              outcome={outcome}
              totalCards={cards.length}
              favourites={favourites.ids}
              compareIds={compare.ids}
              onToggleFavourite={favourites.toggle}
              onToggleCompare={compare.toggle}
              onRetake={retake}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl space-y-6" onKeyDown={handleKeyDown}>
        <div className="space-y-1">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-none sm:text-3xl"
          >
            Find my match
          </h1>
          <p className="text-sm text-muted-foreground">
            Eight quick questions — everything stays on this device.
          </p>
        </div>

        {showResumeBanner && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span>Resumed where you left off.</span>
            <Button size="sm" variant="ghost" onClick={startOver}>
              Start over?
            </Button>
          </div>
        )}

        <QuizProgress step={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

        <div key={step} className={direction === "forward" ? "cc-step-in" : "cc-step-in"}>
          {stepComponent}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <Button variant="outline" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={skip}>
              <SkipForward className="size-4" /> Skip
            </Button>
            <Button onClick={goNext}>
              {step === TOTAL_STEPS - 1 ? "See my matches" : "Next"}{" "}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
