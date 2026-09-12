import type { Field, Tab } from "payload";

import { isAdminField } from "../access";
import {
  alignOptions,
  areaOptions,
  fontOptions,
  transformOptions,
  weightOptions,
} from "../../lib/typography";

/**
 * The look of the website, as fields in Site Settings.
 *
 * Everything here ends up as CSS (lib/typography.ts) which the root layout puts
 * in the document's head, so a face, a size or a spacing changed in the
 * dashboard shows on the website at the next request.
 *
 * Two habits run through all of it:
 *
 * - **Nothing is required, and nothing has a default.** An empty field means
 *   "leave the design alone", which is what makes it safe to open this screen
 *   on a site nobody has restyled: it is all blank, and blank changes nothing.
 * - **Every field says what it does to the website**, not what it does to the
 *   database, because the person reading it is an owner rather than a
 *   developer.
 */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const hexColour = (name: string, label: string, description?: string): Field => ({
  name,
  type: "text",
  label,
  validate: (value: unknown) =>
    !value || (typeof value === "string" && HEX.test(value))
      ? true
      : "Enter a hex colour such as #062b5c, or leave it empty.",
  admin: { width: "33%", description },
});

const font = (name: string, label: string, description?: string): Field => ({
  name,
  type: "select",
  label,
  options: fontOptions,
  admin: { width: "33%", description },
});

const size = (name: string, label: string, min: number, max: number, description?: string): Field => ({
  name,
  type: "number",
  label,
  min,
  max,
  admin: { width: "33%", step: 0.5, description },
});

/* ----------------------------------------------------------- typography tab */

