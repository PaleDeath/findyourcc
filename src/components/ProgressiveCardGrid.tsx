import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CreditCardTile } from "@/components/CreditCardTile";
import type { CreditCard } from "@/data/types";

const PAGE_SIZE = 60;

interface ProgressiveCardGridProps {
  cards: CreditCard[];
  favouriteIds: string[];
  compareIds: string[];
  onToggleFavourite: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

/**
 * Renders large result sets in windows of 60 so the first paint stays instant.
 * Off-screen batches are appended as a sentinel scrolls into view; each tile
 * also opts into `content-visibility: auto` so layout work is skipped while
 * it sits outside the viewport.
 */
function ProgressiveCardGridImpl({
  cards,
  favouriteIds,
  compareIds,
  onToggleFavourite,
  onToggleCompare,
}: ProgressiveCardGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset the window whenever the result set changes (new filters/sort).
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [cards]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= cards.length) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisibleCount(cards.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, cards.length));
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, cards.length]);

  const favourites = useMemo(() => new Set(favouriteIds), [favouriteIds]);
  const comparing = useMemo(() => new Set(compareIds), [compareIds]);
  const visible = cards.slice(0, visibleCount);
  const remaining = cards.length - visible.length;

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {visible.map((card, index) => (
          <CreditCardTile
            key={card.id}
            card={card}
            index={index}
            isFavourite={favourites.has(card.id)}
            isComparing={comparing.has(card.id)}
            onToggleFavourite={onToggleFavourite}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>

      {remaining > 0 && (
        <div ref={sentinelRef} className="pt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, cards.length))}
            className="min-h-11 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} left)
          </button>
        </div>
      )}
    </>
  );
}

export const ProgressiveCardGrid = memo(ProgressiveCardGridImpl);
