import type { GlobalConfig } from "payload";
import { isEditor } from "../access";
import { revalidateSite } from "../hooks/revalidate";

/**
 * A site-wide notice strip above the header - used for a campaign, a notice, or
 * an event. It can be scheduled, so it appears and disappears on its own.
 */
export const Announcement: GlobalConfig = {
  slug: "announcement",
  label: "Announcement bar",
  admin: {
    group: "Site",
    description:
      "A strip above the header, for a campaign or a notice. Switch it on, or give it dates and let it appear and disappear on its own.",
  },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Show the notice",
      defaultValue: false,
      admin: { description: "Nothing appears on the website until this is ticked." },
    },
    {
      name: "message",
      type: "text",
      admin: { description: "One sentence. It is read before anything else on the page." },
    },
    {
      type: "row",
      fields: [
        { name: "linkLabel", type: "text", admin: { width: "50%" } },
        { name: "linkHref", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "startsAt",
          type: "date",
          admin: { width: "50%", description: "Leave blank to show immediately." },
        },
        {
          name: "endsAt",
          type: "date",
          admin: { width: "50%", description: "Leave blank to show until switched off." },
        },
      ],
    },
    {
      name: "tone",
      type: "select",
      label: "Colour",
      admin: { description: "How loud the strip should look." },
      defaultValue: "info",
      options: [
        { label: "Information", value: "info" },
        { label: "Highlight", value: "highlight" },
        { label: "Urgent", value: "urgent" },
      ],
    },
  ],
};
