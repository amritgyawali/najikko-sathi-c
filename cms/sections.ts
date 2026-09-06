import type { Block, Field } from "payload";

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
 */

/** Every heading band starts the same way: a small kicker, then a title. */
const headingFields: Field[] = [
  { name: "kicker", type: "text", admin: { description: "The small label above the heading." } },
  { name: "heading", type: "text" },
  { name: "description", type: "textarea", admin: { description: "One or two lines under the heading." } },
];

const linkFields = (label = "Link"): Field => ({
  type: "row",
  fields: [
    { name: "linkLabel", type: "text", label: `${label} text`, admin: { width: "50%" } },
    { name: "linkHref", type: "text", label: `${label} address`, admin: { width: "50%" } },
  ],
});

const iconField: Field = {
  name: "icon",
  type: "select",
  options: [...sectionIcons],
  admin: { description: "Drawn above the title." },
};

/** The band across the top of a page: breadcrumb, title, and one action. */
export const PageHeroSection: Block = {
  slug: "pageHero",
  labels: { singular: "Page hero", plural: "Page heroes" },
  fields: [
    { name: "eyebrow", type: "text", required: true, admin: { description: "The line above the title." } },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "ctaLabel", type: "text", label: "Button text", admin: { width: "40%" } },
        { name: "ctaHref", type: "text", label: "Button address", admin: { width: "40%" } },
        {
          name: "ctaExternal",
          type: "checkbox",
          label: "Opens another site",
          admin: {
            width: "20%",
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
    { name: "lead", type: "textarea", admin: { description: "The opening paragraph, set larger." } },
    {
      name: "paragraphs",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    linkFields(),
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
    {
      name: "panelQuote",
      type: "textarea",
      admin: { description: "The quotation inside the panel. The company name and address come from Site settings." },
    },
    ...headingFields,
    { name: "lead", type: "textarea" },
    {
      name: "paragraphs",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    linkFields(),
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
      fields: [
        iconField,
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea" },
        {
          name: "points",
          type: "array",
          labels: { singular: "Tick", plural: "Ticks" },
          admin: { description: "Shown as a ticked list on the discipline style." },
          fields: [{ name: "text", type: "text", required: true }],
        },
        linkFields("Card link"),
      ],
    },
    {
      name: "chips",
      type: "array",
      label: "Keywords under the cards",
      labels: { singular: "Keyword", plural: "Keywords" },
      fields: [{ name: "text", type: "text", required: true }],
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
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
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
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
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
    { name: "heading", type: "text", admin: { description: "Names the band: “<title> in pictures & film”." } },
  ],
};

/** The closing band that sends a reader to the contact form. */
export const ContactCtaSection: Block = {
  slug: "contactCta",
  labels: { singular: "Closing call to action", plural: "Closing calls to action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
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
    {
      name: "note",
      type: "textarea",
      admin: { description: "The line under the company name and VAT number." },
    },
    linkFields("Map link"),
    { name: "showForm", type: "checkbox", defaultValue: true, label: "Show the enquiry form" },
  ],
};

/** The team, from Content → Team. Hidden while nobody has been added. */
export const TeamSection: Block = {
  slug: "teamSection",
  labels: { singular: "Team", plural: "Teams" },
  fields: headingFields,
};

/** The social responsibility films and albums, from their own collection. */
export const SocialResponsibilitySection: Block = {
  slug: "socialResponsibilitySection",
  labels: { singular: "Social responsibility", plural: "Social responsibility" },
  fields: headingFields,
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
    {
      name: "secondaryLabel",
      type: "text",
      admin: {
        description:
          "The second button. Its address is the Right Sanchar link in Site settings. " +
          globalCopyNote("Home - hero"),
      },
    },
    { name: "showMediaSystem", type: "checkbox", defaultValue: true, label: "Show the media system wheel" },
  ],
};

export const HomeAboutSection: Block = {
  slug: "homeAbout",
  labels: { singular: "Front page introduction", plural: "Front page introductions" },
  fields: [
    linkFields(),
    {
      name: "captionTitle",
      type: "text",
      admin: { description: `The caption on the visual. ${globalCopyNote("Home - about")}` },
    },
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
    { name: "body", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "primaryLabel", type: "text", admin: { width: "50%" } },
        {
          name: "primaryHref",
          type: "text",
          admin: { width: "50%", description: "Leave empty to use the Right Sanchar address from Site settings." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "secondaryLabel", type: "text", admin: { width: "50%" } },
        { name: "secondaryHref", type: "text", admin: { width: "50%" } },
      ],
    },
  ],
};

/** The writing index. */
export const PostListSection: Block = {
  slug: "postList",
  labels: { singular: "Writing list", plural: "Writing lists" },
  fields: [
    ...headingFields,
    { name: "limit", type: "number", defaultValue: 60, min: 1, max: 200 },
    {
      name: "emptyText",
      type: "textarea",
      admin: { description: "Shown while nothing has been published." },
    },
  ],
};

/** The offers index. */
export const OfferListSection: Block = {
  slug: "offerList",
  labels: { singular: "Offer list", plural: "Offer lists" },
  fields: [
    ...headingFields,
    { name: "limit", type: "number", defaultValue: 40, min: 1, max: 200 },
    { name: "emptyText", type: "textarea", admin: { description: "Shown while no offer is running." } },
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
  fields: [{ name: "note", type: "textarea", label: "Note above the form" }],
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
  SocialResponsibilitySection,
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
