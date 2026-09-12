/**
 * Type, spacing and motion, as CSS the dashboard writes.
 *
 * Site Settings holds a face, a size, a weight and a colour for every band on
 * the website - the header, the footer, and each of the thirty-odd sections a
 * page is made of (cms/sections.ts). This turns whatever is saved there into a
 * stylesheet, which the root layout puts in the document's head, so a change of
 * type takes effect on the next request with no deploy and no rebuild.
 *
 * Three rules hold the whole thing together:
 *
 * 1. **Nothing is written unless somebody asked for it.** Every field is
 *    optional, and an empty one emits no declaration at all. A site where
 *    nobody has touched Site → Typography gets an empty stylesheet and looks
 *    exactly as it was designed.
 * 2. **What is written wins.** Each rule is prefixed with `:root:root `, which
 *    costs nothing at render time and puts the rule above anything in
 *    globals.css or pages.css, whichever order the browser happens to load
 *    them in.
 * 3. **Sizes stay readable on a phone.** A size is written as
 *    `min(<chosen>px, <cap>vw)`, so a 64px heading chosen for a desktop still
 *    fits a 320px screen rather than running off the side of it.
 *
 * Every value that reaches CSS from a form is filtered here rather than
 * trusted: a colour must be a hex colour, a length must be a number in range,
 * and a family name is quoted with the characters that could end the
 * declaration removed.
 */

/* ---------------------------------------------------------------- the faces */

/**
 * The faces a section can be set in.
 *
 * `custom` and `alt` are the two web fonts an administrator can add in
 * Site Settings → Typography, each of them a family name and a stylesheet
 * address. Both fall back to the site's own face, so a stylesheet that fails to
 * load leaves the words readable rather than blank.
 */
const STACKS: Record<string, string> = {
  hanken: "var(--font-hanken), Arial, sans-serif",
  inter: "var(--font-inter), Arial, sans-serif",
  heading: "var(--font-heading), Arial, sans-serif",
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  devanagari: "var(--font-devanagari)",
  custom: "var(--font-custom), var(--font-hanken), Arial, sans-serif",
  alt: "var(--font-alt), var(--font-hanken), Arial, sans-serif",
};

/** The same list, as a dashboard menu. */
export const fontOptions: { label: string; value: string }[] = [
  { label: "Hanken Grotesk - the site's own face", value: "hanken" },
  { label: "Inter - plainer, a little narrower", value: "inter" },
  { label: "Whatever the headings are set in", value: "heading" },
  { label: "The reader's own system face", value: "system" },
  { label: "Georgia - a serif, for long reading", value: "serif" },
  { label: "Monospace - every letter the same width", value: "mono" },
  { label: "The Devanagari face", value: "devanagari" },
  { label: "Custom web font - the first one", value: "custom" },
  { label: "Custom web font - the second one", value: "alt" },
];

export const transformOptions: { label: string; value: string }[] = [
  { label: "As it is written", value: "none" },
  { label: "UPPER CASE", value: "uppercase" },
  { label: "lower case", value: "lowercase" },
  { label: "Title Case", value: "capitalize" },
];

export const alignOptions: { label: string; value: string }[] = [
  { label: "Left", value: "left" },
  { label: "Centred", value: "center" },
  { label: "Right", value: "right" },
];

export const weightOptions: { label: string; value: string }[] = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi-bold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Heavy (800)", value: "800" },
];

/* ------------------------------------------------------------- the areas */

/**
 * Every part of the website that can be given type of its own.
 *
 * `scope` is what the rules are hung off. For a page section that is the
 * `data-section` attribute the renderer puts on every band
 * (app/(frontend)/_components/PageSections.tsx); for the chrome around the
 * page it is the element's own class.
 *
 * `paint` is what a background, a padding or "hide this" is applied to. A
 * section's scope is a wrapper that draws nothing of its own - it is
 * `display: contents`, so it changes no layout - which is why the band itself
 * is addressed as its child.
 */
export type Area = { value: string; label: string; scope: string; paint: string };

