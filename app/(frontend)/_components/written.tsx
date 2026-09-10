"use client";

import type { ElementType, ReactNode } from "react";

import { useLanguage } from "./language-provider";

/**
 * A piece of copy that may have been written twice.
 *
 * The website is authored in English and turned into Nepali against the phrase
 * book in lib/i18n — good enough for labels and navigation, and a guess
 * wherever the words matter. So every band of the front page carries an
 * optional Nepali field in the dashboard, and this is what reads it: whatever
 * an editor wrote in Nepali is shown exactly as written and marked
 * `data-no-translate`, so the phrase book never touches it. A field left empty
 * is not a problem to solve — the English renders as it always has, and the
 * phrase book translates it as it always has.
 *
 * The leadership carousel does the same thing for its own messages; this is
 * that idea made available to any piece of copy.
 */
export function Written({
  ne,
  as: Tag = "span",
  className,
  children,
}: {
  /** What was written in Nepali, if anything was. */
  ne?: string | null;
  /** The element to draw. A heading stays a heading in either language. */
  as?: ElementType;
  className?: string;
  /** The English, exactly as it renders when no Nepali has been written. */
  children: ReactNode;
}) {
  const { language } = useLanguage();
  const written = language === "ne" ? ne?.trim() : "";

  if (!written) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag className={className} lang="ne" data-no-translate>
      {written}
    </Tag>
  );
}
