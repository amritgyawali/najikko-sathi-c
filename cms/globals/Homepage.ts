import type { Field, GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isEditor } from "../access";
import { BILINGUAL_NOTE, bilingual } from "../bilingual";

/**
 * The copy that is written here rather than in a collection, tab by tab.
 *
 * Each tab is named after the page it appears on, and lib/site-map.ts points
 * back at it from that page, so an editor opening the dashboard sees the same
 * page names a visitor sees in the navbar. Three of these bands started life on
 * the front page and now open pages of their own; the fields kept their names
 * so nothing anyone had written was lost when they moved.
 *
 * Every line is written twice, English on the left and Nepali on the right of
 * the same row. The Nepali used to sit folded away at the foot of each tab,
 * which meant writing a band once, scrolling down, and writing it again out of
 * sight of the English it belonged to; now the pair is in front of whoever is
 * typing. None of it is required: a Nepali field that is filled in is shown
 * exactly as written, and one left empty leaves the band as it always was -
 * English, turned into Nepali against the phrase book.
 */

/**
 * Said under every optional line of the front page. Emptying one of these takes
 * it off the page; it does not bring back the wording the site started with.
 */
const HIDE_WHEN_EMPTY =
  "Clear this field and save to take it off the homepage. It stays hidden until something is written here again.";

/**
 * A keyword list where each entry is written twice, the Nepali beside the
 * English as everywhere else.
 */
