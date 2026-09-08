import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";

import type { Page } from "../payload-types";
import { findPageByPath } from "../cms/site-pages";

/**
 * Gives the writing and offers pages somewhere to put a picture.
 *
 * The "in pictures & film" band no longer draws anything until a photograph or
 * a film has been uploaded for that page, so carrying it costs a page nothing
 * while it is empty. That makes it safe to put on the two content pages that
 * did not have it - Writing and Offers - which is what an owner means by
 * wanting to add a picture to any page.
 *
 * Search and the sign-up form are deliberately left out: they are working
 * pages rather than pages anyone reads, and neither is in the sitemap.
 *
 * The band goes in above the closing call to action, where it sits on every
 * other page. A page that already carries one is left exactly as it is.
 */

/** A section, loosely typed: this reads `blockType` and copies the rest through. */
type Block = { blockType: string } & Record<string, unknown>;

const BANDS: { path: string; mediaKey: string; heading: string }[] = [
  { path: "/posts", mediaKey: "posts", heading: "Our writing" },
  { path: "/offers", mediaKey: "offers", heading: "Our offers" },
];

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const band of BANDS) {
    const doc = await findPageByPath(payload, band.path, req);
    if (!doc) {
      payload.logger.info(`[media] no ${band.path} document; it reads the copy it ships with.`);
      continue;
    }

    const layout = (Array.isArray(doc.layout) ? doc.layout : []) as Block[];
    if (layout.some((block) => block.blockType === "mediaShowcase")) {
      payload.logger.info(`[media] ${band.path} already carries a picture band.`);
      continue;
    }

    // Above the closing call to action, which is where it sits everywhere else.
    const beforeCta = layout.findIndex((block) => block.blockType === "contactCta");
    const at = beforeCta >= 0 ? beforeCta : layout.length;

    const next = [...layout];
    next.splice(at, 0, {
      blockType: "mediaShowcase",
      mediaKey: band.mediaKey,
      heading: band.heading,
    });

    await payload.update({
      collection: "pages",
      id: doc.id,
      // The section above is written by hand; the collection's own type is what
      // it is stored as.
      data: { layout: next as Page["layout"] },
      overrideAccess: true,
      req,
    });
    payload.logger.info(`[media] ${band.path} can now carry a photograph and a film.`);
  }
}

/** Takes the band off those two pages again. */
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const band of BANDS) {
    const doc = await findPageByPath(payload, band.path, req);
    if (!doc) continue;

    const layout = (Array.isArray(doc.layout) ? doc.layout : []) as Block[];
    await payload.update({
      collection: "pages",
      id: doc.id,
      data: {
        layout: layout.filter(
          (block) => !(block.blockType === "mediaShowcase" && block.mediaKey === band.mediaKey),
        ) as Page["layout"],
      },
      overrideAccess: true,
      req,
    });
  }
}
