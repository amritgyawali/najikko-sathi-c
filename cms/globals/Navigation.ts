import type { GlobalConfig } from "payload";
import { isEditor } from "../access";

/** The main navigation bar: links, order, and the header call-to-action. */
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: { group: "Site", description: "Reorder, add or remove the links in the navbar." },
  access: { read: () => true, update: isEditor },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      admin: { description: "Drag to reorder. These appear left to right in the header." },
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "href",
          type: "text",
          required: true,
          admin: { description: 'Section anchor such as "#services", or a path such as "/about".' },
        },
        { name: "newTab", type: "checkbox", label: "Open in a new tab" },
      ],
    },
    {
      name: "cta",
      type: "group",
      label: "Header button",
      fields: [
        { name: "label", type: "text", defaultValue: "Start a conversation" },
        { name: "href", type: "text", defaultValue: "#contact" },
        { name: "enabled", type: "checkbox", defaultValue: true },
      ],
    },
    {
      name: "showUtilityBar",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "The thin contact strip above the header." },
    },
  ],
};
