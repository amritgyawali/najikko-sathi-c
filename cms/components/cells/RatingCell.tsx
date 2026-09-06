"use client";

import React from "react";

/**
 * A review's rating, as the stars it stands for. Five characters read faster
 * than the number does, and an empty rating shows as five dim stars rather than
 * as a blank cell.
 */

type Props = { cellData?: unknown };

export function RatingCell({ cellData }: Props) {
  const value = Math.max(0, Math.min(5, Math.round(Number(cellData) || 0)));

  return (
    <span className="ns-stars" title={value ? `${value} out of 5` : "No rating"} aria-label={value ? `${value} out of 5` : "No rating"}>
      {[1, 2, 3, 4, 5].map((step) => (
        <svg key={step} className={step <= value ? "is-on" : ""} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8Z" />
        </svg>
      ))}
    </span>
  );
}

export default RatingCell;
