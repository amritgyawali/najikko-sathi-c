import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { revalidateSite } from "../hooks/revalidate";

/**
 * URL redirects, applied by middleware. Lets an editor retire or rename a page
 * without breaking links that are already published elsewhere.
 */
export const Redirects: CollectionConfig = {
  slug: "redirects",
  admin: {
    useAsTitle: "from",
    defaultColumns: ["from", "to", "permanent"],
    group: "Administration",
    description: "Send an old URL to a new one.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [({ doc }) => { revalidateSite({ doc } as never); return doc; }],
  },
  fields: [
    {
      name: "from",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The old path, starting with "/", e.g. "/old-services".' },
    },
    {
      name: "to",
      type: "text",
      required: true,
      admin: { description: 'Where to send it: a path such as "/services", or a full URL.' },
    },
    {
      name: "permanent",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Permanent (301) tells search engines the move is final." },
    },
  ],
};
