import type { BusinessInfo } from "@/lib/content";
import { mediaSystem } from "../_data/site";
import { MediaWheel } from "./media-wheel";

/**
 * The media system wheel on the front page.
 *
 * The disciplines and their colours are read here, on the server, and handed to
 * the wheel itself - which is drawn in the browser so it can answer the
 * pointer. Keeping the two apart means the site's page data never travels to
 * the browser just to draw six petals.
 */
export function MediaSystem({ business }: { business: BusinessInfo }) {
  return (
    <>
      {/* The wheel blooms into place when the page has something to run it.
          With nothing to run it, the petals are simply drawn where they
          belong, rather than being left waiting at the start of a bloom that
          is never going to happen. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: ".media-petal{opacity:1!important;transform:none!important}",
          }}
        />
      </noscript>
      <MediaWheel
        petals={mediaSystem.map((petal) => ({ ...petal }))}
        logoUrl={business.logoUrl}
        logoAlt={business.logoAlt}
        initials={business.initials}
      />
    </>
  );
}
