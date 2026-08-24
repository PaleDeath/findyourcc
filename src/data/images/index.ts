import { groupA } from "./group-a";
import { groupB } from "./group-b";
import { groupC } from "./group-c";
import { groupD } from "./group-d";
import { groupE } from "./group-e";

interface AssetPointer {
  url: string;
}

/**
 * Card fronts mirrored onto the project CDN. Sourced from the issuers' own
 * websites; many issuer CDNs refuse cross-origin hotlinking, so the verified
 * images are served from here instead. Keyed by card id (the file name).
 */
const hostedModules = import.meta.glob<{ default: AssetPointer }>(
  "../../assets/cards/*.asset.json",
  {
    eager: true,
  },
);

const HOSTED_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(hostedModules).map(([path, mod]) => [
    path.split("/").pop()!.replace(".asset.json", ""),
    mod.default.url,
  ]),
);

/** Original issuer URLs, kept as a fallback where no mirrored copy exists. */
const REMOTE_IMAGES: Record<string, string> = {
  ...groupA,
  ...groupB,
  ...groupC,
  ...groupD,
  ...groupE,
};

/**
 * Official product-image URLs per card id. Images remain the property of their
 * respective issuers and are used for identification only.
 */
export const CARD_IMAGE_URLS: Record<string, string> = {
  ...REMOTE_IMAGES,
  ...HOSTED_IMAGES,
};
