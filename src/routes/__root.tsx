import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileActionBar } from "@/components/MobileActionBar";
import { InstallHint } from "@/components/InstallHint";
import { CompareDock } from "@/components/CompareDock";
import { Disclaimer } from "@/components/Disclaimer";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/CommandPalette";
import { useNumberFormatMode } from "@/lib/format-prefs";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
        <Disclaimer className="mt-8 text-left" />
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
        <Disclaimer className="mt-8 text-left" />
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FindYourCC — Independent Indian credit card guide" },
      {
        name: "description",
        content:
          "Discover, understand and compare Indian credit cards with honest, structured data. No affiliate links.",
      },
      { name: "author", content: "FindYourCC" },
      { name: "theme-color", content: "#3b52d4" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "FindYourCC" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/findyourcclogo2.png", type: "image/png" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/** Applies the stored theme before first paint so dark users never see a
 * white flash. Mirrors the logic in useTheme(). */
const THEME_BOOTSTRAP = `(function(){try{var raw=localStorage.getItem("cardcompass.v1.theme");var mode=raw?JSON.parse(raw):"system";var dark=mode==="dark"||(mode!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Re-render the tree when the ₹ formatting preference changes; the formatter
  // is a module-level store, so nothing else would notice.
  const [numberFormat] = useNumberFormatMode();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // The offline cache is only useful on the deployed site. In dev and in the
    // Lovable preview it happily serves a stale app shell, which makes fresh
    // code look broken — so unregister it and drop its caches there instead.
    const host = window.location.hostname;
    const isPreview =
      !import.meta.env.PROD ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".lovableproject.com") ||
      host.startsWith("id-preview--");

    if (isPreview) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .then(() => ("caches" in window ? caches.keys() : []))
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {
          /* nothing to clean up */
        });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures should never break the app.
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col overflow-x-clip max-w-full" key={numberFormat}>
        <SiteHeader />
        <main className="flex-1 overflow-x-clip max-w-full">
          {/* Required: nested routes render here. */}
          <Outlet />
        </main>
        <SiteFooter />
        <MobileActionBar />
        <InstallHint />
        <CompareDock />
      </div>
      <Toaster />
      <CommandPalette />
    </QueryClientProvider>
  );
}
