import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor, isPublishedOrStaff } from "../access";
import { layoutBlocks } from "../blocks";
import { pageSeoField, slugField, statusField } from "../fields";

/**
 * Every page on the website, in one place.
 *
 * Two kinds of page live here and are edited identically:
 *
 * - **Website pages** (`kind: "route"`) are the pages the site ships with -
 *   Home, Services, Our Work, Contact, About, and the discipline pages. Their
 *   address is fixed by the code that serves it, and their sections start out
 *   as the copy in lib/page-defaults.ts. Import one (Dashboard → Website pages,
 *   or `npm run sync:pages`) and every word on it becomes editable here.
 *   Delete it again and the page returns to the copy it shipped with.
 *
 * - **New pages** (`kind: "custom"`) are invented in the dashboard and go live
 *   at /<slug> as soon as they are published, with no deploy.
 *
 * Setting a page to Draft takes it off the website: the address stops
 * answering, and it leaves the menu and the sitemap. Publishing it puts it
 * back.
 */

/**
 * A page's address. New pages take it from their slug; a built-in page keeps
 * the address its route serves, which is why that field is filled in by the
 * import rather than by hand.
 */
const derivePath: CollectionBeforeChangeHook = ({ data }) => {
  if (data.kind === "route") return data;
  const slug = typeof data.slug === "string" ? data.slug.trim() : "";
  return { ...data, path: slug ? `/${slug}` : data.path };
};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "path", "kind", "status", "updatedAt"],
    group: "Content",
    description:
      "Every page on the website. Edit the words on a built-in page, build a new one from sections, or take one off the site.",
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    beforeChange: [derivePath],
    // A page can appear in the menu and the sitemap, so the whole site is purged.
    afterChange: [revalidateDoc("", ["/"])],
    afterDelete: [revalidateDocAfterDelete("", ["/"])],
  },

  fields: [
    { name: "title", type: "text", required: true, admin: { description: "Shown in the menu and in breadcrumbs." } },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "custom",
      index: true,
      options: [
        { label: "Website page", value: "route" },
        { label: "New page", value: "custom" },
      ],
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "A website page is one the site ships with; deleting it here restores the copy it shipped with. A new page is one built in the dashboard.",
      },
    },
    {
      name: "path",
      type: "text",
      index: true,
      unique: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "The address this page answers at. New pages take it from the slug below.",
      },
    },
    slugField(),
    statusField,
    {
      name: "showInNav",
      type: "checkbox",
      admin: {
        position: "sidebar",
        description: "Add a link to this page in the main navigation.",
      },
    },
    {
      name: "navOrder",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Position in the menu, left to right. Leave empty to place it after the numbered links.",
      },
    },
    {
      name: "parent",
      type: "text",
      admin: {
        position: "sidebar",
        description:
          'The address of the menu item this page sits under, for example "/our-work". The menu highlights that item while a visitor is here.',
      },
    },
    {
      name: "summary",
      type: "textarea",
      admin: { description: "One line describing the page. Shown on the dashboard's page list." },
    },
    {
      name: "layout",
      label: "Sections",
      type: "blocks",
      minRows: 1,
      blocks: layoutBlocks,
      admin: {
        description:
          "Everything on the page, top to bottom. Add, reorder, rewrite or remove a section and the website follows.",
      },
    },
    pageSeoField,
  ],
};