const bilingualLabels = (name: string, label: string, description: string): Field => ({
  name,
  type: "array",
  label,
  admin: { description: `${description} ${BILINGUAL_NOTE}` },
  fields: [bilingual({ name: "label", label: "Keyword", required: true })],
});

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage & page copy",
  admin: {
    group: "Site",
    description:
      "Written copy for the front page and for three pages that grew out of it. " +
      "Each tab says which address it appears at, and every line is written twice: " +
      "English on the left, Nepali beside it on the right.",
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Home - hero",
          admin: { description: `The top of the front page, at /. ${BILINGUAL_NOTE}` },
          fields: [
            bilingual({
              name: "heroKicker",
              label: "Kicker",
              description:
                "The small line above the heading. Leave it empty and nothing is shown there.",
            }),
            bilingual({
              name: "heroHeading",
              label: "Heading",
              required: true,
              defaultValue: "Media that stays close to what matters.",
            }),
            bilingual({
              name: "heroBody",
              type: "textarea",
              label: "Body",
              description: HIDE_WHEN_EMPTY,
            }),
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Full-bleed background photograph." },
            },
            bilingual({
              name: "heroCtaLabel",
              label: "Button text",
              defaultValue: "Explore our services",
              description: HIDE_WHEN_EMPTY,
            }),
            { name: "heroCtaHref", type: "text", label: "Button address", defaultValue: "/services" },
            bilingualLabels("brandPillars", "Brand pillars", "The ring of keywords under the hero."),
          ],
        },
        {
          label: "Home - about",
          admin: { description: `The introduction on the front page, at /. ${BILINGUAL_NOTE}` },
          fields: [
            bilingual({
              name: "aboutEyebrow",
              label: "Eyebrow",
              defaultValue: "Who We Are",
              description: HIDE_WHEN_EMPTY,
            }),
            bilingual({ name: "aboutHeading", label: "Heading", description: HIDE_WHEN_EMPTY }),
            bilingual({
              name: "aboutQuote",
              type: "textarea",
              label: "Quotation",
              description: HIDE_WHEN_EMPTY,
            }),
            bilingual({ name: "aboutBody", type: "textarea", label: "First paragraph" }),
            bilingual({ name: "aboutBodySecondary", type: "textarea", label: "Second paragraph" }),
            {
              name: "aboutParagraphs",
              type: "array",
              label: "Further paragraphs",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
              admin: {
                description:
                  "Anything after the second paragraph. Drag to reorder; they read in this order. " +
                  BILINGUAL_NOTE,
              },
              fields: [
                bilingual({ name: "text", type: "textarea", label: "Paragraph", required: true }),
              ],
            },
            bilingualLabels("aboutCapabilities", "Core capabilities", "The keywords under the introduction."),
          ],
        },
        {
          label: "Home - leadership",
          admin: {
            description:
              "The chairman's and director's messages on the front page, at /. " +
              "The carousel appears there as soon as the first message is saved. " +
              BILINGUAL_NOTE,
          },
          fields: [
            bilingual({ name: "leadershipKicker", label: "Kicker", defaultValue: "From our leadership" }),
            bilingual({
              name: "leadershipHeading",
              label: "Heading",
              description:
                "The heading sits inside the carousel and moves on with the message it belongs " +
                "to. This one is used for any message that has no heading of its own.",
            }),
            {
              name: "leadershipMessages",
              type: "array",
              label: "Messages",
              labels: { singular: "Message", plural: "Messages" },
              admin: {
                description:
                  "Shown one at a time on the homepage. The carousel moves on every five " +
                  "seconds, and visitors can step through with the arrows. Each message brings " +
                  "its own heading with it, so the heading changes as the carousel moves. " +
                  "A message is never machine-translated - somebody's own words are not " +
                  "something to guess at - so a Nepali box left empty here falls back to the " +
                  "English exactly as written.",
              },
              fields: [
                bilingual({
                  name: "role",
                  label: "Role",
                  required: true,
                  nepaliDescription: "Shown when the website is read in Nepali.",
                }),
                bilingual({
                  name: "name",
                  label: "Name",
                  required: true,
                  nepaliDescription: "Shown when the website is read in Nepali.",
                }),
                bilingual({
                  name: "heading",
                  label: "Heading shown with this message",
                  description:
                    "Replaces the leadership heading above while this message is on screen. " +
                    "Leave it empty to keep that one.",
                  nepaliDescription: "Shown when the website is read in Nepali.",
                }),
                bilingual({
                  name: "message",
                  type: "textarea",
                  label: "Message",
                  required: true,
                  description: "Leave a blank line between paragraphs.",
                  nepaliDescription:
                    "Shown when the website is read in Nepali, exactly as written. Leave a blank " +
                    "line between paragraphs.",
                }),
                { name: "photo", type: "upload", relationTo: "media" },
              ],
            },
          ],
        },
        {
          label: "Services page",
          admin: {
            description:
              "The heading and introduction above the service grid, at /services. " +
              "The services themselves are in Services -> Services. " +
              BILINGUAL_NOTE,
          },
          fields: [
            bilingual({ name: "servicesKicker", label: "Kicker", defaultValue: "Our Services" }),
            bilingual({ name: "servicesHeading", label: "Heading" }),
            bilingual({ name: "servicesIntro", type: "textarea", label: "Introduction" }),
            {
              name: "services",
              type: "array",
              admin: { description: `Drag to reorder the service cards. ${BILINGUAL_NOTE}` },
              fields: [
                bilingual({ name: "name", label: "Name", required: true }),
                {
                  name: "icon",
                  type: "select",
                  defaultValue: "newspaper",
                  options: [
                    "newspaper", "fileText", "messageSquare", "search", "camera",
                    "film", "megaphone", "video", "aperture", "clapperboard",
                    "scissors", "graduationCap",
                  ].map((value) => ({ label: value, value })),
                },
                { name: "href", type: "text", defaultValue: "/production" },
              ],
            },
          ],
        },
        {
          label: "Production page",
          admin: { description: `The band at the top of /production. ${BILINGUAL_NOTE}` },
          fields: [
            bilingual({ name: "productionChip", label: "Label", defaultValue: "Production" }),
            bilingual({ name: "productionHeading", label: "Heading" }),
            bilingual({ name: "productionBody", type: "textarea", label: "Body" }),
            bilingual({
              name: "productionCtaLabel",
              label: "Button text",
              defaultValue: "Start a Production",
            }),
          ],
        },
        {
          label: "Right Sanchar page",
          admin: { description: `The band at the top of /right-sanchar. ${BILINGUAL_NOTE}` },
          fields: [
            bilingual({ name: "sancharHeading", label: "Heading" }),
            bilingual({ name: "sancharIntro", type: "textarea", label: "Introduction" }),
            bilingualLabels("sancharTopics", "Topics", "The keywords printed on the portal card."),
          ],
        },
      ],
    },
  ],
};
