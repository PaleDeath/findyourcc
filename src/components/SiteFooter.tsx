import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/80 bg-surface/50 pb-24 pt-12 dark:border-white/[0.08] dark:bg-black/20 lg:pb-12">
      <div className="container-page grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5 font-display text-base font-bold text-foreground">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="size-4" aria-hidden="true" />
            </span>
            <span>
              FindYour<span className="text-primary">CC</span>
            </span>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            The independent, affiliate-free intelligence index of Indian credit cards. Transparent earn rates, milestone schedules, and fine-print watch-outs.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-muted-foreground dark:border-white/10">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>149+ Verified Cards Active</span>
          </div>
        </div>

        <nav aria-label="Footer Navigation">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Product & Tools</h2>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link to="/explore" className="transition-colors hover:text-foreground">
                Card Directory
              </Link>
            </li>
            <li>
              <Link to="/compare" className="transition-colors hover:text-foreground">
                Side-by-Side Compare
              </Link>
            </li>
            <li>
              <Link to="/match" className="transition-colors hover:text-foreground">
                Card Match Finder
              </Link>
            </li>
            <li>
              <Link to="/calculator" className="transition-colors hover:text-foreground">
                Reward & Spend Calculator
              </Link>
            </li>
            <li>
              <Link to="/wallet" className="transition-colors hover:text-foreground">
                Personal Card Wallet
              </Link>
            </li>
            <li>
              <Link to="/learn" className="transition-colors hover:text-foreground">
                Card Guide & Glossary
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Data & Settings">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">Data & Privacy</h2>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li>
              <Link to="/settings" className="transition-colors hover:text-foreground">
                Export / Import Dataset
              </Link>
            </li>
            <li>
              <Link to="/explore" search={{ archived: true }} className="transition-colors hover:text-foreground">
                Retired Cards Archive
              </Link>
            </li>
            <li>
              <span className="text-muted-foreground/60">Zero tracking cookies</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-page mt-10 border-t border-border/60 pt-6 dark:border-white/[0.06]">
        <Disclaimer />
        <p className="mt-4 font-mono text-[11px] text-muted-foreground/80">
          © {new Date().getFullYear()} FindYourCC. Built with precision for Indian cardholders. Independent & community verified.
        </p>
      </div>
    </footer>
  );
}
