import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { openCommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/compare", label: "Compare" },
  { to: "/match", label: "Match" },
  { to: "/calculator", label: "Calculator" },
  { to: "/wallet", label: "Wallet" },
  { to: "/learn", label: "Learn" },
  { to: "/settings", label: "Settings" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-colors duration-200 dark:border-white/[0.08] dark:bg-background/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          aria-label="FindYourCC home"
        >
          <span className="relative flex size-7.5 items-center justify-center rounded-lg bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Compass className="size-4" aria-hidden="true" />
          </span>
          <span className="flex items-center text-[1.05rem] font-bold tracking-tight text-foreground">
            FindYourCC
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className: "bg-surface font-semibold text-foreground dark:bg-white/[0.08] shadow-2xs",
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-surface/80 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search (Command K)"
            className="btn-tactile flex h-9 items-center gap-2 rounded-xl border border-border/80 bg-surface/60 px-3 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-sm transition-colors hover:border-foreground/40 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Search database</span>
            <kbd className="hidden rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/[0.06] sm:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-xl border border-border bg-surface/50 text-foreground transition-colors hover:bg-surface dark:border-white/10 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={cn(
          "border-t border-border bg-background/95 backdrop-blur-xl lg:hidden dark:border-white/10",
          open ? "block" : "hidden",
        )}
      >
        <ul className="container-page grid grid-cols-2 gap-1 py-3 sm:grid-cols-4">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-foreground/10 text-foreground font-semibold" }}
                className="flex items-center rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
