import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { placementsField } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/** People shown on the about page. */
export const TeamMembers: CollectionConfig = {
  slug: "team",
  labels: { singular: "Team member", plural: "Team" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order", "placements"],
    group: "Content",
    description: "The people introduced on the about page.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/about"])],
    afterDelete: [revalidateDocAfterDelete("", ["/about"])],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "bio", type: "textarea" },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "email", type: "email" },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    placementsField({ thing: "person", everywhere: "on every page that carries a team band" }),
  ],
};
