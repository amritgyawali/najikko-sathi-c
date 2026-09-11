"use client";

import type { ElementType, ReactNode } from "react";

import { useLanguage } from "./language-provider";

/**
 * A piece of copy that may have been written twice.
 *
 * The website is authored in English and turned into Nepali against the phrase
 * book in lib/i18n — good enough for labels and navigation, and a guess
 * wherever the words matter. So every line of copy in every section carries an
 * optional Nepali field beside it in the dashboard, and this is what reads it:
 * whatever an editor wrote in Nepali is shown exactly as written and marked
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
  id,
  translate = false,
  children,
}: {
  /** What was written in Nepali, if anything was. */
  ne?: string | null;
  /** The element to draw. A heading stays a heading in either language. */
  as?: ElementType;
  className?: string;
  /** Kept so a heading something else points at keeps its anchor. */
  id?: string;
  /**
   * Leaves the phrase book free to work on the Nepali as well.
   *
   * Almost nothing wants this: a Nepali sentence an editor typed is finished,
   * and running it through a phrase book could only damage it. The exception
   * is a line the page builds around what was written — the photo band's
   * "<name> in pictures & film" — where the words an editor supplies are one
   * part of a sentence the phrase book knows how to turn round as a whole.
   */
  translate?: boolean;
  /** The English, exactly as it renders when no Nepali has been written. */
  children: ReactNode;
}) {
  const { language } = useLanguage();
  const written = language === "ne" ? ne?.trim() : "";

  if (!written) return <Tag className={className} id={id}>{children}</Tag>;

  if (translate) return <Tag className={className} id={id}>{written}</Tag>;

  return (
    <Tag className={className} id={id} lang="ne" data-no-translate>
      {written}
    </Tag>
  );
}

/** A line of copy and the Nepali written beside it, passed around as one. */
export type Copy = { en: string; ne?: string | null };
