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
            { name: "aboutBody", type: "textarea" },
            { name: "aboutBodySecondary", type: "textarea" },
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
            { name: "leadershipKicker", type: "text", defaultValue: "From our leadership" },
            { name: "leadershipHeading", type: "text" },
            {
              name: "leadershipMessages",
              type: "array",
              label: "Messages",
              labels: { singular: "Message", plural: "Messages" },
              admin: {
                description:
                  "Shown one at a time on the homepage. The carousel moves on every five " +
                  "seconds, and visitors can step through with the arrows.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "role", type: "text", required: true, admin: { width: "50%" } },
                    { name: "name", type: "text", required: true, admin: { width: "50%" } },
                  ],
                },
                { name: "heading", type: "text", label: "Message title" },
                { name: "message", type: "textarea", required: true },
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
