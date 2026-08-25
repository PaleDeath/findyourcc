import { LOCAL_IMAGES } from "./local-images";
import { groupA } from "./group-a";
import { groupB } from "./group-b";
import { groupC } from "./group-c";
import { groupD } from "./group-d";
import { groupE } from "./group-e";

/** Original issuer URLs, kept as a fallback where no local copy exists. */
const REMOTE_IMAGES: Record<string, string> = {
  ...groupA,
  ...groupB,
  ...groupC,
  ...groupD,
  ...groupE,
};

/**
 * Official product-image URLs per card id.
 * Local bundled images in /cards/ are served statically and prioritized for zero broken links.
 */
export const CARD_IMAGE_URLS: Record<string, string> = {
  ...REMOTE_IMAGES,
  ...LOCAL_IMAGES,
};
