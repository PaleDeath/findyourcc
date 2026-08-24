import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useVisitCount } from "@/hooks/useVisitCount";

const DISMISSED_KEY = "cc_install_hint_dismissed";
const MOBILE_QUERY = "(max-width: 1023px)";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Mobile-only, dismissible bottom hint encouraging users to install the PWA.
 * Shows a native install button when `beforeinstallprompt` fires, otherwise
 * (iOS Safari) shows manual Share -> Add to Home Screen instructions.
 * Sits above MobileActionBar (which is ~56px tall + safe-area) on mobile.
 */
export function InstallHint() {
  const visitCount = useVisitCount();
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }

    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      mql.removeEventListener("change", handleChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const canShow =
    isMobile &&
    !dismissed &&
    visitCount >= 2 &&
    !isStandalone() &&
    (deferredPrompt || isIosSafari());

  if (!canShow) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
      return;
    }
    setShowIosInstructions((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-label="Install FindYourCC"
      className="fixed inset-x-0 bottom-16 z-30 px-3 pb-[env(safe-area-inset-bottom)] motion-reduce:transition-none lg:hidden"
    >
      <div className="mx-auto flex max-w-md flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-lg motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Download className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Add FindYourCC to your home screen
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Faster access to your wallet and comparisons, even offline.
            </p>
            {showIosInstructions && (
              <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-2 text-xs text-muted-foreground">
                <Share className="size-3.5 shrink-0" aria-hidden="true" />
                Tap Share, then "Add to Home Screen".
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install hint"
            className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {deferredPrompt ? "Install app" : "How to install"}
          </button>
        </div>
      </div>
    </div>
  );
}
