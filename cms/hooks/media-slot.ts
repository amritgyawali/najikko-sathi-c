import type { CollectionAfterChangeHook } from "payload";

/**
 * Gives a new service page its Page media row.
 *
 * Every service renders a showcase band keyed by its own slug, so without this
 * an editor would have to know that a row has to be created by hand, with the
 * slug typed exactly, before a photograph could be added to a new service. The
 * row is created empty: the page keeps showing its placeholder until someone
 * uploads something into it.
 *
 * A failure here must never cost an editor their save, so it is logged and
 * swallowed - the row can still be created by hand.
 */
export const ensureMediaSlot: CollectionAfterChangeHook = async ({ doc, req }) => {
  const key = typeof (doc as { slug?: unknown }).slug === "string" ? (doc as { slug: string }).slug : "";
  if (!key) return doc;

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

  return doc;
};
