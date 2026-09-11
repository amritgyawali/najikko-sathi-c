import type { Field } from "payload";

/**
 * English and Nepali, written side by side.
 *
 * The website is authored in English and turned into Nepali against the phrase
 * book in lib/i18n. That is good enough for navigation and labels and a guess
 * everywhere the words actually matter, so every piece of copy an editor writes
 * carries a Nepali counterpart of its own: a field named `<name>Ne` holding
 * exactly what a visitor reads after pressing ने.
 *
 * The two halves are always drawn in the same row, English on the left and
 * Nepali on the right, so a section is written once in two languages rather
 * than twice in two places. Nothing is folded away and nothing has to be
 * hunted for further down the form: whoever is writing the heading can see the
 * Nepali heading beside it as they type.
 *
 * Nothing here is required. A Nepali field left empty means what it has always
 * meant - show the English, translated against the phrase book - so a section
 * can be half translated, or not translated at all, and the website reads
 * correctly either way. app/(frontend)/_components/written.tsx is the other
 * end of this: it prints the Nepali when there is any and the English when
 * there is not.
 */

/** Said under every Nepali field in the dashboard. */
export const NEPALI_NOTE =
  "Shown when the website is read in Nepali. Leave it empty to keep the English.";

/** Said at the top of a section whose fields come in pairs. */
export const BILINGUAL_NOTE =
  "Every line is written twice: English on the left, Nepali on the right. " +
  "Anything typed into a Nepali box is shown exactly as written; leaving it " +
  "empty keeps the English, translated as before.";

/** How a field's name reads as a label when none was given. */
const titleCase = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (first) => first.toUpperCase());

export type Copy = {
  /** The English field's name. The Nepali one is this plus "Ne". */
  name: string;
  type?: "text" | "textarea";
  /** Names the pair. Each half adds its own language to it. */
  label?: string;
  /** Only ever applies to the English half. */
  required?: boolean;
  defaultValue?: string;
  /** Shown under the English half. */
  description?: string;
  /** Replaces the standard note under the Nepali half. */
  nepaliDescription?: string;
};

/**
 * One line of copy, in both languages, as a single row of the form.
 *
 * The English half keeps the name, the type, the default and the "required"
 * mark the field had before it was paired, so nothing that was already written
 * moves or has to be re-entered.
 */
export const bilingual = ({
  name,
  type = "text",
  label,
  required,
  defaultValue,
  description,
  nepaliDescription,
}: Copy): Field => {
  const title = label ?? titleCase(name);

  return {
    type: "row",
    fields: [
      {
        name,
        type,
        label: `${title} (English)`,
        ...(required ? { required: true } : {}),
        ...(defaultValue !== undefined ? { defaultValue } : {}),
        admin: { width: "50%", ...(description ? { description } : {}) },
      },
      {
        name: `${name}Ne`,
        type,
        label: `${title} (Nepali)`,
        admin: {
          width: "50%",
          // Tinted in app/(payload)/custom.css, so the two columns are told
          // apart at a glance rather than by reading every label.
          className: "ns-nepali",
          description: nepaliDescription ?? NEPALI_NOTE,
        },
      },
    ],
  } as Field;
};

/** Several lines of copy, each one its own row. */
export const bilingualFields = (...copies: Copy[]): Field[] => copies.map(bilingual);
