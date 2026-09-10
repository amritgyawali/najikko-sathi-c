import type { Block, Field } from "payload";

import { BILINGUAL_NOTE, bilingual, bilingualFields } from "./bilingual";
import { placementOptions } from "../lib/placements";
import { sectionIcons } from "../lib/section-icons";

/**
 * The sections a page is made of.
 *
 * Every band on every page of the website - the hero at the top, the prose, the
 * card grids, the numbered process, the questions, the photo and film showcase,
 * the closing call to action - is one of these. A page in the dashboard is an
 * ordered list of them, so an editor can rewrite any word, reorder a page, drop
 * a section, or add another without touching code.
 *
 * app/(frontend)/_components/PageSections.tsx renders each of these, and
 * lib/page-defaults.ts holds the sections every built-in page ships with, so a
 * page reads identically before and after it is imported into the dashboard.
 *
 * Every line of copy in every section is written twice, English beside Nepali
 * in the same row of the form (cms/bilingual.ts). Nothing is folded away and
 * nothing is required: a Nepali box left empty keeps the English, translated
 * against the phrase book exactly as it was before.
 */

/**
 * Every heading band starts the same way: a small kicker, then a title, then a
 * line or two under it - each of them in both languages, side by side.
 */
const headingFields: Field[] = bilingualFields(
  { name: "kicker", label: "Kicker", description: "The small label above the heading." },
  { name: "heading", label: "Heading" },
  {
    name: "description",
    type: "textarea",
    label: "Description",
    description: "One or two lines under the heading.",
  },
);

/**
 * A link: its words in both languages, then the address it points at. The
 * address is the same in either language, so it is not paired.
 */
const linkFields = (label = "Link"): Field[] => [
  bilingual({ name: "linkLabel", label: `${label} text` }),
  { name: "linkHref", type: "text", label: `${label} address` },
];

const iconField: Field = {
  name: "icon",
  type: "select",
  options: [...sectionIcons],
  admin: { description: "Drawn above the title." },
};

/** The band across the top of a page: breadcrumb, title, and one action. */
export const PageHeroSection: Block = {
  slug: "pageHero",
  fields: [
    bilingual({
      name: "eyebrow",
      label: "Line above the title",
      required: true,
      description: "The line above the title.",
    }),
    // The photograph beside the title is a Page media entry rather than a
    // field here, so it can be changed without opening the page's sections.
    bilingual({
      name: "heading",
      label: "Title",
      required: true,
      description:
        'A photograph can be put beside the title from Content → Page media, in this page\'s "-hero" entry. Without one the words span the whole band.',
    }),
    bilingual({ name: "description", type: "textarea", label: "Description" }),
    bilingual({ name: "ctaLabel", label: "Button text" }),
    {
      type: "row",
      fields: [
        { name: "ctaHref", type: "text", label: "Button address", admin: { width: "60%" } },
        {
          name: "ctaExternal",
          type: "checkbox",
          label: "Opens another site",
          admin: {
            width: "40%",
            description:
              "Leave the address empty as well to send people to the Right Sanchar address in Site settings.",
          },
        },
      ],
    },
    {
      name: "category",
      type: "text",
      admin: {
        description:
          'Optional service category id (for example "production"), which colours the hero emblem.',
      },
    },
  ],
};

/** Written copy: a heading, a lead paragraph, then any number of paragraphs. */
export const ProseSection: Block = {
  slug: "prose",
  labels: { singular: "Written section", plural: "Written sections" },
  fields: [
    ...headingFields,
    bilingual({
      name: "lead",
      type: "textarea",
      label: "Opening paragraph",
      description: "The opening paragraph, set larger.",
    }),
    {
      name: "paragraphs",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      admin: { description: BILINGUAL_NOTE },
      fields: [bilingual({ name: "text", type: "textarea", label: "Paragraph", required: true })],
    },
    ...linkFields(),
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
      admin: { description: "A tinted band sets the section apart from the white ones around it." },
    },
  ],
};

