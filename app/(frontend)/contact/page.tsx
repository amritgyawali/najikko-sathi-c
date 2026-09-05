import { Suspense } from "react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "../_components/contact-form";
import { getBusiness } from "@/lib/content";
import { getFaqPairs, getServiceViews } from "@/lib/services";
import { MediaShowcase, PageHero, Questions, SectionHeading } from "../_components/page-content";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl, pageMetadata, siteUrl } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata("Contact Our Kathmandu Media Team", "Contact Najikko Sathi Media in Anamnagar, Kathmandu for production, social media, training, and research inquiries. Call 9851336187 or email najikkosathi@gmail.com.", "/contact");

export default async function ContactPage() {
  const [business, services, questions] = await Promise.all([
    getBusiness(),
    getServiceViews(),
    getFaqPairs("contact", [
      ["What information should I share?", "Describe your idea, the intended audience, the service you need, preferred timing, and any relevant budget range. For training, include the topic and group size."],
      ["Can I request several services together?", "Yes. A project may combine research, filming, social content, or training. Describe the overall goal so the individual scopes can be discussed together."],
      ["What happens after I send the form?", "Your message reaches the Najikko Sathi team directly and is tracked until it is answered. You can also use the direct email address or phone numbers on this page."],
    ]),
  ]);
  return <>
    <PageHero eyebrow="Start a conversation" title="Your idea. Our next conversation." description="Tell us what you want to communicate, create, or learn. We’ll discuss the scope and the next steps with you." path="/contact" label="Contact" />
    <section className="content-section"><div className="site-container contact-grid"><div><SectionHeading kicker="Contact directly" title="Find your close companion in Kathmandu." /><address className="contact-methods"><div><Mail aria-hidden="true" /><span><strong>Email</strong><a href={`mailto:${business.email}`}>{business.email}</a></span></div><div><Phone aria-hidden="true" /><span><strong>Phone</strong>{business.phones.map((phone) => <a key={phone} href={`tel:+977${phone}`}>+977 {phone}</a>)}</span></div><div><MapPin aria-hidden="true" /><span><strong>Location</strong>{business.address}, Nepal<a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Anamnagar%2C%20Kathmandu%2C%20Nepal" target="_blank" rel="noopener noreferrer">View Anamnagar on map <ArrowUpRight aria-hidden="true" /></a></span></div></address><div className="contact-legal"><strong>{business.legalName}</strong><span>VAT {business.vat}</span><p>Please call to arrange a visit and confirm the exact meeting location.</p></div></div><Suspense fallback={<p>Prepare an inquiry by emailing <a href={`mailto:${business.email}`}>{business.email}</a>.</p>}><ContactForm services={services.map((service) => service.title)} email={business.email} /></Suspense></div></section>
    <section className="content-section process-section"><div className="site-container faq-grid"><SectionHeading kicker="A useful first message" title="Help us understand your project." /><Questions items={questions} /></div></section>
    <MediaShowcase mediaKey="contact" title="Visit Najikko Sathi" />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Najikko Sathi Media", url: absoluteUrl("/contact"), mainEntity: { "@id": `${siteUrl}/#organization` } }} />
  </>;
}
