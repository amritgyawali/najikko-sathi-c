import { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";

import type { Homepage } from "../payload-types";
import {
  leadershipMessageRows,
  LEADERSHIP_HEADING,
  LEADERSHIP_HEADING_NE,
  LEADERSHIP_KICKER,
  LEADERSHIP_KICKER_NE,
} from "../lib/leadership";
import { missionParagraphs, missionQuote } from "../lib/mission";

/**
 * Makes the leadership band bilingual without anyone retyping anything.
 *
 * Until now the chairman's message existed twice in the carousel: once in
 * English and once in Nepali, as two separate slides. They are one message, and
 * the band can now hold both languages on a single slide - so pressing ने
 * changes the language of the message someone is reading rather than moving
 * them to a different slide.
 *
 * This finds that pair and folds the second into the first. It is deliberately
 * careful about it:
 *
 * - The English slide keeps everything it has, its photograph included. Only
 *   the four empty Nepali fields are filled in.
 * - The Nepali slide is only ever removed once its words are safely on the
 *   first one.
 * - A pair is only recognised when the last slide is written in Devanagari and
 *   the first has no Nepali yet. Anything else - one slide, three slides,
 *   Nepali already filled in by hand - is left exactly as it is.
 *
 * The kicker and the fallback heading get their Nepali here too, since the band
 * is no longer translated automatically and would otherwise stay in English.
 *
 * This is also the newest migration that writes the homepage global, so on a
 * database being built from scratch it is the one that puts the mission
 * statement and the leadership message there - by then every column the config
 * knows about exists, which is not true of the migration that first wrote them.
 * On a database that already has that copy, nothing here touches it.
 */

type Message = NonNullable<Homepage["leadershipMessages"]>[number];

/** Devanagari anywhere in the text: this slide is the Nepali one. */
const isNepali = (value: string | null | undefined): boolean =>
  typeof value === "string" && /[ऀ-ॿ]/.test(value);

const blank = (value: string | null | undefined): boolean =>
  typeof value !== "string" || value.trim() === "";

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const home = (await payload.findGlobal({
    slug: "homepage",
    depth: 0,
    overrideAccess: true,
    req,
  })) as Homepage;

  const messages = (home.leadershipMessages ?? []) as Message[];

  // The Nepali for the two lines above the carousel, unless someone has
  // already written their own.
  const data: Partial<Homepage> = {};
  if (blank(home.leadershipKickerNe)) data.leadershipKickerNe = LEADERSHIP_KICKER_NE;
  if (blank(home.leadershipHeadingNe)) data.leadershipHeadingNe = LEADERSHIP_HEADING_NE;

  // An empty homepage means a database built from scratch, where the migration
  // that first wrote this copy had to skip it. Write it now.
  if (blank(home.aboutBody)) {
    data.aboutQuote = missionQuote;
    data.aboutBody = missionParagraphs[0];
    data.aboutBodySecondary = missionParagraphs[1];
    data.aboutParagraphs = missionParagraphs.slice(2).map((text) => ({ text }));
  }
  if (blank(home.leadershipKicker)) data.leadershipKicker = LEADERSHIP_KICKER;
  if (blank(home.leadershipHeading)) data.leadershipHeading = LEADERSHIP_HEADING;
  if (messages.length === 0) {
    data.leadershipMessages = leadershipMessageRows.map((row) => ({ ...row }));
  }

  const first = messages[0];
  const last = messages[messages.length - 1];
  const foldable =
    messages.length >= 2 &&
    first !== last &&
    // The last slide is the Nepali one...
    (isNepali(last.message) || isNepali(last.role)) &&
    // ...the first is not...
    !isNepali(first.message) &&
    // ...and nobody has filled the first slide's Nepali in by hand already.
    blank(first.messageNe);

  /**
   * Carries one field across, unless it says the same thing as the English.
   *
   * The Nepali slide signed itself with the company's English name, and copying
   * that into "Name in Nepali" would fill the field with something that is not
   * Nepali - which reads as "already written" and stops anyone writing it. Left
   * empty, the carousel shows the English anyway, and the field plainly invites
   * the Nepali when someone has it.
   */
  const carry = (english: string | null | undefined, nepali: string | null | undefined, existing: string | null | undefined) =>
    !blank(existing) ? existing : nepali === english ? null : nepali;

  if (foldable) {
    data.leadershipMessages = [
      {
        ...first,
        roleNe: carry(first.role, last.role, first.roleNe),
        nameNe: carry(first.name, last.name, first.nameNe),
        headingNe: carry(first.heading, last.heading, first.headingNe),
        messageNe: last.message,
      },
      // Any slide between the two is somebody else's message and stays.
      ...messages.slice(1, -1),
    ];
  }

  if (Object.keys(data).length === 0) {
    payload.logger.info("[leadership] nothing to fold; the band already reads in both languages.");
    return;
  }

  await payload.updateGlobal({ slug: "homepage", data, overrideAccess: true, req });
  payload.logger.info(
    foldable
      ? "[leadership] the Nepali slide is now the Nepali half of the English one."
      : "[leadership] the kicker and heading now have their Nepali.",
  );
}

/**
 * Splits the pair back into two slides.
 *
 * The Nepali goes back to being a slide of its own so the band reads as it did
 * before, and the photograph stays where it was - on the English one.
 */
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const home = (await payload.findGlobal({
    slug: "homepage",
    depth: 0,
    overrideAccess: true,
    req,
  })) as Homepage;

  const messages = (home.leadershipMessages ?? []) as Message[];
  const split: Message[] = [];

  for (const message of messages) {
    split.push({ ...message, roleNe: null, nameNe: null, headingNe: null, messageNe: null });
    if (!blank(message.messageNe)) {
      split.push({
        ...message,
        id: undefined,
        role: message.roleNe || message.role,
        name: message.nameNe || message.name,
        heading: message.headingNe || message.heading,
        message: message.messageNe as string,
        roleNe: null,
        nameNe: null,
        headingNe: null,
        messageNe: null,
      });
    }
  }

  await payload.updateGlobal({
    slug: "homepage",
    data: { leadershipMessages: split, leadershipKickerNe: null, leadershipHeadingNe: null },
    overrideAccess: true,
    req,
  });
}
