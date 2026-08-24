import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface pb-24 pt-10 lg:pb-10">
      <div className="container-page grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <Compass className="size-5 text-primary" aria-hidden="true" />
            FindYourCC
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            An independent guide to Indian credit cards. No affiliate links, no lead forms — just
            structured, honest data you can check yourself.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-3 text-sm font-semibold">Explore</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/explore" className="hover:text-foreground">
                All cards
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-foreground">
                Compare
              </Link>
            </li>
            <li>
              <Link to="/match" className="hover:text-foreground">
                Find my match
              </Link>
            </li>
            <li>
              <Link to="/calculator" className="hover:text-foreground">
                Calculators
              </Link>
            </li>
            <li>
              <Link to="/wallet" className="hover:text-foreground">
                My wallet
              </Link>
            </li>
            <li>
              <Link to="/learn" className="hover:text-foreground">
                Learn
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Data">
          <h2 className="mb-3 text-sm font-semibold">Data</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/settings" className="hover:text-foreground">
                Export / import dataset
              </Link>
            </li>
            <li>
              <Link to="/explore" search={{ archived: true }} className="hover:text-foreground">
                Archive of retired cards
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-page mt-8">
        <Disclaimer />
        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FindYourCC. Card artwork on this site is originally generated
          and is not the property of any issuer.
        </p>
      </div>
    </footer>
  );
}
