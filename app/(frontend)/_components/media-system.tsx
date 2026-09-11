import type { BusinessInfo } from "@/lib/content";
import { mediaSystem } from "../_data/site";
import { MediaWheel } from "./media-wheel";

/**
 * The media system wheel on the front page.
 *
 * The disciplines and their colours are read here and handed to the wheel. The
 * wheel is drawn on the server and its only movement is in the stylesheet, so
 * it arrives complete whether or not the browser runs any script.
 */
export function MediaSystem({ business }: { business: BusinessInfo }) {
  return (
    <MediaWheel
      petals={mediaSystem.map((petal) => ({ ...petal }))}
      logoUrl={business.logoUrl}
      logoAlt={business.logoAlt}
      initials={business.initials}
    />
  );
}
