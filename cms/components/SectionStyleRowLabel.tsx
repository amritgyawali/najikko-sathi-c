"use client";

import { useRowLabel } from "@payloadcms/ui";
import React from "react";

import { AREAS } from "../../lib/typography";

/**
 * The name of a row in Site Settings → Section styles.
 *
 * Without this the rows collapse to "Section style 01", "Section style 02",
 * which is no help at all on a screen whose whole purpose is to hold one row
 * per part of the website. Naming the part means a closed list reads as a list
 * of what has been restyled.
 */
export function SectionStyleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ area?: string }>();
  const area = AREAS.find((entry) => entry.value === data?.area);
  if (area) return <span>{area.label}</span>;
  // A row that has just been added, before a part has been chosen.
  return <span>Section style {String((rowNumber ?? 0) + 1).padStart(2, "0")}</span>;
}

export default SectionStyleRowLabel;
