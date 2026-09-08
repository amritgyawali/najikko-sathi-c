import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import type { Page } from '../payload-types'
import { ensureRoutePagesImported, findPageByPath } from '../cms/site-pages'

/**
 * Puts the reviews and well-wishers bands on the front page, and takes the
 * hero's second button off it.
 *
 * The front page is a document in Content → Website pages, so changing
 * lib/page-defaults.ts alone would change nothing: the website reads the
 * document. This edits that document instead - and edits only the three things
 * it is about, leaving every other word and section exactly as an editor has
 * them.
 *
 * The bands are written out here rather than imported from lib/page-defaults.ts
 * because a migration has to keep doing what it did the day it ran, whatever
 * the shipped copy says later.
 *
 * Nothing appears on the page until there is something to show: both bands
 * draw themselves only once a review has been approved, or a well-wisher added.
 *
 * It also calls ensureRoutePagesImported, as every migration that adds a section
 * to a page must: it is the newest such migration that ends up doing the import
 * on a database being built from scratch. On a database that is already up to
 * date that step finds the pages all there and changes nothing.
 */

/**
 * A section, loosely typed. This migration only reads `blockType` and copies
 * the rest through, and the sections it writes are checked against the real
 * type where they are saved.
 */
type Block = { blockType: string } & Record<string, unknown>;

const reviewsBand: Block = {
  blockType: 'reviewsSection',
  kicker: 'In their words',
  heading: 'What the people we work with say.',
  description:
    'Reviews left by the organizations and individuals whose stories we have helped tell.',
  source: 'all',
  limit: 6,
  tone: 'plain',
};

const wellWishersBand: Block = {
  blockType: 'wellWishersSection',
  kicker: 'Our well-wishers',
  heading: 'The people who stand beside us.',
  description:
    'Advisers, patrons and friends of the house whose encouragement keeps this work moving.',
  tone: 'tinted',
};

/**
 * The front page's document, or null when it has been deleted - or when the
 * database is younger than the config and cannot be asked yet.
 *
 * The second case is what happens on an empty database: this query names every
 * section table the current config knows about, including the ones later
 * migrations create. Reading through findPageByPath answers null there instead
 * of failing the chain, and the migration that adds those sections imports the
 * page with the bands below already on it.
 */
async function homePage(
  payload: MigrateUpArgs['payload'],
  req: MigrateUpArgs['req'],
): Promise<{ id: string | number; layout: Block[] } | null> {
  const doc = await findPageByPath(payload, '/', req);
  if (!doc) return null;
  return { id: doc.id, layout: Array.isArray(doc.layout) ? (doc.layout as Block[]) : [] };
}

const save = async (
  payload: MigrateUpArgs['payload'],
  req: MigrateUpArgs['req'],
  id: string | number,
  layout: Block[],
): Promise<void> => {
  await payload.update({
    collection: 'pages',
    id,
    // The sections above are written by hand; the collection's own type is what
    // they are stored as.
    data: { layout: layout as Page["layout"] },
    overrideAccess: true,
    req,
  });
};

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ensureRoutePagesImported(payload, req);

  const home = await homePage(payload, req);
  if (!home) {
    payload.logger.info('[home] no front page document; it reads the copy it ships with.');
    return;
  }

  // The hero's second button, which pointed at Right Sanchar. Emptying the
  // label is what hides it, so an editor can bring it back by typing one.
  const layout: Block[] = home.layout.map((block) =>
    block.blockType === 'homeHero' ? { ...block, secondaryLabel: null } : block,
  );

  // Each band goes in once. A page that already carries one - because an
  // editor added it first - is left as they arranged it.
  const has = (blockType: string) => layout.some((block) => block.blockType === blockType);
  const toAdd = [
    ...(has('reviewsSection') ? [] : [reviewsBand]),
    ...(has('wellWishersSection') ? [] : [wellWishersBand]),
  ];

  // Under the leadership messages, which is where they were asked for. With no
  // leadership band on the page they go before the photo and film band, and
  // failing that at the end.
  const after = layout.findLastIndex((block) => block.blockType === 'leadershipSection');
  const beforeShowcase = layout.findIndex((block) => block.blockType === 'mediaShowcase');
  const at =
    after >= 0 ? after + 1 : beforeShowcase >= 0 ? beforeShowcase : layout.length;

  layout.splice(at, 0, ...toAdd);
  await save(payload, req, home.id, layout);

  payload.logger.info(
    `[home] second hero button removed; bands added: ${toAdd.map((b) => b.blockType).join(', ') || 'none'}.`,
  );
}

/** Takes both bands off the front page again and puts the second button back. */
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const home = await homePage(payload, req);
  if (!home) return;

  const layout = home.layout
    .filter(
      (block) =>
        block.blockType !== 'reviewsSection' && block.blockType !== 'wellWishersSection',
    )
    .map((block) =>
      block.blockType === 'homeHero'
        ? { ...block, secondaryLabel: 'Visit Right Sanchar' }
        : block,
    );

  await save(payload, req, home.id, layout);
}
