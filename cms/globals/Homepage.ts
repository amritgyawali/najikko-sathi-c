import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isEditor } from "../access";

/**
 * Every piece of copy on the existing homepage, section by section. The names
 * mirror the sections in app/(frontend)/page.tsx so the mapping stays obvious.
 */
export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: { group: "Site", description: "All the text and imagery on the front page." },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
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
                { name: "heroCtaHref", type: "text", defaultValue: "#services", admin: { width: "50%" } },
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
          label: "About",
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
          label: "Leadership",
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
          label: "Services",
          admin: {
            description:
              "This grid moved off the homepage and now opens the services page.",
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
                { name: "href", type: "text", defaultValue: "#production" },
              ],
            },
          ],
        },
        {
          label: "Production",
          admin: { description: "This band moved off the homepage and now opens the production page." },
          fields: [
            { name: "productionChip", type: "text", defaultValue: "Production" },
            { name: "productionHeading", type: "text" },
            { name: "productionBody", type: "textarea" },
            { name: "productionCtaLabel", type: "text", defaultValue: "Start a Production" },
          ],
        },
        {
          label: "Right Sanchar",
          admin: { description: "This band moved off the homepage and now opens the Right Sanchar page." },
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
