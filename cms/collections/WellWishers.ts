import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { placementsField, THUMB_CELL } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/**
 * The people who wish the company well: advisers, patrons, and the friends of
 * the house whose goodwill is worth showing.
 *
 * They are not the team (Content → Team) and they are not clients reviewing the
 * work (Content → Reviews), so they have a collection of their own. A portrait
 * and a name are enough; a line of goodwill is shown under it when one is
 * written.
 */
export const WellWishers: CollectionConfig = {
  slug: "well-wishers",
  labels: { singular: "Well-wisher", plural: "Well-wishers" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["photo", "name", "role", "order", "placements"],
    group: "Content",
    description: "Advisers, patrons and friends of the house, in the order set here.",
    listSearchableFields: ["name", "role", "message"],
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/"])],
    afterDelete: [revalidateDocAfterDelete("", ["/"])],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "role",
          type: "text",
          admin: {
            width: "50%",
            description: "Their title or organisation, as it should read on the page.",
          },
        },
      ],
    },
    {
      name: "message",
      type: "textarea",
      label: "Their words",
      maxLength: 400,
      admin: { rows: 3, description: "Optional. A sentence or two of goodwill." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      admin: {
        components: { Cell: THUMB_CELL },
        description: "Optional. Their initials are drawn in its place while there is none.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    placementsField({
      thing: "well-wisher",
      everywhere: "on every page that carries a well-wishers band",
    }),
  ],
};
