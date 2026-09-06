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

/**
 * A column that draws its value as a coloured pill rather than as plain text,
 * so a list can be read at a glance. Point any state-like column at this.
 */
export const STATE_CELL = "/cms/components/cells/StateCell#StateCell";

/** A column that shows the picture itself instead of the file's name. */
export const THUMB_CELL = "/cms/components/cells/ThumbCell#ThumbCell";

/**
 * Publishing state, shown in the sidebar of every content collection and as a
 * pill in its list.
 */
export const statusField: Field = {
  name: "status",
  type: "select",
  required: true,
  defaultValue: "draft",
  index: true,
  options: [
    { label: "Draft - only you can see it", value: "draft" },
    { label: "Published - live on the website", value: "published" },
  ],
  admin: {
    position: "sidebar",
    description: "Publishing puts this on the website; a draft stays here.",
    components: { Cell: STATE_CELL },
  },
};

const searchFields: Field[] = [
  { name: "title", type: "text" },
  { name: "description", type: "textarea" },
  { name: "image", type: "upload", relationTo: "media" },
];

const seoGroup = (fields: Field[]): Field => ({
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Overrides the title and description shown in search results." },
  fields,
});

/** Search-engine metadata. Falls back to the page title when left empty. */
export const seoField: Field = seoGroup(searchFields);

/**
 * The SEO group a page gets: the same fields, plus the tick that keeps a page
 * out of search engines. Only pages carry it, because only pages are listed in
 * the sitemap on their own account.
 */
export const pageSeoField: Field = seoGroup([
  ...searchFields,
  {
    name: "noindex",
    type: "checkbox",
    label: "Keep out of search engines",
    admin: {
      description:
        "The page stays on the website and keeps working. It asks not to be indexed, and it leaves the sitemap.",
    },
  },
]);