export const typographyTab: Tab = {
  label: "Typography",
  description:
    "The faces the website is set in, and how big the words are. Leave a field empty to keep what the site was designed with. Sizes for one band in particular are set in Section styles, next door.",
  fields: [
    {
      name: "typography",
      type: "group",
      label: false,
      fields: [
        {
          type: "collapsible",
          label: "Faces and size",
          fields: [
            {
              type: "row",
              fields: [
                font("headingFont", "Heading face", "Used for every heading on the site."),
                font("bodyFont", "Reading face", "Used for paragraphs, lists and captions."),
                size(
                  "baseSize",
                  "Base text size (px)",
                  12,
                  26,
                  "The size a plain paragraph is set at. 16 is the browser's own.",
                ),
              ],
            },
            {
              type: "row",
              fields: [
                size(
                  "scale",
                  "Everything larger or smaller (%)",
                  70,
                  160,
                  "100 leaves every size as designed. 110 makes all the reading matter a tenth larger, headings included.",
                ),
                size(
                  "bodyLineHeight",
                  "Line spacing",
                  1,
                  2.4,
                  "How far apart the lines of a paragraph sit. 1.7 is comfortable for English; Nepali reads better nearer 1.8.",
                ),
                {
                  name: "headingWeight",
                  type: "select",
                  label: "Heading weight",
                  options: weightOptions,
                  admin: { width: "33%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                size(
                  "headingLetterSpacing",
                  "Heading letter spacing (em)",
                  -0.1,
                  0.3,
                  "Negative draws the letters together, which suits large headings. Try -0.03.",
                ),
                {
                  name: "kickerCase",
                  type: "select",
                  label: "The small labels above headings",
                  options: transformOptions,
                  admin: {
                    width: "66%",
                    description:
                      "Devanagari has no upper case, so the Nepali half of the site already sets these as written.",
                  },
                },
              ],
            },
          ],
        },
        {
          type: "collapsible",
          label: "Bring your own font",
          admin: {
            description:
              "Two faces of your own, fetched from a stylesheet rather than shipped with the site. Once one is here it appears in every face menu on this screen as “Custom web font”.",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "customFontFamily",
                  type: "text",
                  label: "First font - family name",
                  admin: {
                    width: "50%",
                    description: "Spelled exactly as the stylesheet names it, for example Poppins.",
                  },
                },
                {
                  name: "customFontUrl",
                  type: "text",
                  label: "First font - stylesheet address",
                  validate: httpsOrEmpty,
                  admin: {
                    width: "50%",
                    description:
                      "An https address, for example https://fonts.googleapis.com/css2?family=Poppins&display=swap.",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "altFontFamily",
                  type: "text",
                  label: "Second font - family name",
                  admin: { width: "50%" },
                },
                {
                  name: "altFontUrl",
                  type: "text",
                  label: "Second font - stylesheet address",
                  validate: httpsOrEmpty,
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function httpsOrEmpty(value: unknown): true | string {
  if (!value) return true;
  try {
    return new URL(String(value)).protocol === "https:"
      ? true
      : "Use an https address, or leave this empty.";
  } catch {
    return "That is not a web address.";
  }
}

/* --------------------------------------------------------------- layout tab */

export const layoutTab: Tab = {
  label: "Layout & motion",
  description:
    "How wide the website is, how much air sits around each band, how round the corners are, and how much movement there is. Every field is optional.",
  fields: [
    {
      name: "layout",
      type: "group",
      label: false,
      fields: [
        {
          type: "row",
          fields: [
            size(
              "containerWidth",
              "Page width (px)",
              900,
              1680,
              "How wide the content runs before it stops growing. The site was drawn at 1200.",
            ),
            size(
              "sectionSpacing",
              "Air above and below each band (px)",
              16,
              200,
              "72 by design. Lower packs the page tighter.",
            ),
            size("cardGap", "Gap between cards (px)", 4, 80),
          ],
        },
        {
          type: "row",
          fields: [
            size("radius", "Corner rounding (px)", 0, 48, "Panels and cards. 18 by design; 0 is square."),
            size("imageRadius", "Picture corners (px)", 0, 48),
            size("buttonRadius", "Button corners (px)", 0, 999, "999 makes a button a pill."),
          ],
        },
        {
          type: "row",
          fields: [
            size(
              "shadow",
              "Shadow strength (%)",
              0,
              100,
              "How much the cards lift off the page. 10 by design; 0 removes the shadow.",
            ),
          ],
        },
        {
          type: "collapsible",
          label: "Behaviour",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "stickyHeader",
                  type: "checkbox",
                  label: "Keep the header in view while scrolling",
                  admin: { width: "50%" },
                },
                {
                  name: "smoothScroll",
                  type: "checkbox",
                  label: "Glide when jumping to a section",
                  defaultValue: true,
                  admin: {
                    width: "50%",
                    description: "Turn this off and a jump link moves straight there.",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "reduceMotion",
                  type: "checkbox",
                  label: "Still website - no fades or slides",
                  admin: {
                    width: "50%",
                    description:
                      "Everything appears already in place. A reader whose own machine asks for less movement gets this anyway.",
                  },
                },
                {
                  name: "underlineLinks",
                  type: "checkbox",
                  label: "Underline links inside paragraphs",
                  admin: { width: "50%", description: "Easier to see, and easier to tell from plain text." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/* -------------------------------------------------------- section styles tab */

/**
 * One band's type. Added a row at a time rather than laid out as a form of
 * every band on the site, because a form like that would be four hundred fields
 * long and nobody would find the one they wanted in it.
 */
const sectionStyleFields: Field[] = [
  {
    name: "area",
    type: "select",
    label: "Which part of the website",
    required: true,
    options: areaOptions,
    admin: {
      description:
        "Everything under this heading applies wherever that band appears - on every page that uses it.",
    },
  },
  {
    type: "collapsible",
    label: "Headings",
    fields: [
      {
        type: "row",
        fields: [
          font("headingFont", "Face"),
          size("headingSize", "Size (px)", 8, 140, "Shrinks by itself on a narrow screen."),
          {
            name: "headingWeight",
            type: "select",
            label: "Weight",
            options: weightOptions,
            admin: { width: "33%" },
          },
        ],
      },
      {
        type: "row",
        fields: [
          size("headingLineHeight", "Line spacing", 0.8, 3),
          size("headingLetterSpacing", "Letter spacing (em)", -0.1, 0.4),
          {
            name: "headingTransform",
            type: "select",
            label: "Case",
            options: transformOptions,
            admin: { width: "33%" },
          },
        ],
      },
      { type: "row", fields: [hexColour("headingColor", "Colour")] },
    ],
  },
  {
    type: "collapsible",
    label: "Reading matter",
    fields: [
      {
        type: "row",
        fields: [
          font("bodyFont", "Face"),
          size("bodySize", "Size (px)", 8, 60),
          {
            name: "bodyWeight",
            type: "select",
            label: "Weight",
            options: weightOptions,
            admin: { width: "33%" },
          },
        ],
      },
      {
        type: "row",
        fields: [size("bodyLineHeight", "Line spacing", 0.8, 3), hexColour("bodyColor", "Colour")],
      },
    ],
  },
  {
    type: "collapsible",
    label: "Small labels, badges and buttons",
    fields: [
      {
        type: "row",
        fields: [
          font("kickerFont", "Label face"),
          size("kickerSize", "Label size (px)", 8, 40),
          {
            name: "kickerTransform",
            type: "select",
            label: "Label case",
            options: transformOptions,
            admin: { width: "33%" },
          },
        ],
      },
      {
        type: "row",
        fields: [hexColour("kickerColor", "Label colour"), size("actionSize", "Button text size (px)", 8, 40)],
      },
    ],
  },
  {
    type: "collapsible",
    label: "The band itself",
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "align",
            type: "select",
            label: "Alignment",
            options: alignOptions,
            admin: { width: "33%" },
          },
          hexColour("background", "Background", "What the whole band sits on."),
          size("paddingTop", "Air above (px)", 0, 240),
        ],
      },
      {
        type: "row",
        fields: [
          size("paddingBottom", "Air below (px)", 0, 240),
          {
            name: "hide",
            type: "checkbox",
            label: "Take this band off every page",
            admin: {
              width: "66%",
              description:
                "It stays written in the dashboard and stops being drawn. Useful for retiring a band without deleting anyone's words.",
            },
          },
        ],
      },
    ],
  },
];

export const sectionStylesTab: Tab = {
  label: "Section styles",
  description:
    "Type, colour and spacing for one band at a time - the hero, the written sections, the cards, the footer, and every other part of the site. Add a row, choose the part, and set only what you want changed.",
  fields: [
    {
      name: "sectionStyles",
      type: "array",
      label: false,
      labels: { singular: "Section style", plural: "Section styles" },
      admin: {
        initCollapsed: true,
        // A closed row names the part it restyles rather than its position, so
        // the list reads as "Written section, Footer" rather than "01, 02".
        components: { RowLabel: "/cms/components/SectionStyleRowLabel#SectionStyleRowLabel" },
        description:
          "A part with no row here is drawn exactly as the site was designed. Two rows for the same part are both applied, the lower one winning where they disagree.",
      },
      fields: sectionStyleFields,
    },
  ],
};

/* ------------------------------------------------------------- advanced tab */

export const advancedTab: Tab = {
  label: "Advanced",
  description:
    "The tools that act on the whole website at once, and a place for CSS of your own. Both are for administrators.",
  fields: [
    {
      name: "advancedTools",
      type: "ui",
      admin: { components: { Field: "/cms/components/AdvancedTools#AdvancedToolsField" } },
    },
    {
      name: "customCss",
      type: "textarea",
      label: "CSS of your own",
      access: { update: isAdminField, read: isAdminField },
      admin: {
        rows: 10,
        description:
          "Added after everything else, so it settles any argument with the rest of this screen. Written straight into the page: a mistake here shows on the website, and clearing the box undoes it.",
      },
    },
  ],
};
