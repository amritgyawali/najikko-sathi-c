import type { CollectionAfterChangeHook } from "payload";

import { heroSlotKey } from "../../lib/site-map";

/**
 * Gives a new service page the Page media rows it can carry.
 *
 * A service page has two places for a picture - the photograph beside its
 * title, keyed "<slug>-hero", and the showcase band, keyed by the slug itself -
 * so without this an editor would have to know that each row has to be created
 * by hand, with the key typed exactly, before a photograph could be added. The
 * rows are created empty: neither place is drawn on the page until something is
 * uploaded into it.
 *
 * A failure here must never cost an editor their save, so it is logged and
 * swallowed - a row can still be created by hand.
 */
export const ensureMediaSlot: CollectionAfterChangeHook = async ({ doc, req }) => {
  const slug = typeof (doc as { slug?: unknown }).slug === "string" ? (doc as { slug: string }).slug : "";
  if (!slug) return doc;

  for (const key of [slug, heroSlotKey(slug)]) {
    try {
      const existing = await req.payload.find({
        collection: "media-slots",
        where: { key: { equals: key } },
        limit: 1,
        depth: 0,
        req,
        overrideAccess: true,
      });
      if (existing.docs.length === 0) {
        await req.payload.create({
          collection: "media-slots",
          data: { key },
          req,
          overrideAccess: true,
        });
      }
    } catch (error) {
      req.payload.logger.error({ err: error }, `[media-slots] could not prepare the "${key}" entry`);
    }
  }

  return doc;
};
