import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  Menu,
  Search,
  X,
  SlidersHorizontal,
  Scale,
  Plane,
  Tag,
  Send,
  Trophy,
  Sparkles,
  Calculator,
  Wallet,
  BookOpen,
  Settings,
  ShieldAlert,
  Swords,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { openCommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/explore", label: "Explore", icon: SlidersHorizontal },
  { to: "/battle", label: "1v1 Battle", icon: Swords, badge: "New" },
  { to: "/devaluations", label: "Devaluations", icon: ShieldAlert, badge: "Live" },
  { to: "/lounge", label: "Lounge", icon: Plane, badge: "2026" },
  { to: "/mcc", label: "MCC Guide", icon: Tag },
  { to: "/transfers", label: "Transfers", icon: Send },
  { to: "/categories", label: "Categories", icon: Trophy },
  { to: "/match", label: "Match", icon: Sparkles },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/learn", label: "Learn", icon: BookOpen },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl transition-colors duration-200 dark:border-white/[0.08] dark:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link
          to="/"
          className="group flex items-center transition-opacity hover:opacity-90 shrink-0"
          aria-label="FindYourCC home"
        >
          <img
            src="/findyourcclogo2.png"
            alt="FindYourCC"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105 dark:brightness-0 dark:invert"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className: "bg-surface font-semibold text-foreground dark:bg-white/[0.08] shadow-2xs",
              }}
              className="relative rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-surface/80 hover:text-foreground"
            >
              <span>{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="ml-1 rounded bg-primary/10 px-1 py-0.2 text-[9px] font-bold text-primary">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search cards and perks (Command K)"
            className="btn-tactile flex h-10 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-border/80 bg-surface/60 px-2.5 sm:px-3.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-sm transition-colors hover:border-foreground/40 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">Search database</span>
            <kbd className="hidden rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/[0.06] md:inline">
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
            className="grid size-10 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-surface/60 text-foreground transition-colors hover:bg-surface dark:border-white/10 xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Mobile Navigation Drawer */}
      <nav
        id="mobile-nav"
        aria-label="Mobile Navigation"
        className={cn(
          "max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background/95 pb-8 backdrop-blur-2xl transition-all xl:hidden dark:border-white/10",
          open ? "block" : "hidden",
        )}
      >
        <div className="container-page py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-primary/10 border-primary/30 text-primary font-bold" }}
                  className="flex min-h-[48px] items-center justify-between rounded-xl border border-border/60 bg-surface/40 p-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </span>
                  {"badge" in item && item.badge ? (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Settings className="size-4" />
              <span>Data Settings & Backup</span>
            </Link>
            <span className="text-[11px] text-muted-foreground/60">FindYourCC Mobile</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
