import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, WifiOff } from "lucide-react";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "You're offline — FindYourCC" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "No internet connection detected. Your saved cards and wallet data stay on this device.",
      },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-muted">
          <WifiOff className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">You're offline</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We can't reach FindYourCC right now. Don't worry — any cards you've saved or added to your
          wallet live on this device, so they'll still be there once you're back online.
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
