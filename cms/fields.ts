import type { Field } from "payload";

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * URL segment for a document. Left blank, it is derived from the given field
 * so editors never have to think about it.
 */
export const slugField = (from = "title"): Field => ({
  name: "slug",
  type: "text",
  index: true,
  unique: true,
  admin: {
    position: "sidebar",
    description: "Leave blank to generate this from the title.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.length > 0) return toSlug(value);
        const source = (data as Record<string, unknown> | undefined)?.[from];
        return typeof source === "string" ? toSlug(source) : value;
      },
    ],
  },
});

/** Publishing state, shown in the sidebar of every content collection. */
export const statusField: Field = {
  name: "status",
  type: "select",
  required: true,
  defaultValue: "draft",
  index: true,
  options: [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ],
  admin: { position: "sidebar" },
};

/** Search-engine metadata. Falls back to the page title when left empty. */
export const seoField: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Overrides the title and description shown in search results." },
  fields: [
    { name: "title", type: "text" },
    { name: "description", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
  ],
};
