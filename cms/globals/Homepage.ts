import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isEditor } from "../access";

/**
 * The copy that is written here rather than in a collection, tab by tab.
 *
 * Each tab is named after the page it appears on, and lib/site-map.ts points
 * back at it from that page, so an editor opening the dashboard sees the same
 * page names a visitor sees in the navbar. Three of these bands started life on
 * the front page and now open pages of their own; the fields kept their names
 * so nothing anyone had written was lost when they moved.
 */
/**
 * Said under every Nepali field: the site is authored in English and translated
 * against a phrase book, but the leadership band is exempt from that, so these
 * are the only Nepali it will ever show.
 */
const NEPALI_NOTE =
  "Shown when the website is read in Nepali. Leave it empty to keep the English.";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage & page copy",
  admin: {
    group: "Site",
    description:
      "Written copy for the front page and for three pages that grew out of it. " +
      "Each tab says which address it appears at.",
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Home - hero",
          admin: { description: "The top of the front page, at /." },
          fields: [
            { name: "heroKicker", type: "text", defaultValue: "Kathmandu-based media house" },
            {
              name: "heroHeading",
              type: "text",
              required: true,
              defaultValue: "Media that stays close to what matters.",
            },
            { name: "heroBody", type: "textarea" },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              admin: { description: "Full-bleed background photograph." },
            },
            {
              type: "row",
              fields: [
                { name: "heroCtaLabel", type: "text", defaultValue: "Explore our services", admin: { width: "50%" } },
                { name: "heroCtaHref", type: "text", defaultValue: "/services", admin: { width: "50%" } },
              ],
            },
            {
              name: "brandPillars",
              type: "array",
              label: "Brand pillars",
              admin: { description: "The ring of keywords under the hero." },
              fields: [{ name: "label", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Home - about",
          admin: { description: "The introduction on the front page, at /." },
          fields: [
            { name: "aboutEyebrow", type: "text", defaultValue: "Who We Are" },
            { name: "aboutHeading", type: "text" },
            { name: "aboutQuote", type: "textarea" },
            { name: "aboutBody", type: "textarea", label: "First paragraph" },
            { name: "aboutBodySecondary", type: "textarea", label: "Second paragraph" },
            {
              name: "aboutParagraphs",
              type: "array",
              label: "Further paragraphs",
              labels: { singular: "Paragraph", plural: "Paragraphs" },
              admin: {
                description:
                  "Anything after the second paragraph. Drag to reorder; they read in this order.",
              },
              fields: [{ name: "text", type: "textarea", required: true }],
            },
            {
              name: "aboutCapabilities",
              type: "array",
              fields: [{ name: "label", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Home - leadership",
          admin: {
            description:
              "The chairman's and director's messages on the front page, at /. " +
              "The carousel appears there as soon as the first message is saved.",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "leadershipKicker",
                  type: "text",
                  defaultValue: "From our leadership",
                  admin: { width: "50%" },
                },
                {
                  name: "leadershipKickerNe",
                  type: "text",
                  label: "Leadership kicker in Nepali",
                  admin: { width: "50%", description: NEPALI_NOTE },
                },
              ],
            },
            {
              name: "leadershipHeading",
              type: "text",
              label: "Leadership heading",
              admin: {
                description:
                  "The heading sits inside the carousel and moves on with the message it belongs " +
                  "to. This one is used for any message that has no heading of its own.",
              },
            },
            {
              name: "leadershipHeadingNe",
              type: "text",
              label: "Leadership heading in Nepali",
              admin: { description: NEPALI_NOTE },
            },
            {
              name: "leadershipMessages",
              type: "array",
              label: "Messages",
              labels: { singular: "Message", plural: "Messages" },
              admin: {
                description:
                  "Shown one at a time on the homepage. The carousel moves on every five " +
                  "seconds, and visitors can step through with the arrows. Each message brings " +
                  "its own heading with it, so the heading changes as the carousel moves.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "role", type: "text", required: true, admin: { width: "50%" } },
                    { name: "name", type: "text", required: true, admin: { width: "50%" } },
                  ],
                },
                {
                  name: "heading",
                  type: "text",
                  label: "Heading shown with this message",
                  admin: {
                    description:
                      "Replaces the leadership heading above while this message is on screen. " +
                      "Leave it empty to keep that one.",
                  },
                },
                {
                  name: "message",
                  type: "textarea",
                  required: true,
                  admin: { description: "Leave a blank line between paragraphs." },
                },
                { name: "photo", type: "upload", relationTo: "media" },
                {
                  type: "collapsible",
                  label: "Nepali version of this message",
                  admin: {
                    initCollapsed: true,
                    description:
                      "What a visitor reads after pressing ने. This band is never translated " +
                      "automatically - a message in someone's own words is not something to guess " +
                      "at - so whatever is written here is exactly what is shown. Anything left " +
                      "empty falls back to the English above rather than to a machine translation.",
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "roleNe",
                          type: "text",
                          label: "Role in Nepali",
                          admin: { width: "50%" },
                        },
                        {
                          name: "nameNe",
                          type: "text",
                          label: "Name in Nepali",
                          admin: { width: "50%" },
                        },
                      ],
                    },
                    {
                      name: "headingNe",
                      type: "text",
                      label: "Heading in Nepali",
                    },
                    {
                      name: "messageNe",
                      type: "textarea",
                      label: "Message in Nepali",
                      admin: { description: "Leave a blank line between paragraphs." },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Services page",
          admin: {
            description:
              "The heading and introduction above the service grid, at /services. " +
              "The services themselves are in Services -> Services.",
          },
          fields: [
            { name: "servicesKicker", type: "text", defaultValue: "Our Services" },
            { name: "servicesHeading", type: "text" },
            { name: "servicesIntro", type: "textarea" },
            {
              name: "services",
              type: "array",
              admin: { description: "Drag to reorder the service cards." },
              fields: [
                { name: "name", type: "text", required: true },
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
          admin: { description: "The band at the top of /production." },
          fields: [
            { name: "productionChip", type: "text", defaultValue: "Production" },
            { name: "productionHeading", type: "text" },
            { name: "productionBody", type: "textarea" },
            { name: "productionCtaLabel", type: "text", defaultValue: "Start a Production" },
          ],
        },
        {
          label: "Right Sanchar page",
          admin: { description: "The band at the top of /right-sanchar." },
          fields: [
            { name: "sancharHeading", type: "text" },
            { name: "sancharIntro", type: "textarea" },
            {
              name: "sancharTopics",
              type: "array",
              fields: [{ name: "label", type: "text", required: true }],
            },
          ],
        },
      ],
    },
  ],
};
