import { Link, useLocation } from "@tanstack/react-router";
import { Scale, Sparkles, SlidersHorizontal, Plane, Tag, Wallet } from "lucide-react";
import { useCompareTray } from "@/lib/card-store";

/**
 * Sticky bottom bar for small screens.
 */
export function MobileActionBar() {
  const { ids } = useCompareTray();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link
            to="/explore"
            activeProps={{ className: "text-primary" }}
            aria-current={isActive("/explore") ? "page" : undefined}
            className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Explore
          </Link>
        </li>
        <li>
          <Link
            to="/lounge"
            activeProps={{ className: "text-primary" }}
            aria-current={isActive("/lounge") ? "page" : undefined}
            className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Plane className="size-4" aria-hidden="true" />
            Lounge
          </Link>
        </li>
        <li>
          <Link
            to="/compare"
            activeProps={{ className: "text-primary" }}
            aria-current={isActive("/compare") ? "page" : undefined}
            className="relative flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <span className="relative">
              <Scale className="size-4" aria-hidden="true" />
              {ids.length > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-2.5 -top-1.5 grid size-3.5 place-items-center rounded-full bg-primary text-[0.55rem] font-bold text-primary-foreground"
                >
                  {ids.length}
                </span>
              )}
            </span>
            Compare
          </Link>
        </li>
        <li>
          <Link
            to="/mcc"
            activeProps={{ className: "text-primary" }}
            aria-current={isActive("/mcc") ? "page" : undefined}
            className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Tag className="size-4" aria-hidden="true" />
            MCC
          </Link>
        </li>
        <li>
          <Link
            to="/wallet"
            activeProps={{ className: "text-primary" }}
            aria-current={isActive("/wallet") ? "page" : undefined}
            className="flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Wallet className="size-4" aria-hidden="true" />
            Wallet
          </Link>
        </li>
      </ul>
      <span className="sr-only" aria-live="polite">
        {ids.length > 0
          ? `${ids.length} card${ids.length === 1 ? "" : "s"} in comparison tray`
          : ""}
      </span>
    </nav>
  );
}
