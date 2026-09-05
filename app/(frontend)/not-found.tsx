import Link from "next/link";

export default function NotFound() {
  return <section className="site-container not-found"><span className="foundation-chip">404 · Page not found</span><h1>Let’s find the right page.</h1><p>This address does not match a page on our website. Explore our service portfolio or return home.</p><Link className="primary-button" href="/services">Explore our services</Link><p><Link className="text-link" href="/">Return home</Link></p></section>;
}
