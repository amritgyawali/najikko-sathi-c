import type { Field, SelectField } from "payload";

import { placementOptions } from "../lib/placements";

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

/**
 * "Where this appears": the pages a document is published on.
 *
 * Every content collection carries this, so an editor writing a post, an offer,
 * a review, a question, a social responsibility entry, a team member or
 * uploading a photograph chooses in the same place which pages it belongs on.
 * The pages offered are the website's own (lib/placements.ts), so a page added
 * to the site turns up here by itself.
 *
 * Leaving it empty keeps the behaviour the site has always had: the document
 * appears wherever a section of its kind has been placed.
 */
export const placementsField = ({
  thing,
  everywhere,
  description,
  access,
}: {
  /** Names the content in the sentence shown under the field. */
  thing: string;
  /** Where an empty choice leaves it. */
  everywhere: string;
  /** Replaces the generated sentence outright. */
  description?: string;
  /** Field-level rules, for a collection the public can write to. */
  access?: SelectField["access"];
}): SelectField => ({
  name: "placements",
  type: "select",
  hasMany: true,
  index: true,
  label: "Where this appears",
  options: [...placementOptions],
  ...(access ? { access } : {}),
  admin: {
    position: "sidebar",
    description:
      description ?? `Choose the pages this ${thing} is published on. Leave it empty to show it ${everywhere}.`,
  },
});

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
