import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { BILINGUAL_NOTE, bilingual } from "../bilingual";
import { placementsField } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/**
 * Reusable questions and answers. Each row picks the pages it belongs to, and
 * the site publishes them with FAQ structured data so they can appear as rich
 * results in search.
 *
 * A question used to sit on exactly one of four pages. It can now be published
 * to any number of the website's pages, chosen in the same "Where this appears"
 * list every other kind of content uses.
 */
export const Faqs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "placements", "order"],
    group: "Content",
    description:
      "Questions and answers. Each one picks the pages it belongs to, and search engines can show them as rich results. " +
      BILINGUAL_NOTE,
    listSearchableFields: ["question", "answer"],
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/", "/services", "/our-work", "/contact", "/training", "/production"])],
    afterDelete: [revalidateDocAfterDelete("", ["/", "/services", "/our-work", "/contact", "/training", "/production"])],
  },
  fields: [
    bilingual({ name: "question", label: "Question", required: true }),
    bilingual({ name: "answer", type: "textarea", label: "Answer", required: true }),
    placementsField({
      thing: "question",
      everywhere: "on every page that carries a questions band",
    }),
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
  ],
};
