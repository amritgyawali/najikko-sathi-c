import type { GlobalConfig } from "payload";
import { isAdminField, isEditor } from "../access";

/** Company identity and contact details used across every page. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: { group: "Site", description: "Company name, contact details and identity." },
  access: { read: () => true, update: isEditor },
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
    { name: "logo", type: "upload", relationTo: "media" },
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
      fields: [{ name: "number", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "website", type: "text", admin: { width: "50%" } },
        { name: "websiteLabel", type: "text", admin: { width: "50%" } },
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
      fields: [
        { name: "platform", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "defaultSeo",
      type: "group",
      label: "Default SEO",
      access: { update: isAdminField },
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