/** The about page's opening: the identity panel beside the written story. */
export const IdentityStorySection: Block = {
  slug: "identityStory",
  labels: { singular: "Identity & story", plural: "Identity & story" },
  fields: [
    bilingual({
      name: "panelQuote",
      type: "textarea",
      label: "Quotation in the panel",
      description: "The quotation inside the panel. The company name and address come from Site settings.",
    }),
    ...headingFields,
    bilingual({ name: "lead", type: "textarea", label: "Opening paragraph" }),
    {
      name: "paragraphs",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      admin: { description: BILINGUAL_NOTE },
      fields: [bilingual({ name: "text", type: "textarea", label: "Paragraph", required: true })],
    },
    ...linkFields(),
  ],
};

/** Cards. The style decides whether they are values, disciplines or topics. */
export const FeatureCardsSection: Block = {
  slug: "featureCards",
  labels: { singular: "Card section", plural: "Card sections" },
  fields: [
    ...headingFields,
    {
      name: "style",
      type: "select",
      required: true,
      defaultValue: "values",
      options: [
        { label: "Values - icon, title, text", value: "values" },
        { label: "Disciplines - icon, text and a tick list", value: "disciplines" },
        { label: "Topics - title and text only", value: "topics" },
        { label: "Links - a card per page, each one clickable", value: "links" },
      ],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      labels: { singular: "Card", plural: "Cards" },
      admin: { description: BILINGUAL_NOTE },
      fields: [
        iconField,
        bilingual({ name: "title", label: "Title", required: true }),
        bilingual({ name: "text", type: "textarea", label: "Text" }),
        {
          name: "points",
          type: "array",
          labels: { singular: "Tick", plural: "Ticks" },
          admin: { description: "Shown as a ticked list on the discipline style." },
          fields: [bilingual({ name: "text", label: "Tick", required: true })],
        },
        ...linkFields("Card link"),
      ],
    },
    {
      name: "chips",
      type: "array",
      label: "Keywords under the cards",
      labels: { singular: "Keyword", plural: "Keywords" },
      admin: { description: BILINGUAL_NOTE },
      fields: [bilingual({ name: "text", label: "Keyword", required: true })],
    },
  ],
};

