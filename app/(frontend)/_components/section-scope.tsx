import React from "react";

/**
 * What kind of band this is, for the dashboard to address.
 *
 * Site Settings → Section styles sets type, colour and spacing for one kind of
 * band at a time, and `data-section` is the whole of how it finds one
 * (lib/typography.ts). Every band on the site is wrapped in one of these: the
 * ones a page is built from (PageSections.tsx), and the ones a service page
 * composes by hand.
 *
 * It draws nothing. `.section-scope` is `display: contents` in globals.css, so
 * the band stays the direct child of whatever held it before and no rule that
 * depended on that arrangement changes.
 */
export function SectionScope({ kind, children }: { kind: string; children: React.ReactNode }) {
  return (
    <div className="section-scope" data-section={kind}>
      {children}
    </div>
  );
}
