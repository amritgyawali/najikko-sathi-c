import type { Field, GlobalConfig } from "payload";
import { revalidateSite } from "../hooks/revalidate";
import { isAdmin } from "../access";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * A colour token. The `name` matches a CSS custom property in globals.css, so
 * whatever is saved here is injected straight into the page as `--<name>`.
 */
const color = (name: string, label: string, defaultValue: string, description?: string): Field => ({
  name,
  type: "text",
  label,
  required: true,
  defaultValue,
  validate: (value: unknown) =>
    typeof value === "string" && HEX.test(value)
      ? true
      : "Enter a hex colour such as #062b5c.",
  admin: { width: "50%", description },
});

/**
 * Site-wide branding. Every value here overrides a CSS variable at render time,
 * so an admin can restyle the whole website from the dashboard without a deploy.
 */
export const Appearance: GlobalConfig = {
  slug: "appearance",
  label: "Appearance",
  admin: { group: "Site", description: "Website colours, typography and corner rounding." },
  // Branding is deliberately admin-only: editors manage content, not the look.
  access: { read: () => true, update: isAdmin },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: "collapsible",
      label: "Brand colours",
      fields: [
        {
          type: "row",
          fields: [
            color("primary", "Primary", "#062b5c", "Headings, header and footer."),
            color("primaryRich", "Primary (deep)", "#082f63", "Gradients and deep panels."),
          ],
        },
        {
          type: "row",
          fields: [
            color("secondary", "Secondary", "#1268d3", "Links and primary buttons."),
            color("signal", "Accent", "#f2553d", "Highlights and call-to-action accents."),
          ],
        },
        {
          type: "row",
          fields: [color("warm", "Warm accent", "#ffb38a")],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Surfaces and text",
      fields: [
        {
          type: "row",
          fields: [
            color("surface", "Page background", "#f4f7fb"),
            color("surfaceAlt", "Card background", "#ffffff"),
          ],
        },
        {
          type: "row",
          fields: [
            color("ink", "Body text", "#142238"),
            color("muted", "Muted text", "#5d6a7c"),
          ],
        },
        { type: "row", fields: [color("line", "Borders and dividers", "#dbe3ef")] },
      ],
    },
    {
      type: "collapsible",
      label: "Shape and type",
      fields: [
        {
          name: "radius",
          type: "number",
          label: "Corner radius (px)",
          defaultValue: 18,
          min: 0,
          max: 40,
        },
        {
          name: "headingFont",
          type: "select",
          defaultValue: "hanken",
          options: [
            { label: "Hanken Grotesk", value: "hanken" },
            { label: "Inter", value: "inter" },
          ],
        },
      ],
    },
  ],
};
