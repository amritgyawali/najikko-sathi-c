import type { GlobalConfig } from "payload";
import { isEditor } from "../access";

/** Footer link columns and the closing copy. */
export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  admin: { group: "Site", description: "Footer columns, links and company blurb." },
  access: { read: () => true, update: isEditor },
  fields: [
    { name: "about", type: "textarea", label: "Company blurb" },
    {
      name: "groups",
      type: "array",
      label: "Link columns",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "copyright",
      type: "text",
      admin: { description: 'Leave blank to use "© <year> <company name> All Rights Reserved."' },
    },
  ],
};