const section = (slug: string, label: string): Area => ({
  value: slug,
  label,
  scope: `[data-section="${slug}"]`,
  paint: `[data-section="${slug}"] > *`,
});

const chrome = (value: string, label: string, selector: string): Area => ({
  value,
  label,
  scope: selector,
  paint: selector,
});

/**
 * The order here is the order of the menu in the dashboard: the whole site
 * first, then the chrome that is on every page, then the sections in the order
 * cms/sections.ts offers them.
 */
export const AREAS: Area[] = [
  chrome("global", "Everywhere - the whole website", "body"),
  chrome("header", "Header, logo and menu", ".site-header"),
  chrome("utility", "Contact strip above the header", ".utility-bar"),
  chrome("announcement", "Announcement bar", ".announcement-bar"),
  chrome("footer", "Footer", "footer"),
  section("pageHero", "Page hero - the band at the top of a page"),
  section("prose", "Written section"),
  section("identityStory", "Identity & story"),
  section("featureCards", "Card section"),
  section("processSteps", "Numbered steps"),
  section("faqSection", "Questions"),
  section("serviceCards", "Service cards"),
  section("categoryBar", "Category jump bar"),
  section("categoryGroups", "Category sections"),
  section("mediaShowcase", "Photo & film band"),
  section("teamSection", "Team"),
  section("reviewsSection", "Reviews"),
  section("wellWishersSection", "Well-wishers"),
  section("partnerMarquee", "Partner logos"),
  section("socialResponsibilitySection", "Social responsibility"),
  section("socialWorkSection", "Social work"),
  section("contactDetails", "Contact details & form"),
  section("contactCta", "Closing call to action"),
  section("portalLinks", "Portal links"),
  section("postList", "Writing list"),
  section("offerList", "Offer list"),
  section("homeHero", "Front page hero"),
  section("homeAbout", "Front page introduction"),
  section("leadershipSection", "Leadership messages"),
  section("productionBand", "Production band"),
  section("sancharBand", "Right Sanchar band"),
  section("servicesBand", "Services band"),
  section("searchSection", "Search results"),
  section("signupSection", "Sign-up form"),
];

/** The same list, as a dashboard menu. */
export const areaOptions = AREAS.map((area) => ({ label: area.label, value: area.value }));

const areaByValue = new Map(AREAS.map((area) => [area.value, area]));

/**
 * The four jobs text does inside a band, and what each of them is in the
 * markup. A section only ever uses some of these, and a selector that matches
 * nothing costs nothing.
 */
const ROLE_PARTS = {
  heading: ["h1", "h2", "h3", "h4", ".cms-card strong", ".vertical-card strong", "blockquote"],
  body: ["p", "li", "dd", "figcaption", "label", "summary", ".cms-meta"],
  kicker: [
    ".section-kicker",
    ".eyebrow",
    ".hero-kicker",
    ".breadcrumbs",
    ".cms-badge",
    ".process-number",
    ".foundation-chip",
  ],
  action: [
    ".text-link",
    ".primary-button",
    ".hero-cta",
    ".service-card-action",
    ".inquiry-button",
    "button",
  ],
} as const;

type Role = keyof typeof ROLE_PARTS;

/** How far a size of each kind is allowed to grow on a narrow screen. */
const CAPS: Record<Role, string> = {
  heading: "8.6vw",
  body: "4.8vw",
  kicker: "4vw",
  action: "4.6vw",
};

const selectorsFor = (scope: string, role: Role): string =>
  ROLE_PARTS[role].map((part) => `:root:root ${scope} ${part}`).join(",");

/* ---------------------------------------------------------------- filtering */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** A colour, or nothing. Anything that is not a hex colour is dropped. */
const colour = (value: unknown): string | null =>
  typeof value === "string" && HEX.test(value.trim()) ? value.trim() : null;

/** A number inside a range, or nothing. */
const num = (value: unknown, min: number, max: number): number | null => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
};

/** One of a fixed set of words, or nothing. */
const oneOf = (value: unknown, allowed: readonly string[]): string | null =>
  typeof value === "string" && allowed.includes(value) ? value : null;

