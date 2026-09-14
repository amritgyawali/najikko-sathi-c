import React from "react";
import { getBranding } from "@/lib/branding";

/**
 * The company's mark inside the dashboard: small in the sidebar, larger above
 * the sign-in form.
 *
 * Both read the one logo uploaded in **Site → Site Settings → Logo**, so the
 * dashboard shows whatever the website shows. Payload draws its own mark when
 * these are absent, which is what an editor would otherwise be looking at while
 * their own logo sat on every page of the site.
 *
 * Plain `img` rather than next/image: these sit inside Payload's own shell,
 * which is not the website's layout, and the mark is a single small picture
 * shown on every dashboard screen - going through the image optimiser to fetch
 * it would gain nothing and put the panel's chrome behind a second request.
 */

async function Mark({ size, className }: { size: number; className: string }) {
  const branding = await getBranding();

  // Nothing uploaded yet: the initials, drawn the way the website draws them.
  if (!branding.uploaded) {
    return (
      <span className={`${className} ${className}--initials`} aria-hidden="true">
        {branding.initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see above.
    <img
      className={className}
      src={branding.url}
      alt={branding.alt}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

/** Beside the menu, and anywhere Payload asks for the small mark. */
export function BrandIcon() {
  return <Mark size={28} className="ns-brand-graphic" />;
}

/** Above the sign-in form. */
export function BrandLogo() {
  return <Mark size={88} className="ns-brand-graphic ns-brand-graphic--large" />;
}
