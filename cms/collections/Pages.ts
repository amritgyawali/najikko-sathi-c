import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor, isPublishedOrStaff } from "../access";
import { layoutBlocks } from "../blocks";
import { seoField, slugField, statusField } from "../fields";

/**
 * Arbitrary website pages assembled from layout blocks. Creating a page here
 * makes it live at /<slug> immediately, with no deploy required.
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status", "updatedAt"],
    group: "Content",
    description: "Build new website pages by stacking layout blocks.",
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("", ["/"])],
    afterDelete: [revalidateDocAfterDelete("", ["/"])],
  },

  fields: [
    { name: "title", type: "text", required: true },
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
      name: "layout",
      type: "blocks",
      minRows: 1,
      blocks: layoutBlocks,
      admin: { description: "Add, reorder and remove sections to compose the page." },
    },
    seoField,
  ],
};
