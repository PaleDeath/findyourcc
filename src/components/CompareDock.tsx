import { Link, useLocation } from "@tanstack/react-router";
import { X } from "lucide-react";
import { CardArt } from "@/components/CardArt";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/data/cards";
import { MAX_COMPARE, useCompareTray, useDataset } from "@/lib/card-store";
import { cn } from "@/lib/utils";

/** Floating dock showing the current compare tray, hidden on /compare and when empty. */
export function CompareDock() {
  const { ids, toggle, clear, hydrated } = useCompareTray();
  const location = useLocation();
  const { cards: dataset } = useDataset();

  const isComparePage = location.pathname === "/compare";
  const visible = hydrated && ids.length > 0 && !isComparePage;

  const cards = ids
    .map((id) => getCardById(dataset, id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-30 flex justify-center px-3 transition-all duration-300 ease-out lg:bottom-4",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-hidden={!visible}
    >
      <div
        role="region"
        aria-label="Comparison tray"
        className="card-bevel flex w-full max-w-xl items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-2.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/80"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {cards.map((card) => (
            <div key={card.id} className="relative w-14 shrink-0 pt-1.5">
              <CardArt art={card.art} name={card.name} issuer={card.issuer} size="sm" />
              <button
                type="button"
                onClick={() => toggle(card.id)}
                aria-label={`Remove ${card.name} from comparison`}
                className="tap-target-44 absolute -right-1.5 -top-1.5 z-10 grid size-5 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {ids.length}/{MAX_COMPARE}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            aria-label="Clear comparison tray"
            className="min-h-11 min-w-11"
          >
            Clear
          </Button>
          <Button asChild size="sm" className="min-h-11">
            <Link to="/compare">Compare</Link>
          </Button>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {visible ? `${ids.length} card${ids.length === 1 ? "" : "s"} in comparison tray` : ""}
      </span>
    </div>
  );
}
