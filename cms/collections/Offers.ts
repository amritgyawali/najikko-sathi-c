import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor, isPublishedOrStaff } from "../access";
import { placementsField, slugField, statusField, THUMB_CELL } from "../fields";

/** Promotions and packages, with an optional run window. */
export const Offers: CollectionConfig = {
  slug: "offers",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["image", "title", "status", "startsAt", "endsAt"],
    group: "Content",
    description:
      "Promotions, packages and limited-time offers. A published offer inside its dates appears at /offers.",
    listSearchableFields: ["title", "summary"],
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("/offers", ["/", "/offers"])],
    afterDelete: [revalidateDocAfterDelete("/offers", ["/", "/offers"])],
  },

  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    statusField,
    placementsField({ thing: "offer", everywhere: "on every page that lists offers" }),
    {
      name: "publishAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Optional. The offer stays hidden until this time.",
      },
    },
    {
      name: "unpublishAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Optional. The offer disappears from the site after this time.",
      },
    },
    {
      name: "badge",
      type: "text",
      admin: { description: 'Short highlight, for example "20% off" or "New".' },
    },
    { name: "summary", type: "textarea", required: true },
    { name: "details", type: "richText" },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      admin: { components: { Cell: THUMB_CELL } },
    },
    {
      type: "row",
      fields: [
        { name: "startsAt", type: "date", admin: { width: "50%" } },
        {
          name: "endsAt",
          type: "date",
          admin: { width: "50%", description: "Leave blank for an ongoing offer." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "ctaLabel", type: "text", defaultValue: "Enquire now", admin: { width: "50%" } },
        { name: "ctaHref", type: "text", defaultValue: "/contact", admin: { width: "50%" } },
      ],
    },
  ],
};
