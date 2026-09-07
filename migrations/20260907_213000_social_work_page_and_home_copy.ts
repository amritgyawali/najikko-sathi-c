import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

import type { Page } from "../payload-types";
import { ensureRoutePagesImported, findPageByPath } from "../cms/site-pages";

/**
 * Puts everything the dashboard needs to know about behind this release into
 * the database it is already running on.
 *
 * Four things change, and only these four - every other word and section is
 * left exactly as an editor has it:
 *
 * 1. "Social Work" joins the header menu, between Our Work and Contact. The
 *    menu is editable, so the code default alone would not move a site whose
 *    CMS already holds the five-item one.
 * 2. The Social Work page itself becomes a document in Content → Website
 *    pages, alongside the others, through ensureRoutePagesImported.
 * 3. The "We worked with" logo band goes on to the front page, under the
 *    well-wishers.
 * 4. The mission statement and the two leadership messages are written into
 *    Site → Homepage & page copy, where they can be edited.
 *
 * The copy is written out here rather than imported from lib/mission.ts and
 * lib/leadership.ts because a migration has to keep doing what it did the day
 * it ran, whatever the shipped copy says later.
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

const missionParagraphs = [
  "At Najik Ko Sathi Media our mission is simple but very meaningful. To give true and responsible news that helps the people of Nepal. As a media company we believe that information can change things make democracy stronger and bring people together.",
  "We know there are difficulties in being a news platform but we are still focused on keeping good journalism and being open. Our team works hard to make sure that every story we share shows the truth gives both sides and treats our audience with respect.",
  "Najik Ko Sathi Media is more than a news place. It is a voice for the people, a place for conversation and a link, between society and the government. We will keep trying things changing when needed and growing while staying real with our beliefs of being honest and taking responsibility.",
  "Thank you for believing in us as your news and information source. Together let us create an informed and stronger Nepal.",
];

const COMPANY = "Najikko Sathi Media Pvt. Ltd.";

const leadershipMessages = [
  {
    role: "Director's message",
    name: COMPANY,
    heading: "Media is more than information.",
    message: [
      "At Najiko Sathi Media Pvt. Ltd. Najiko Sathi Media always believes that media is more than information. Media is a tool that can inspire people teach people and bring people together. Najiko Sathi Media makes biography videos and documentaries that keep stories alive. Najiko Sathi Media also creates advertisements and digital campaigns that help brands reach their audiences. This work shows a commitment to creativity and responsibility.",
      "Najiko Sathi Media is just as committed to training and empowering the generation of communicators. Through programs in journalism, content creation, social media and technical production Najiko Sathi Media ensures that knowledge and skills are shared widely. This builds a foundation for the future of media in Nepal.",
      "Najiko Sathi Media journey also goes into consulting, research and collaboration. Najiko Sathi Media partners with individuals and organizations to turn ideas into ventures. Whether Najiko Sathi Media covers events, shapes profiles or guides campaigns Najiko Sathi Media is a trusted companion, in every step of communication.",
      "As Chairman I am proud of the work Najiko Sathi Media does and the values Najiko Sathi Media upholds. With your continued trust and support Najiko Sathi Media will keep striving to be a platform where truth, creativity and progress come together.",
    ].join("\n\n"),
  },
  {
    role: "अध्यक्षको सन्देश",
    name: COMPANY,
    heading: "सत्य, सिर्जना र प्रगतिको संगम।",
    message: [
      "नजिकको साथी मिडिया प्रा.लि. मा, हामी सञ्चार भनेको केवल सूचनाको प्रवाह मात्र होइन भन्नेमा विश्वास गर्छौं, यो मानिसहरूलाई जोड्ने, सिकाइको माध्यम बन्ने र प्रेरणा जगाउने शक्तिशाली साधन हो । हामी जीवनगाथा भिडियो र वृत्तचित्रमार्फत कथाहरूलाई जीवन्त राख्छौं भने, प्रभावकारी विज्ञापन र डिजिटल अभियानहरूद्वारा ब्रान्डहरूलाई सही दर्शकमाझ पुर्‍याउँछौं ।",
      "हामी उत्कृष्ट सिर्जना र उत्तरदायित्वमा मात्र सीमित छैनौं, नेपालको सञ्चार क्षेत्रको भविष्य सुदृढ पार्न पत्रकारिता, कन्टेन्ट सिर्जना, सोशल मिडिया र प्राविधिक उत्पादनका क्षेत्रमा नयाँ पुस्तालाई प्रशिक्षित र सशक्त बनाउन पनि उत्तिकै सक्रिय छौं ।",
      "हाम्रो यात्रा परामर्श, अनुसन्धान र सहकार्यसम्म फैलिएको छ । हामी व्यक्ति तथा संस्थाहरूसँग हातेमालो गर्दै विचारलाई मूर्त रूप दिन्छौं । घटनाको कभरेज होस्, प्रोफाइल निर्माण होस्, वा अभियानको मार्गदर्शन सञ्चारको हरेक पाइलामा हामी तपाईंको विश्वासयोग्य साथी हौं ।",
      "अध्यक्षको नाताले, म नजिकको साथी मिडियाले गरेका काम र अंगीकार गरेका मूल्यहरूप्रति गर्व महसुस गर्छु । तपाईंहरूको अटुट विश्वास र साथले हामीलाई सत्य, सिर्जना र प्रगतिको संगम स्थल बन्न सधैं प्रेरित गरिरहनेछ ।",
    ].join("\n\n"),
  },
];

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

  // The mission statement, and the two messages the carousel now carries. Only
  // the fields named here are touched.
  await payload.updateGlobal({
    slug: "homepage",
    overrideAccess: true,
    req,
    data: {
      aboutQuote: "To give true and responsible news that helps the people of Nepal.",
      aboutBody: missionParagraphs[0],
      aboutBodySecondary: missionParagraphs[1],
      aboutParagraphs: missionParagraphs.slice(2).map((text) => ({ text })),
      leadershipMessages,
    },
  });

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

  await payload.updateGlobal({
    slug: "homepage",
    overrideAccess: true,
    req,
    data: { aboutParagraphs: [], leadershipMessages: [] },
  });

  const home = await homePage(payload, req);
  if (!home) return;

  await saveLayout(
    payload,
    req,
    home.id,
    home.layout.filter((block) => block.blockType !== "partnerMarquee"),
  );
}
