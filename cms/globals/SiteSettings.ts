import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isAdminField, isEditor } from "../access";
import { advancedTab, layoutTab, sectionStylesTab, typographyTab } from "./site-style-fields";

/**
 * The one screen the whole website answers to.
 *
 * It began as the company's name and telephone number, and it is now also where
 * the site's type, spacing, motion, search-engine details and the tools that act
 * on everything at once live - so an owner has one place to look rather than
 * six. The colours are the exception: they have a screen of their own in
 * Site → Appearance, and keeping them there keeps one value in one place.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: {
    group: "Site",
    description:
      "Who the company is, how to reach it, how the website is set and sized, and the tools that work on all of it at once.",
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identity",
          description: "The company's name and mark, as they appear across the website.",
          fields: [
            {
              type: "row",
              fields: [
                { name: "legalName", type: "text", required: true, admin: { width: "50%" } },
                { name: "shortName", type: "text", required: true, admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "initials",
                  type: "text",
                  required: true,
                  maxLength: 4,
                  admin: { width: "25%", description: "Shown in the logo mark." },
                },
                { name: "address", type: "text", required: true, admin: { width: "75%" } },
              ],
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Replaces the initials mark in the header, the media system wheel and the footer.",
              },
            },
          ],
        },
        {
          label: "Contact",
          description: "How people reach the company. These appear on the contact page and in the footer.",
          fields: [
            {
              type: "row",
              fields: [
                { name: "email", type: "email", required: true, admin: { width: "50%" } },
                { name: "vat", type: "text", label: "VAT number", admin: { width: "50%" } },
              ],
            },
            {
              name: "phones",
              type: "array",
              labels: { singular: "Phone number", plural: "Phone numbers" },
              admin: { description: "Shown in the order listed here." },
              fields: [{ name: "number", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Links",
          description: "This website's own address, and the news portal it links out to.",
          fields: [
            {
              type: "row",
              fields: [
                { name: "website", type: "text", admin: { width: "50%" } },
                {
                  name: "websiteLabel",
                  type: "text",
                  admin: { width: "50%", description: "How the address is written out." },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "rightSanchar", type: "text", label: "Right Sanchar URL", admin: { width: "50%" } },
                { name: "rightSancharLabel", type: "text", label: "Right Sanchar label", admin: { width: "50%" } },
              ],
            },
            {
              name: "socialLinks",
              type: "array",
              labels: { singular: "Social link", plural: "Social links" },
              admin: { description: 'For example "Facebook" and the page\'s address.' },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "platform", type: "text", required: true, admin: { width: "35%" } },
                    { name: "url", type: "text", required: true, admin: { width: "65%" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Search results",
          description: "What search engines and social networks show for a page with nothing of its own.",
          fields: [
            {
              name: "defaultSeo",
              type: "group",
              label: false,
              access: { update: isAdminField },
              fields: [
                { name: "title", type: "text" },
                { name: "description", type: "textarea" },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  admin: { description: "Used when a page has no picture of its own. Landscape works best." },
                },
              ],
            },
            {
              name: "seo",
              type: "group",
              label: "Search engines and social networks",
              access: { update: isAdminField },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "keywords",
                      type: "text",
                      admin: {
                        width: "50%",
                        description:
                          "Words describing the company, separated by commas. Most search engines ignore these now; some social tools still read them.",
                      },
                    },
                    {
                      name: "twitterHandle",
                      type: "text",
                      label: "X / Twitter handle",
                      admin: { width: "50%", description: 'With the @, for example "@najikkosathi".' },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "googleVerification",
                      type: "text",
                      label: "Google Search Console code",
                      admin: {
                        width: "50%",
                        description: 'The value from Google\'s "HTML tag" verification method.',
                      },
                    },
                    {
                      name: "bingVerification",
                      type: "text",
                      label: "Bing Webmaster code",
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "analyticsId",
                      type: "text",
                      label: "Google Analytics measurement id",
                      validate: (value: unknown) =>
                        !value || (typeof value === "string" && /^(G|UA|GTM)-[A-Z0-9-]{4,20}$/i.test(value.trim()))
                          ? true
                          : "That is not a measurement id. They look like G-XXXXXXX.",
                      admin: {
                        width: "50%",
                        description:
                          "Leave empty and no tracking script is loaded at all. The site counts its own visits either way - see Traffic on the dashboard.",
                      },
                    },
                    {
                      name: "noindex",
                      type: "checkbox",
                      label: "Ask search engines to leave the whole site alone",
                      admin: {
                        width: "50%",
                        description:
                          "For a site that is not ready to be found yet. Remember to turn it off on the day you launch.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        typographyTab,
        sectionStylesTab,
        layoutTab,
        advancedTab,
      ],
    },
  ],
};
