import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isEditor } from "../access";

/** The main navigation bar: links, order, and the header call-to-action. */
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: { group: "Site", description: "Reorder, add or remove the links in the navbar." },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Menu links",
      labels: { singular: "Link", plural: "Links" },
      required: true,
      admin: { description: "Drag to reorder. These appear left to right in the header." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", required: true, admin: { width: "40%" } },
            {
              name: "href",
              type: "text",
              required: true,
              label: "Address",
              admin: {
                width: "60%",
                description:
                  'A path such as "/about", or a full address for another website. Every page ' +
                  "this site has is listed on the dashboard home.",
              },
            },
          ],
        },
        { name: "newTab", type: "checkbox", label: "Open in a new tab" },
      ],
    },
    {
      name: "cta",
      type: "group",
      label: "Header button",
      admin: { description: "The one filled button at the right of the header." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", defaultValue: "Start a conversation", admin: { width: "50%" } },
            { name: "href", type: "text", label: "Address", defaultValue: "/contact", admin: { width: "50%" } },
          ],
        },
        { name: "enabled", type: "checkbox", label: "Show the button", defaultValue: true },
      ],
    },
    {
      name: "showUtilityBar",
      type: "checkbox",
      label: "Show the contact strip",
      defaultValue: true,
      admin: { description: "The thin line of phone, email and address above the header." },
    },
  ],
};
