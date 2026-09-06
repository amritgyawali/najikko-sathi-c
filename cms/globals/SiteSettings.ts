import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isAdminField, isEditor } from "../access";

/** Company identity and contact details used across every page. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: { group: "Site", description: "Company name, contact details and identity." },
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
          ],
        },
      ],
    },
  ],
};
