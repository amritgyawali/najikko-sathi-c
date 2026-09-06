import type { GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isEditor } from "../access";

/** Footer link columns and the closing copy. */
export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  admin: {
    group: "Site",
    description: "The columns of links and the company line at the foot of every page.",
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "about",
      type: "textarea",
      label: "Company blurb",
      admin: { description: "The paragraph in the first footer column. Two or three lines reads best." },
    },
    {
      name: "groups",
      type: "array",
      label: "Link columns",
      labels: { singular: "Column", plural: "Columns" },
      admin: {
        description: "Each one is a column in the footer, in the order listed here.",
        initCollapsed: true,
      },
      fields: [
        { name: "title", type: "text", required: true, admin: { description: "The heading above the column." } },
        {
          name: "links",
          type: "array",
          labels: { singular: "Link", plural: "Links" },
          fields: [
            {
              type: "row",
              fields: [
                { name: "label", type: "text", required: true, admin: { width: "45%" } },
                {
                  name: "href",
                  type: "text",
                  required: true,
                  label: "Address",
                  admin: { width: "55%", description: 'A path such as "/services", or a full address.' },
                },
              ],
            },
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
