import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

import type { Page } from "../payload-types";
import { ensureRoutePagesImported, findPageByPath } from "../cms/site-pages";

/**
 * Puts everything the dashboard needs to know about behind this release into
 * the database it is already running on.
 *
 * Three things change, and only these three - every other word and section is
 * left exactly as an editor has it:
 *
 * 1. "Social Work" joins the header menu, between Our Work and Contact. The
 *    menu is editable, so the code default alone would not move a site whose
 *    CMS already holds the five-item one.
 * 2. The Social Work page itself becomes a document in Content → Website
 *    pages, alongside the others, through ensureRoutePagesImported.
 * 3. The "We worked with" logo band goes on to the front page, under the
 *    well-wishers.
 *
 * The band is written out here rather than imported from lib/partners.ts
 * because a migration has to keep doing what it did the day it ran, whatever
 * the shipped copy says later.
 */

/** A section, loosely typed: this reads `blockType` and copies the rest through. */
type Block = { blockType: string } & Record<string, unknown>;

const MENU: [string, string][] = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Our Work", "/our-work"],
  ["Social Work", "/social-work"],
  ["Contact", "/contact"],
  ["About Us", "/about"],
];

/** The menu as it stood before Social Work joined it. */
const PREVIOUS_MENU: [string, string][] = MENU.filter(([, href]) => href !== "/social-work");

const menu = (items: [string, string][]) => sql.raw(`
  INSERT INTO "public"."navigation"
    ("cta_label", "cta_href", "cta_enabled", "show_utility_bar", "updated_at", "created_at")
  SELECT 'Start a conversation', '/contact', true, true, now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM "public"."navigation");

  DELETE FROM "public"."navigation_items";

  INSERT INTO "public"."navigation_items" ("_order", "_parent_id", "id", "label", "href", "new_tab")
  SELECT item.ord, nav.id, gen_random_uuid()::text, item.label, item.href, false
  FROM "public"."navigation" nav
  CROSS JOIN (VALUES
    ${items.map(([label, href], index) => `(${index + 1}, '${label.replaceAll("'", "''")}', '${href}')`).join(",\n    ")}
  ) AS item(ord, label, href);
`);

/** The "We worked with" band, with the four organizations it was asked for. */
const partnerBand: Block = {
  blockType: "partnerMarquee",
  heading: "We worked with",
  partners: [
    { name: "CG Group" },
    { name: "KMC" },
    { name: "Swasthya Mantralaya" },
    { name: "Zoom Beauty Academy" },
  ],
  tone: "plain",
};

/**
 * The front page's document, or null when it has been deleted - or when the
 * database is younger than the config and cannot be asked yet. The band this
 * migration adds is already in the copy the page ships with, so a page imported
 * later carries it either way.
 */
async function homePage(
  payload: MigrateUpArgs["payload"],
  req: MigrateUpArgs["req"],
): Promise<{ id: string | number; layout: Block[] } | null> {
  const doc = await findPageByPath(payload, "/", req);
  if (!doc) return null;
  return { id: doc.id, layout: Array.isArray(doc.layout) ? (doc.layout as Block[]) : [] };
}

const saveLayout = async (
  payload: MigrateUpArgs["payload"],
  req: MigrateUpArgs["req"],
  id: string | number,
  layout: Block[],
): Promise<void> => {
  await payload.update({
    collection: "pages",
    id,
    // The sections above are written by hand; the collection's own type is what
    // they are stored as.
    data: { layout: layout as Page["layout"] },
    overrideAccess: true,
    req,
  });
};

export async function up({ payload, req, db }: MigrateUpArgs): Promise<void> {
  await db.execute(menu(MENU));

  // Creates a document for any built-in page that has none - the Social Work
  // page among them - and leaves the pages that already have one alone.
  const report = await ensureRoutePagesImported(payload, req);
  payload.logger.info(`[social-work] pages imported: ${report?.imported.join(", ") || "none"}.`);

  // The mission statement and the leadership message used to be written here.
  // They are written by 20260908_022000 instead, and the reason is worth
  // recording: writing a global through the local API names every column the
  // *current* config knows about, so once a later migration added Nepali fields
  // to these same messages, this write started failing on a database being
  // built from scratch - and a failed statement aborts the whole transaction,
  // taking the menu and the pages above it down with it. A migration that has
  // more to do after touching a global cannot afford that risk, so it no longer
  // takes it. On databases where this already ran, the copy is there.

  const home = await homePage(payload, req);
  if (!home) {
    payload.logger.info("[social-work] no front page document; it reads the copy it ships with.");
    return;
  }

  // The band goes in once. A front page that already carries one - because an
  // editor added it first - is left as they arranged it.
  if (home.layout.some((block) => block.blockType === "partnerMarquee")) {
    payload.logger.info("[social-work] the front page already carries a partner band.");
    return;
  }

  // Under the well-wishers, which is where it was asked for. With no
  // well-wishers band on the page it goes before the photo and film band, and
  // failing that at the end.
  const afterWellWishers = home.layout.findLastIndex(
    (block) => block.blockType === "wellWishersSection",
  );
  const beforeShowcase = home.layout.findIndex((block) => block.blockType === "mediaShowcase");
  const at =
    afterWellWishers >= 0
      ? afterWellWishers + 1
      : beforeShowcase >= 0
        ? beforeShowcase
        : home.layout.length;

  const layout = [...home.layout];
  layout.splice(at, 0, partnerBand);
  await saveLayout(payload, req, home.id, layout);

  payload.logger.info('[social-work] the "We worked with" band is on the front page.');
}

/**
 * Takes the menu, the band and the messages back.
 *
 * The Social Work page's document is deliberately left in place: deleting it
 * would take an editor's work with it, and a page nothing links to does no
 * harm. Removing it is a decision for whoever rolls this back.
 */
export async function down({ payload, req, db }: MigrateDownArgs): Promise<void> {
  await db.execute(menu(PREVIOUS_MENU));

  const home = await homePage(payload, req);
  if (!home) return;

  await saveLayout(
    payload,
    req,
    home.id,
    home.layout.filter((block) => block.blockType !== "partnerMarquee"),
  );
}