/** The numbered "how the work runs" band. */
export const ProcessStepsSection: Block = {
  slug: "processSteps",
  labels: { singular: "Numbered steps", plural: "Numbered steps" },
  fields: [
    ...headingFields,
    {
      name: "steps",
      type: "array",
      minRows: 1,
      labels: { singular: "Step", plural: "Steps" },
      admin: { description: BILINGUAL_NOTE },
      fields: [
        bilingual({ name: "title", label: "Step title", required: true }),
        bilingual({ name: "text", type: "textarea", label: "Step text", required: true }),
      ],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/** Questions and answers. Anything in the FAQs collection wins over the list here. */
export const FaqSection: Block = {
  slug: "faqSection",
  labels: { singular: "Questions", plural: "Questions" },
  fields: [
    ...headingFields,
    {
      name: "placement",
      type: "select",
      label: "Show the questions published to",
      options: [...placementOptions],
      admin: {
        description:
          "Questions saved in Content → FAQs replace the list below: the ones published to this page, " +
          "plus the ones published to the page named here. Leave this empty to use the questions " +
          "published to this page, and the list below when there are none.",
      },
    },
    {
      name: "items",
      type: "array",
      labels: { singular: "Question", plural: "Questions" },
      admin: { description: BILINGUAL_NOTE },
      fields: [
        bilingual({ name: "question", label: "Question", required: true }),
        bilingual({ name: "answer", type: "textarea", label: "Answer", required: true }),
      ],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/** A grid of services drawn from Content → Services. */
export const ServiceCardsSection: Block = {
  slug: "serviceCards",
  labels: { singular: "Service cards", plural: "Service cards" },
  fields: [
    ...headingFields,
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "category",
      options: [
        { label: "Every service in a category", value: "category" },
        { label: "A chosen list of services", value: "slugs" },
        { label: "Every service", value: "all" },
      ],
    },
    {
      name: "category",
      type: "text",
      admin: {
        condition: (_, siblings) => siblings?.source === "category",
        description: 'The category id, for example "production" or "training".',
      },
    },
    {
      name: "slugs",
      type: "array",
      labels: { singular: "Service", plural: "Services" },
      admin: { condition: (_, siblings) => siblings?.source === "slugs" },
      fields: [{ name: "slug", type: "text", required: true }],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/** The photo and film band, filled in from Content → Page media. */
export const MediaShowcaseSection: Block = {
  slug: "mediaShowcase",
  labels: { singular: "Photo & film band", plural: "Photo & film bands" },
  fields: [
    {
      name: "mediaKey",
      type: "text",
      required: true,
      admin: { description: 'The Page media entry to show, for example "about".' },
    },
    bilingual({
      name: "heading",
      label: "Heading",
      description: "Names the band: “<title> in pictures & film”.",
    }),
    bilingual({
      name: "kicker",
      label: "Kicker",
      description:
        "The small label above the heading. Left empty, the page uses its own wording rather than one label shared by every page.",
    }),
    bilingual({
      name: "description",
      type: "textarea",
      label: "Description",
      description:
        "One line under the heading, saying what is in this page's pictures. Left empty, the page uses its own wording; a page with none prints no line at all.",
    }),
  ],
};

/** The closing band that sends a reader to the contact form. */
export const ContactCtaSection: Block = {
  slug: "contactCta",
  labels: { singular: "Closing call to action", plural: "Closing calls to action" },
  fields: [
    bilingual({ name: "heading", label: "Heading", required: true }),
    bilingual({ name: "description", type: "textarea", label: "Description" }),
    {
      name: "service",
      type: "text",
      admin: { description: "Preselects this service on the contact form." },
    },
  ],
};

/** Address, phones and email beside the enquiry form. */
export const ContactDetailsSection: Block = {
  slug: "contactDetails",
  labels: { singular: "Contact details & form", plural: "Contact details & forms" },
  fields: [
    ...headingFields,
    bilingual({
      name: "note",
      type: "textarea",
      label: "Note",
      description: "The line under the company name and VAT number.",
    }),
    ...linkFields("Map link"),
    { name: "showForm", type: "checkbox", defaultValue: true, label: "Show the enquiry form" },
  ],
};

/** The team, from Content → Team. Hidden while nobody has been added. */
export const TeamSection: Block = {
  slug: "teamSection",
  labels: { singular: "Team", plural: "Teams" },
  fields: headingFields,
};

/** Client testimonials, from Content → Reviews. Hidden while there are none. */
export const ReviewsSection: Block = {
  slug: "reviewsSection",
  labels: { singular: "Reviews", plural: "Reviews" },
  fields: [
    ...headingFields,
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "featured",
      options: [
        { label: "Featured reviews only", value: "featured" },
        { label: "Every approved review", value: "all" },
      ],
      admin: { description: "Only approved reviews are ever shown." },
    },
    { name: "limit", type: "number", defaultValue: 6, min: 1, max: 24 },
    {
      name: "tone",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/** The people who wish the company well, from Content → Well-wishers. */
export const WellWishersSection: Block = {
  slug: "wellWishersSection",
  labels: { singular: "Well-wishers", plural: "Well-wishers" },
  fields: [
    ...headingFields,
    {
      name: "tone",
      type: "select",
      defaultValue: "tinted",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/**
 * The band of client and partner logos that slides across the front page.
 *
 * The names are typed in the dashboard and a logo uploaded beside each one. A
 * partner with no logo yet is drawn as its name, so the band reads correctly
 * from the moment it is filled in rather than waiting on artwork.
 */
export const PartnerMarqueeSection: Block = {
  slug: "partnerMarquee",
  labels: { singular: "Partner logos", plural: "Partner logo bands" },
  fields: [
    bilingual({
      name: "heading",
      label: "Heading",
      defaultValue: "We worked with",
      description: "The line above the logos.",
    }),
    {
      name: "partners",
      type: "array",
      labels: { singular: "Partner", plural: "Partners" },
      admin: {
        description:
          "Drag to reorder. The row slides on by itself and pauses when a visitor points at it.",
      },
      fields: [
        bilingual({ name: "name", label: "Name", required: true }),
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          filterOptions: { mimeType: { contains: "image" } },
          admin: { description: "Optional. The name is shown until a logo is uploaded." },
        },
        {
          name: "href",
          type: "text",
          label: "Website",
          admin: { description: "Optional. Makes the logo a link, opened in a new tab." },
        },
      ],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "tinted",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Tinted band", value: "tinted" },
      ],
    },
  ],
};

/** The social responsibility films and albums, from their own collection. */
export const SocialResponsibilitySection: Block = {
  slug: "socialResponsibilitySection",
  labels: { singular: "Social responsibility", plural: "Social responsibility" },
  fields: headingFields,
};

/**
 * The social work albums and films, from Content → Social Work. Hidden while
 * nothing has been published there.
 */
export const SocialWorkSection: Block = {
  slug: "socialWorkSection",
  labels: { singular: "Social work", plural: "Social work" },
  fields: [
    ...headingFields,
    {
      name: "emptyNote",
      type: "text",
      label: "Where this is written",
      admin: {
        readOnly: true,
        description:
          "Each entry - its title, what it is about, its photographs and its videos - is added " +
          "in Content → Social Work. This band shows everything published there.",
      },
    },
  ],
};

/** The row of links that jumps to each category further down the page. */
export const CategoryBarSection: Block = {
  slug: "categoryBar",
  labels: { singular: "Category jump bar", plural: "Category jump bars" },
  fields: [
    {
      name: "ariaLabel",
      type: "text",
      label: "Described to screen readers as",
      defaultValue: "Service categories",
    },
  ],
};

/** One section per service category, each listing the services inside it. */
export const CategoryGroupsSection: Block = {
  slug: "categoryGroups",
  labels: { singular: "Category sections", plural: "Category sections" },
  fields: [
    {
      name: "note",
      type: "text",
      label: "Where this is written",
      admin: {
        readOnly: true,
        description:
          "One section per category in Content → Service categories, listing the services filed under it.",
      },
    },
  ],
};

/**
 * The three bands whose copy lives in Site → Homepage & page copy, plus the
 * homepage's own hero, introduction and leadership carousel. They are listed
 * here so a page can carry, move or drop them; the words themselves stay where
 * they are already written.
 */
const globalCopyNote = (tab: string): string =>
  `The words in this band are written in Site → Homepage & page copy, on the "${tab}" tab.`;

export const HomeHeroSection: Block = {
  slug: "homeHero",
  labels: { singular: "Front page hero", plural: "Front page heroes" },
  fields: [
    bilingual({
      name: "secondaryLabel",
      label: "Second button",
      description:
        "Leave this empty and the hero carries one button. Write a label and a second " +
        "button appears beside it, pointing at the Right Sanchar link in Site settings. " +
        globalCopyNote("Home - hero"),
    }),
    { name: "showMediaSystem", type: "checkbox", defaultValue: true, label: "Show the media system wheel" },
  ],
};

export const HomeAboutSection: Block = {
  slug: "homeAbout",
  labels: { singular: "Front page introduction", plural: "Front page introductions" },
  fields: [
    ...linkFields(),
    bilingual({
      name: "captionTitle",
      label: "Photograph caption",
      description: `The caption on the photograph beside the introduction, shown only once one has been uploaded into the "home-about" Page media entry. ${globalCopyNote("Home - about")}`,
    }),
  ],
};

export const LeadershipSection: Block = {
  slug: "leadershipSection",
  labels: { singular: "Leadership messages", plural: "Leadership messages" },
  fields: [
    {
      name: "note",
      type: "text",
      label: "Where this is written",
      admin: { description: globalCopyNote("Home - leadership"), readOnly: true },
    },
  ],
};

export const ProductionBandSection: Block = {
  slug: "productionBand",
  labels: { singular: "Production band", plural: "Production bands" },
  fields: [
    {
      name: "note",
      type: "text",
      label: "Where this is written",
      admin: { description: globalCopyNote("Production page"), readOnly: true },
    },
  ],
};

export const SancharBandSection: Block = {
  slug: "sancharBand",
  labels: { singular: "Right Sanchar band", plural: "Right Sanchar bands" },
  fields: [
    {
      name: "note",
      type: "text",
      label: "Where this is written",
      admin: { description: globalCopyNote("Right Sanchar page"), readOnly: true },
    },
  ],
};

export const ServicesBandSection: Block = {
  slug: "servicesBand",
  labels: { singular: "Services band", plural: "Services bands" },
  fields: [
    {
      name: "note",
      type: "text",
      label: "Where this is written",
      admin: { description: globalCopyNote("Services page"), readOnly: true },
    },
  ],
};

/** The two closing links on the Right Sanchar page. */
export const PortalLinksSection: Block = {
  slug: "portalLinks",
  labels: { singular: "Portal links", plural: "Portal links" },
  fields: [
    ...headingFields,
    bilingual({ name: "body", type: "textarea", label: "Body" }),
    bilingual({ name: "primaryLabel", label: "First button text" }),
    {
      name: "primaryHref",
      type: "text",
      label: "First button address",
      admin: { description: "Leave empty to use the Right Sanchar address from Site settings." },
    },
    bilingual({ name: "secondaryLabel", label: "Second button text" }),
    { name: "secondaryHref", type: "text", label: "Second button address" },
  ],
};

/** The writing index. */
export const PostListSection: Block = {
  slug: "postList",
  labels: { singular: "Writing list", plural: "Writing lists" },
  fields: [
    ...headingFields,
    { name: "limit", type: "number", defaultValue: 60, min: 1, max: 200 },
    bilingual({
      name: "emptyText",
      type: "textarea",
      label: "Text when the list is empty",
      description: "Shown while nothing has been published.",
    }),
  ],
};

/** The offers index. */
export const OfferListSection: Block = {
  slug: "offerList",
  labels: { singular: "Offer list", plural: "Offer lists" },
  fields: [
    ...headingFields,
    { name: "limit", type: "number", defaultValue: 40, min: 1, max: 200 },
    bilingual({
      name: "emptyText",
      type: "textarea",
      label: "Text when the list is empty",
      description: "Shown while no offer is running.",
    }),
  ],
};

/** The search results page. */
export const SearchSection: Block = {
  slug: "searchSection",
  labels: { singular: "Search results", plural: "Search results" },
  fields: headingFields,
};

/** The dashboard sign-up form. */
export const SignupSection: Block = {
  slug: "signupSection",
  labels: { singular: "Sign-up form", plural: "Sign-up forms" },
  fields: [bilingual({ name: "note", type: "textarea", label: "Note above the form" })],
};

/**
 * Every section, in the order the dashboard offers them. Page-building blocks
 * (cms/blocks.ts) are added alongside these in `layoutBlocks`.
 */
export const sectionBlocks: Block[] = [
  PageHeroSection,
  ProseSection,
  IdentityStorySection,
  FeatureCardsSection,
  ProcessStepsSection,
  FaqSection,
  ServiceCardsSection,
  CategoryBarSection,
  CategoryGroupsSection,
  MediaShowcaseSection,
  TeamSection,
  ReviewsSection,
  WellWishersSection,
  PartnerMarqueeSection,
  SocialResponsibilitySection,
  SocialWorkSection,
  ContactDetailsSection,
  ContactCtaSection,
  PortalLinksSection,
  PostListSection,
  OfferListSection,
  HomeHeroSection,
  HomeAboutSection,
  LeadershipSection,
  ProductionBandSection,
  SancharBandSection,
  ServicesBandSection,
  SearchSection,
  SignupSection,
];