const TRANSFORMS = transformOptions.map((option) => option.value);
const ALIGNMENTS = alignOptions.map((option) => option.value);
const WEIGHTS = weightOptions.map((option) => option.value);

/** A face from the list above. An unknown name is dropped rather than written. */
const stack = (value: unknown): string | null =>
  typeof value === "string" && value in STACKS ? STACKS[value] : null;

/**
 * A family name safe to write into a CSS declaration - quoted, with anything
 * that could end the declaration or open another one removed.
 */
export const quoteFamily = (value: unknown): string | null => {
  const family = (typeof value === "string" ? value : "").replace(/["'`;{}()\\<>]/g, "").trim();
  return family ? `"${family}"` : null;
};

/** A stylesheet address safe to put in a `<link>`: plain https, or nothing. */
export const safeStylesheet = (value: unknown): string | null => {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------- the settings */

/** One band's type, as the dashboard saves it. */
export type SectionStyle = {
  area?: string | null;
  headingFont?: string | null;
  headingSize?: number | null;
  headingWeight?: string | null;
  headingLineHeight?: number | null;
  headingLetterSpacing?: number | null;
  headingTransform?: string | null;
  headingColor?: string | null;
  bodyFont?: string | null;
  bodySize?: number | null;
  bodyWeight?: string | null;
  bodyLineHeight?: number | null;
  bodyColor?: string | null;
  kickerFont?: string | null;
  kickerSize?: number | null;
  kickerTransform?: string | null;
  kickerColor?: string | null;
  actionSize?: number | null;
  align?: string | null;
  background?: string | null;
  paddingTop?: number | null;
  paddingBottom?: number | null;
  hide?: boolean | null;
};

/** The site-wide half of Site Settings → Typography. */
export type TypographySettings = {
  bodyFont?: string | null;
  headingFont?: string | null;
  baseSize?: number | null;
  scale?: number | null;
  bodyLineHeight?: number | null;
  headingWeight?: string | null;
  headingLetterSpacing?: number | null;
  kickerCase?: string | null;
  customFontFamily?: string | null;
  customFontUrl?: string | null;
  altFontFamily?: string | null;
  altFontUrl?: string | null;
};

/** Site Settings → Layout & motion. */
export type LayoutSettings = {
  containerWidth?: number | null;
  sectionSpacing?: number | null;
  radius?: number | null;
  cardGap?: number | null;
  imageRadius?: number | null;
  buttonRadius?: number | null;
  shadow?: number | null;
  stickyHeader?: boolean | null;
  smoothScroll?: boolean | null;
  reduceMotion?: boolean | null;
  underlineLinks?: boolean | null;
};

export type SiteStyleSettings = {
  typography?: TypographySettings | null;
  layout?: LayoutSettings | null;
  sectionStyles?: SectionStyle[] | null;
  customCss?: string | null;
};

/* -------------------------------------------------------------- the writing */

const rule = (selector: string, body: string): string => (body ? `${selector}{${body}}` : "");

/** `min(28px, 8.6vw)` - the chosen size, and what it may not exceed. */
const sizeValue = (size: number, role: Role): string => `min(${size}px, ${CAPS[role]})`;

/** The declarations for one job of text inside one band. */
function roleBody(
  role: Role,
  values: {
    font?: unknown;
    size?: unknown;
    weight?: unknown;
    lineHeight?: unknown;
    letterSpacing?: unknown;
    transform?: unknown;
    color?: unknown;
  },
): string {
  const parts: string[] = [];
  const family = stack(values.font);
  if (family) parts.push(`font-family:${family}`);

  const size = num(values.size, 8, 140);
  if (size !== null) parts.push(`font-size:${sizeValue(size, role)}`);

  const weight = oneOf(values.weight, WEIGHTS);
  if (weight) parts.push(`font-weight:${weight}`);

  const lineHeight = num(values.lineHeight, 0.8, 3);
  if (lineHeight !== null) parts.push(`line-height:${lineHeight}`);

  const spacing = num(values.letterSpacing, -0.1, 0.4);
  if (spacing !== null) parts.push(`letter-spacing:${spacing}em`);

  const transform = oneOf(values.transform, TRANSFORMS);
  if (transform) parts.push(`text-transform:${transform}`);

  const tint = colour(values.color);
  if (tint) parts.push(`color:${tint}`);

  return parts.join(";");
}

/** One row of Site Settings → Section styles, as CSS. */
function sectionCss(style: SectionStyle): string {
  const area = areaByValue.get(String(style.area ?? ""));
  if (!area) return "";

  const out: string[] = [];

  out.push(
    rule(
      selectorsFor(area.scope, "heading"),
      roleBody("heading", {
        font: style.headingFont,
        size: style.headingSize,
        weight: style.headingWeight,
        lineHeight: style.headingLineHeight,
        letterSpacing: style.headingLetterSpacing,
        transform: style.headingTransform,
        color: style.headingColor,
      }),
    ),
  );

  out.push(
    rule(
      selectorsFor(area.scope, "body"),
      roleBody("body", {
        font: style.bodyFont,
        size: style.bodySize,
        weight: style.bodyWeight,
        lineHeight: style.bodyLineHeight,
        color: style.bodyColor,
      }),
    ),
  );

  out.push(
    rule(
      selectorsFor(area.scope, "kicker"),
      roleBody("kicker", {
        font: style.kickerFont,
        size: style.kickerSize,
        transform: style.kickerTransform,
        color: style.kickerColor,
      }),
    ),
  );

  out.push(rule(selectorsFor(area.scope, "action"), roleBody("action", { size: style.actionSize })));

  // The band itself: how it is aligned, what it sits on, how much air it has,
  // and whether it is drawn at all.
  const band: string[] = [];
  if (style.hide) {
    band.push("display:none");
  } else {
    const align = oneOf(style.align, ALIGNMENTS);
    if (align) band.push(`text-align:${align}`);
    const background = colour(style.background);
    if (background) band.push(`background:${background}`);
    const top = num(style.paddingTop, 0, 240);
    if (top !== null) band.push(`padding-top:${top}px`);
    const bottom = num(style.paddingBottom, 0, 240);
    if (bottom !== null) band.push(`padding-bottom:${bottom}px`);
  }
  out.push(rule(`:root:root ${area.paint}`, band.join(";")));

  return out.filter(Boolean).join("");
}

/**
 * The text on the website, at the size it was designed at.
 *
 * Site Settings → Typography can make every word on the site larger or smaller
 * by a percentage, and a percentage of a value only means something if the
 * value is known - so the sizes the design uses are written down here. Each one
 * is responsive already, so the scaled rule covers a phone as well as a
 * desktop, which is why it is safe for it to sit above the stylesheets'
 * own media queries.
 *
 * Only reading matter is listed. The menu, the buttons and the strips around
 * the page are tuned to the space they sit in rather than to the reader, so
 * they keep the size they were given and are set from Section styles instead.
 */
const SCALED: { selector: string; size: string }[] = [
  { selector: "body", size: "16px" },
  { selector: ".hero h1", size: "clamp(43px, 8.5vw, 72px)" },
  { selector: ".hero p", size: "clamp(15px, 1.8vw, 16px)" },
  { selector: ".page-hero h1", size: "clamp(37px, 8.8vw, 64px)" },
  { selector: ".page-hero p", size: "clamp(15px, 1.9vw, 17px)" },
  { selector: ".section-heading h2", size: "clamp(30px, 3.2vw, 44px)" },
  { selector: ".section-heading p", size: "clamp(15px, 1.7vw, 16px)" },
  { selector: ".prose p, .portal-next p", size: "16px" },
  { selector: ".prose .lead-copy", size: "clamp(17px, 1.9vw, 18px)" },
  { selector: ".prose h3", size: "21px" },
  { selector: ".process-list h3", size: "clamp(21px, 2.2vw, 25px)" },
  { selector: ".process-list p", size: "15px" },
  { selector: ".faq-list summary", size: "17px" },
  { selector: ".faq-list p", size: "15px" },
  { selector: ".service-detail-card h3", size: "clamp(20px, 2vw, 22px)" },
  { selector: ".service-detail-card p", size: "14px" },
  { selector: ".identity-panel h2", size: "clamp(28px, 3vw, 35px)" },
  { selector: ".identity-panel p", size: "15px" },
  { selector: ".values-grid h3", size: "clamp(20px, 2vw, 23px)" },
  { selector: ".values-grid p", size: "15px" },
  { selector: ".contact-cta h2", size: "clamp(30px, 3vw, 42px)" },
  { selector: ".contact-cta p", size: "15px" },
  { selector: ".cms-card strong", size: "1.12rem" },
  { selector: ".cms-card p", size: "14px" },
  { selector: "footer h3", size: "16px" },
  { selector: ".footer-about p, footer li", size: "12px" },
];

/** Every length in a size, multiplied. `vw` is left alone: it already scales. */
const scaleLength = (size: string, factor: number): string =>
  size.replace(/([\d.]+)(px|rem)/g, (_match, value: string, unit: string) => {
    const scaled = Number.parseFloat(value) * factor;
    return `${Math.round(scaled * 100) / 100}${unit}`;
  });

/** The site-wide half of Site Settings → Typography, as CSS. */
function typographyCss(type: TypographySettings): string {
  const out: string[] = [];
  const variables: string[] = [];

  // The two custom faces are declared as variables so a section can name one
  // without repeating the family, and so a stylesheet that never loads leaves
  // the fallback in the stack doing the work.
  const custom = quoteFamily(type.customFontFamily);
  if (custom) variables.push(`--font-custom:${custom}`);
  const alt = quoteFamily(type.altFontFamily);
  if (alt) variables.push(`--font-alt:${alt}`);

  const heading = stack(type.headingFont);
  if (heading) variables.push(`--font-heading:${heading}`);
  out.push(rule(":root", variables.join(";")));

  // "Everything one tenth larger" only means something against the sizes the
  // design uses, so those are the ones that are rewritten. It goes in before
  // the rules below, so a base size or a face chosen outright still wins.
  const percent = num(type.scale, 70, 160);
  if (percent !== null && Math.round(percent) !== 100) {
    const factor = percent / 100;
    for (const entry of SCALED) {
      const selectors = entry.selector
        .split(",")
        .map((part) => `:root:root ${part.trim()}`)
        .join(",");
      out.push(rule(selectors, `font-size:${scaleLength(entry.size, factor)}`));
    }
  }

  const body: string[] = [];
  const bodyFace = stack(type.bodyFont);
  if (bodyFace) body.push(`font-family:${bodyFace}`);
  const base = num(type.baseSize, 12, 26);
  if (base !== null) body.push(`font-size:${sizeValue(base, "body")}`);
  const lineHeight = num(type.bodyLineHeight, 1, 2.4);
  if (lineHeight !== null) body.push(`line-height:${lineHeight}`);
  out.push(rule(":root:root body", body.join(";")));

  const headings: string[] = [];
  const weight = oneOf(type.headingWeight, WEIGHTS);
  if (weight) headings.push(`font-weight:${weight}`);
  const spacing = num(type.headingLetterSpacing, -0.1, 0.3);
  if (spacing !== null) headings.push(`letter-spacing:${spacing}em`);
  if (heading) headings.push(`font-family:${heading}`);
  out.push(
    rule(
      ["h1", "h2", "h3", "h4"].map((tag) => `:root:root ${tag}`).join(","),
      headings.join(";"),
    ),
  );

  const kickerCase = oneOf(type.kickerCase, TRANSFORMS);
  if (kickerCase) {
    out.push(
      rule(
        ROLE_PARTS.kicker.map((part) => `:root:root ${part}`).join(","),
        `text-transform:${kickerCase}`,
      ),
    );
  }

  return out.filter(Boolean).join("");
}

/** Site Settings → Layout & motion, as CSS. */
function layoutCss(layout: LayoutSettings): string {
  const out: string[] = [];
  const variables: string[] = [];

  const radius = num(layout.radius, 0, 48);
  if (radius !== null) variables.push(`--radius:${radius}px`);
  const shadow = num(layout.shadow, 0, 100);
  if (shadow !== null) {
    // The design's own shadow, with only its strength changed, so a site that
    // asks for a softer one keeps the same shape of light. 10% is the design.
    variables.push(`--shadow-soft:0 20px 55px rgb(6 43 92 / ${Math.round(shadow)}%)`);
  }
  out.push(rule(":root", variables.join(";")));

  const width = num(layout.containerWidth, 900, 1680);
  if (width !== null) {
    out.push(rule(":root:root .site-container", `width:min(${width}px, calc(100% - 64px))`));
  }

  const spacing = num(layout.sectionSpacing, 16, 200);
  if (spacing !== null) out.push(rule(":root:root .content-section", `padding-block:${spacing}px`));

  const gap = num(layout.cardGap, 4, 80);
  if (gap !== null) {
    out.push(
      rule(
        ":root:root .cms-card-grid,:root:root .service-cards,:root:root .values-grid,:root:root .topic-grid",
        `gap:${gap}px`,
      ),
    );
  }

  const imageRadius = num(layout.imageRadius, 0, 48);
  if (imageRadius !== null) {
    out.push(
      rule(
        ":root:root .cms-card img,:root:root .media-frame,:root:root .social-card img",
        `border-radius:${imageRadius}px`,
      ),
    );
  }

  const buttonRadius = num(layout.buttonRadius, 0, 999);
  if (buttonRadius !== null) {
    out.push(
      rule(
        ":root:root .primary-button,:root:root .hero-cta,:root:root .inquiry-button",
        `border-radius:${buttonRadius}px`,
      ),
    );
  }

  if (layout.stickyHeader) {
    out.push(rule(":root:root .site-header", "position:sticky;top:0;z-index:40"));
  }

  // `html` is the root itself rather than something inside it, so this one is
  // written as a doubled compound rather than as a descendant.
  if (layout.smoothScroll === false) out.push(rule("html:root:root", "scroll-behavior:auto"));

  if (layout.reduceMotion) {
    // Not `animation: none`: a keyframe animation that never runs can leave an
    // element at its opening frame, which for a band that fades in means
    // invisible. Running it instantly leaves everything at its finished state.
    out.push(
      rule(
        ":root:root *,:root:root *::before,:root:root *::after",
        "animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important",
      ),
    );
  }

  if (layout.underlineLinks) {
    out.push(rule(":root:root .prose a,:root:root .page-lead a,:root:root footer li a", "text-decoration:underline"));
  }

  return out.filter(Boolean).join("");
}

/**
 * Whatever an administrator has written by hand, last, so it can settle an
 * argument with anything above it.
 *
 * React renders this as the text of a `<style>` element, and it escapes a
 * closing `</style` inside one itself, so the sequence that would end the
 * element and open something else cannot get through. It is dropped here as well
 * rather than relied on being dropped there, and the length is capped so a
 * pasted file cannot become every page's weight.
 */
const customCss = (value: unknown): string => {
  const css = typeof value === "string" ? value : "";
  return css.replace(/<\/\s*style/gi, "").slice(0, 20_000);
};

/** Everything above, as one stylesheet. Empty when nothing has been set. */
export function buildSiteCss(settings: SiteStyleSettings | null | undefined): string {
  if (!settings) return "";
  const parts = [
    typographyCss(settings.typography ?? {}),
    layoutCss(settings.layout ?? {}),
    ...(settings.sectionStyles ?? []).map(sectionCss),
    customCss(settings.customCss),
  ];
  return parts.filter(Boolean).join("");
}

/**
 * The stylesheets the custom faces are fetched from.
 *
 * A family with no address is a family already on the reader's machine, which
 * needs no request; an address that is not plain https is dropped rather than
 * put in the document's head.
 */
export function customFontUrls(type: TypographySettings | null | undefined): string[] {
  const urls = [safeStylesheet(type?.customFontUrl), safeStylesheet(type?.altFontUrl)];
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}
