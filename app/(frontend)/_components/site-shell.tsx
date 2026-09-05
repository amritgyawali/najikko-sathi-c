import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { getBusiness, getFooter, getNavigation } from "@/lib/content";
import { Navigation } from "./navigation";

/**
 * Header and footer for every page on the site. Both read from the CMS and
 * fall back to the copy in _data/site.ts when it is unavailable, so a change
 * made in the dashboard applies site-wide.
 */

export async function Header() {
  const [business, nav] = await Promise.all([getBusiness(), getNavigation()]);

  return (
    <>
      {nav.showUtilityBar ? (
        <div className="utility-bar">
          <div className="site-container utility-inner">
            <div className="utility-contact">
              <span className="utility-phone">
                <Phone aria-hidden="true" />
                {business.phones.map((phone, index) => (
                  <span key={phone}>
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    <a href={`tel:+977${phone}`}>{phone}</a>
                  </span>
                ))}
              </span>
              <a href={`mailto:${business.email}`}>
                <Mail aria-hidden="true" /> {business.email}
              </a>
              <span><MapPin aria-hidden="true" /> {business.address}</span>
            </div>
            <Link className="utility-share" href="/contact" aria-label={`Contact ${business.shortName}`}>
              <Share2 aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
      <header className="site-header">
        <div className="site-container header-inner">
          <Link className="brand" href="/" aria-label={`${business.shortName} home`}>
            {/* The logo uploaded in Site Settings replaces the initials mark. */}
            {business.logoUrl ? (
              <Image className="brand-logo" src={business.logoUrl} alt="" width={132} height={132} priority />
            ) : (
              <span className="brand-mark" aria-hidden="true">{business.initials}</span>
            )}
            <span className="brand-copy">
              <strong>{business.shortName}</strong>
              <small>Media Pvt. Ltd.</small>
            </span>
          </Link>
          <Navigation items={nav.items} />
          {nav.cta.enabled ? (
            <div className="header-actions">
              <Link className="inquiry-button" href={nav.cta.href}>{nav.cta.label}</Link>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}

export async function Footer() {
  const [business, footer] = await Promise.all([getBusiness(), getFooter()]);

  return (
    <footer id="contact">
      <div className="site-container footer-grid">
        <div className="footer-about">
          <h3>Company Info</h3>
          <p>
            {footer.about ||
              `${business.legalName} is a media house focused on truthful information, meaningful storytelling, production, advertising, training, and social responsibility.`}
          </p>
        </div>
        {footer.groups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <ul>{group.links.map((link) => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <h3>Contact Directly</h3>
          <a className="newsletter direct-contact" href={`mailto:${business.email}`}>
            <span>{business.email}</span>
            <ArrowRight aria-hidden="true" />
          </a>
          <p className="footer-phone">
            {business.phones.map((phone, index) => (
              <span key={phone}>{index > 0 ? " / " : ""}<a href={`tel:+977${phone}`}>{phone}</a></span>
            ))}
          </p>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>
          {footer.copyright ||
            `© ${new Date().getFullYear()} ${business.legalName} All Rights Reserved.`}
        </span>
        <span>{business.address} &middot; VAT {business.vat}</span>
      </div>
    </footer>
  );
}
