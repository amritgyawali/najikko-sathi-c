import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { THUMB_CELL } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/** People shown on the about page. */
export const TeamMembers: CollectionConfig = {
  slug: "team",
  labels: { singular: "Team member", plural: "Team" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["photo", "name", "role", "order"],
    group: "Content",
    description: "The people introduced on the about page, in the order set here.",
    listSearchableFields: ["name", "role"],
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/about"])],
    afterDelete: [revalidateDocAfterDelete("", ["/about"])],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "role",
          type: "text",
          required: true,
          admin: { width: "50%", description: "Their title, as it should read on the page." },
        },
      ],
    },
    {
      name: "bio",
      type: "textarea",
      label: "A line about them",
      admin: { rows: 3, description: "Optional. One or two sentences." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      admin: { components: { Cell: THUMB_CELL } },
    },
    { name: "email", type: "email" },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
  ],
};
