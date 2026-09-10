import type { Field } from "payload";

/**
 * Turns a saved document into the individual pieces of text an editor could
 * search for.
 *
 * The walk follows the *field configuration* rather than the raw data, so every
 * piece of text arrives with a readable trail ("Layout > Hero > Heading") and
 * the dotted path Payload uses for the field's DOM id. That is what lets a
 * search result link straight to the field that needs editing.
 */

export type TextEntry = {
  /** Readable breadcrumb of the field, e.g. "Layout > Hero > Heading". */
  label: string;
  /** Dotted data path, e.g. "layout.0.heading". */
  path: string;
  /** The text itself. */
  text: string;
  /** Relative importance; body copy is 1, incidental values are lower. */
  weight: number;
};

/** Fields that are plumbing, secrets, or machine values - never search them. */
const SKIP_NAMES = new Set([
  "id",
  "_id",
  "_status",
  "_verified",
  "_verificationToken",
  "createdAt",
  "updatedAt",
  "password",
  "salt",
  "hash",
  "apiKey",
  "apiKeySalt",
  "resetPasswordToken",
  "resetPasswordExpiration",
  "loginAttempts",
  "lockUntil",
  "sessions",
  "mimeType",
  "filesize",
  "width",
  "height",
  "focalX",
  "focalY",
  "sizes",
  "url",
  "thumbnailURL",
]);

/** Field types that hold text worth searching, and how much they weigh. */
const TEXT_WEIGHTS: Record<string, number> = {
  text: 1,
  textarea: 1,
  email: 0.8,
  code: 0.7,
  richText: 1,
};

const humanise = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());

/** Field labels may be a string, a translations object, or switched off. */
const labelOf = (field: { name?: string; label?: unknown }): string => {
  const { label } = field;
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    const translations = label as Record<string, unknown>;
    const preferred =
      translations.en ?? Object.values(translations).find((value) => typeof value === "string");
    if (typeof preferred === "string") return preferred;
  }
  return field.name ? humanise(field.name) : "";
};

const trailWith = (trail: string[], label: string): string[] => (label ? [...trail, label] : trail);

const pathWith = (path: string, name?: string): string => {
  if (!name) return path;
  return path ? `${path}.${name}` : name;
};

/**
 * Every string held under a value, however deeply nested. Used for the parts of
 * a rich-text tree that do not follow the plain paragraph shape.
 */
const deepStrings = (value: unknown, found: string[] = []): string[] => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) found.push(trimmed);
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) deepStrings(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_NAMES.has(key) || key === "blockType" || key === "type" || key === "version") continue;
      deepStrings(nested, found);
    }
  }
  return found;
};

type LexicalNode = { text?: unknown; children?: unknown; type?: unknown; fields?: unknown };

/** The visible text of one rich-text node, with its descendants run together. */
const nodeText = (node: unknown): string => {
  if (!node || typeof node !== "object") return "";
  const typed = node as LexicalNode;
  if (typeof typed.text === "string") return typed.text;
  if (Array.isArray(typed.children)) return typed.children.map(nodeText).join("");
  return "";
};

/**
 * Splits a rich-text value into one string per top-level block, so a snippet
 * shows the paragraph a word appears in rather than the whole article.
 */
const richTextBlocks = (value: unknown): string[] => {
  const root = (value as { root?: { children?: unknown } } | null | undefined)?.root;
  if (!root || !Array.isArray(root.children)) return [];

  const blocks: string[] = [];
  for (const child of root.children) {
    const text = nodeText(child).replace(/\s+/g, " ").trim();
    if (text) {
      blocks.push(text);
      continue;
    }
    // Embedded blocks and uploads carry their own fields rather than text.
    const embedded = (child as LexicalNode)?.fields;
    if (embedded) blocks.push(...deepStrings(embedded));
  }
  return blocks;
};

/** The chosen option's label, so "Contact page" is findable, not "contact". */
const selectText = (field: Field, value: unknown): string[] => {
  const options = (field as { options?: unknown }).options;
  if (!Array.isArray(options)) return [];
  const values = Array.isArray(value) ? value : [value];
  const labels: string[] = [];
  for (const entry of values) {
    if (typeof entry !== "string") continue;
    const option = options.find((candidate) =>
      typeof candidate === "string"
        ? candidate === entry
        : (candidate as { value?: string })?.value === entry,
    );
    if (typeof option === "string") labels.push(option);
    else if (option) labels.push(labelOf(option as { label?: unknown; name?: string }) || entry);
    else labels.push(entry);
  }
  return labels;
};

