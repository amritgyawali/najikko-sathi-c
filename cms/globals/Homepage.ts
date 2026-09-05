import type { GlobalConfig } from "payload";
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
          label: "Services",
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
          fields: [
            { name: "productionChip", type: "text", defaultValue: "Production" },
            { name: "productionHeading", type: "text" },
            { name: "productionBody", type: "textarea" },
            { name: "productionCtaLabel", type: "text", defaultValue: "Start a Production" },
          ],
        },
        {
          label: "Right Sanchar",
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
