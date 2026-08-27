import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CardArt as CardArtData, CreditCard, Network } from "@/data/types";

const NETWORK_WORDMARK: Record<Network, string> = {
  Visa: "VISA",
  Mastercard: "mastercard",
  RuPay: "RuPay»",
  "American Express": "AMERICAN EXPRESS",
  "Diners Club": "DINERS CLUB",
};

const DEFAULT_CARD_ART: CardArtData = {
  gradient: ["#1e293b", "#0f172a"],
  finish: "matte",
  layout: "horizontal",
  accent: "#94a3b8",
  issuerMark: "CARD",
};

export interface CardArtProps {
  card?: CreditCard | undefined;
  art?: CardArtData | undefined;
  name?: string | undefined;
  issuer?: string | undefined;
  network?: Network | undefined;
  /** Rendering size. */
  size?: "sm" | "md" | "lg" | undefined;
  dimmed?: boolean | undefined;
  className?: string | undefined;
}

function usePointerTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const [interactive, setInteractive] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reducedMotion) {
      setInteractive(false);
      return;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setInteractive(finePointer);
  }, [enabled, reducedMotion]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      ref.current.style.transform = `perspective(800px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(0)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 65%)`;
      }
    },
    [interactive],
  );

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }, []);

  return { ref, glareRef, interactive, onPointerMove, reset };
}

export function CardArt(props: CardArtProps) {
  const card = props.card;
  const art = props.art ?? card?.art ?? DEFAULT_CARD_ART;
  const name = props.name ?? card?.name ?? "Credit Card";
  const issuer = props.issuer ?? card?.issuer ?? "Bank";
  const network = props.network ?? card?.networks?.[0];
  const size = props.size ?? "md";
  const dimmed = props.dimmed ?? false;
  const className = props.className;

  const { ref, glareRef, interactive, onPointerMove, reset } = usePointerTilt(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const titleId = useId();
  const grainId = `grain-${titleId.replace(/:/g, "")}`;

  const gradient = art?.gradient ?? DEFAULT_CARD_ART.gradient;
  const [c1, c2, c3] = gradient;
  const isVertical = art?.layout === "vertical";
  const finish = art?.finish ?? "matte";
  const finishLabel =
    finish === "metal"
      ? "metal-finish"
      : finish === "carbon"
        ? "carbon-fibre-textured"
        : finish === "holographic"
          ? "holographic"
          : finish === "glossy"
            ? "glossy"
            : "matte";
  const artDescription = `Stylised artwork for ${issuer} ${name}, a ${finishLabel} ${network ? `${network} ` : ""}card`;

  const baseGradient =
    finish === "metal"
      ? `linear-gradient(115deg, ${c1} 0%, ${c2} 22%, ${c3 ?? c1} 38%, ${c2} 52%, ${c1} 70%, ${c3 ?? c2} 88%, ${c2} 100%)`
      : finish === "carbon"
        ? `linear-gradient(140deg, ${c1}, ${c2} 70%, ${c3 ?? c1})`
        : `linear-gradient(135deg, ${c1} 0%, ${c2} 60%${c3 ? `, ${c3} 100%` : ""})`;

  const textScale = size === "sm" ? "text-[0.55rem]" : size === "lg" ? "text-sm" : "text-[0.7rem]";

  if (art?.officialImageUrl && !imageFailed) {
    const isImageVertical = imageRatio !== null ? imageRatio < 0.9 : isVertical;
    return (
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        className={cn(
          "relative isolate w-full select-none overflow-hidden rounded-xl transition-all duration-200",
          isImageVertical ? "aspect-[0.63/1] max-h-56" : "aspect-[1.586/1]",
          dimmed && "opacity-40 grayscale",
          className,
        )}
      >
        <img
          src={art.officialImageUrl}
          alt={artDescription}
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setImageRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
          onError={() => setImageFailed(true)}
          className="size-full object-contain"
        />
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150"
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn(
        "relative isolate w-full select-none overflow-hidden rounded-xl p-3.5 transition-all duration-200 sm:p-4",
        isVertical ? "aspect-[0.63/1]" : "aspect-[1.586/1]",
        dimmed && "opacity-40 grayscale",
        className,
      )}
      style={{
        background: baseGradient,
        boxShadow:
          finish === "metal"
            ? "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.5), 0 8px 24px -6px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 18px -4px rgba(0,0,0,0.25)",
      }}
      role="img"
      aria-label={artDescription}
    >
      {/* Background SVG filters/grain */}
      <svg className="pointer-events-none absolute inset-0 size-full opacity-35 mix-blend-overlay">
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      {/* Dynamic Card Content */}
      <div className="relative z-10 flex size-full flex-col justify-between text-white drop-shadow-sm">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider opacity-90">
            {art?.issuerMark || issuer.slice(0, 4).toUpperCase()}
          </span>
          {network && (
            <span className="font-mono text-[10px] font-extrabold tracking-tight opacity-90">
              {NETWORK_WORDMARK[network] ?? network}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="inline-block size-4 rounded bg-amber-400/80 shadow-xs" />
            <span className="font-mono text-[9px] tracking-widest">•••• •••• •••• 8888</span>
          </div>
          <div className={cn("font-display font-bold tracking-tight line-clamp-1", textScale)}>
            {name}
          </div>
        </div>
      </div>

      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150"
      />
    </div>
  );
}