const push = (out: TextEntry[], label: string, path: string, text: unknown, weight: number) => {
  if (typeof text !== "string") return;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return;
  out.push({ label, path, text: trimmed, weight });
};

function collectField(
  field: Field,
  data: Record<string, unknown>,
  trail: string[],
  path: string,
  out: TextEntry[],
) {
  const name = (field as { name?: string }).name;
  if (name && SKIP_NAMES.has(name)) return;

  switch (field.type) {
    // Presentational wrappers: same data, one level deeper in the config.
    case "row":
    case "collapsible": {
      for (const child of field.fields) collectField(child, data, trail, path, out);
      return;
    }

    case "tabs": {
      for (const tab of field.tabs) {
        const tabName = (tab as { name?: string }).name;
        const nested = tabName ? (data[tabName] as Record<string, unknown> | undefined) : data;
        if (!nested || typeof nested !== "object") continue;
        const tabTrail = trailWith(trail, labelOf(tab as { name?: string; label?: unknown }));
        const tabPath = pathWith(path, tabName);
        for (const child of tab.fields) collectField(child, nested, tabTrail, tabPath, out);
      }
      return;
    }

    case "group": {
      const nested = name ? data[name] : data;
      if (!nested || typeof nested !== "object") return;
      const groupTrail = trailWith(trail, labelOf(field));
      for (const child of field.fields) {
        collectField(child, nested as Record<string, unknown>, groupTrail, pathWith(path, name), out);
      }
      return;
    }

    case "array": {
      const rows = name ? data[name] : undefined;
      if (!Array.isArray(rows)) return;
      const arrayLabel = labelOf(field);
      rows.forEach((row, index) => {
        if (!row || typeof row !== "object") return;
        const rowTrail = trailWith(trail, `${arrayLabel} ${index + 1}`);
        const rowPath = `${pathWith(path, name)}.${index}`;
        for (const child of field.fields) {
          collectField(child, row as Record<string, unknown>, rowTrail, rowPath, out);
        }
      });
      return;
    }

    case "blocks": {
      const rows = name ? data[name] : undefined;
      if (!Array.isArray(rows)) return;
      rows.forEach((row, index) => {
        if (!row || typeof row !== "object") return;
        const record = row as Record<string, unknown>;
        const block = field.blocks.find((candidate) => candidate.slug === record.blockType);
        if (!block) return;
        const singular = block.labels?.singular;
        const blockLabel = singular ? labelOf({ label: singular }) : humanise(block.slug);
        const named = typeof record.blockName === "string" ? record.blockName.trim() : "";
        const rowTrail = trailWith(trail, named ? `${blockLabel} (${named})` : blockLabel);
        const rowPath = `${pathWith(path, name)}.${index}`;
        for (const child of block.fields) collectField(child, record, rowTrail, rowPath, out);
      });
      return;
    }

    case "richText": {
      if (!name) return;
      const label = trailWith(trail, labelOf(field)).join(" > ");
      const fieldPath = pathWith(path, name);
      for (const block of richTextBlocks(data[name])) {
        push(out, label, fieldPath, block, TEXT_WEIGHTS.richText);
      }
      return;
    }

    case "select":
    case "radio": {
      if (!name) return;
      const label = trailWith(trail, labelOf(field)).join(" > ");
      for (const text of selectText(field, data[name])) {
        push(out, label, pathWith(path, name), text, 0.5);
      }
      return;
    }

    default: {
      const weight = TEXT_WEIGHTS[field.type];
      if (!weight || !name) return;
      const label = trailWith(trail, labelOf(field)).join(" > ");
      push(out, label, pathWith(path, name), data[name], weight);
    }
  }
}

/** Every searchable piece of text in a document, in document order. */
export function extractText(fields: Field[], data: unknown): TextEntry[] {
  if (!data || typeof data !== "object") return [];
  const out: TextEntry[] = [];
  for (const field of fields) collectField(field, data as Record<string, unknown>, [], "", out);
  return out;
}
