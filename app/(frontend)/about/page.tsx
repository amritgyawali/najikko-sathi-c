import Link from "next/link";
import { ArrowRight, Camera, HeartHandshake, Newspaper } from "lucide-react";
import Image from "next/image";
import { business, brandPillars } from "../_data/site";
import { getTeam } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { ContactCta, MediaShowcase, PageHero, SectionHeading } from "../_components/page-content";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl, pageMetadata, siteUrl } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata("About Our Kathmandu Media House", "Meet Najikko Sathi Media Pvt. Ltd., a Kathmandu media house connecting truthful journalism, purposeful production, practical training, and social responsibility.", "/about");

export default async function AboutPage() {
  // The team section only appears once someone has been added in the dashboard.
  const team = await getTeam();
  return <>
    <PageHero eyebrow="A close companion in communication" title="Close to people. Committed to their stories." description="We bring information, entertainment, and social responsibility together through honest communication and purposeful media." path="/about" label="About Us"><Link className="hero-cta" href="/services">What we do <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container about-story-grid"><div className="identity-panel"><span className="brand-mark">NS</span><h2>{business.legalName}</h2><p>{business.address}, Nepal</p><span className="identity-rule" /><blockquote>One close companion.<br />Many ways to communicate.</blockquote></div><div className="prose"><SectionHeading kicker="Who we are" title="A media house with a shared purpose." /><p className="lead-copy">Najikko Sathi Media Pvt. Ltd. is a multi-dimensional media house based in Anamnagar, Kathmandu. Our work connects truthful information, visual storytelling, advertising, media skills, and community-focused initiatives.</p><p>Through Right Sanchar, we focus on accurate news, public-interest reporting, commentary, and investigative content. Through our production work, we help people and organizations communicate their stories in photographs, documentaries, biographies, and commercial films.</p><p>Our services also extend to social media handling, practical training, and research. These disciplines share a purpose: making communication understandable, useful, and connected to the people it serves.</p><Link className="text-link" href="/right-sanchar">Get to know Right Sanchar <ArrowRight aria-hidden="true" /></Link></div></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="What guides us" title="Information. Craft. Responsibility." /><div className="values-grid">{[{ icon: Newspaper, title: "Truthful information", text: "Reporting and communication should help people understand an issue. Accuracy, context, and an unbiased perspective guide our media purpose." }, { icon: Camera, title: "Purposeful storytelling", text: "The subject comes first. We connect research, writing, filming, and editing to make a story clear and meaningful for its audience." }, { icon: HeartHandshake, title: "Social responsibility", text: "Media can support learning and public understanding. Our training and social initiatives reflect a commitment to communities as well as communication." }].map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div><div className="about-capabilities">{brandPillars.map((pillar) => <span key={pillar}>{pillar}</span>)}</div></div></section>
    <MediaShowcase mediaKey="about" title="Our media house" />
    {team.length > 0 ? <section className="content-section"><div className="site-container"><SectionHeading kicker="Our people" title="The team behind the work." /><div className="team-grid">{team.map((member) => {
      const photo = mediaUrl(member.photo);
      return <article className="team-card" key={member.id}>
        {photo ? <Image src={photo} alt={mediaAlt(member.photo, member.name)} width={320} height={320} /> : <div className="team-initials" aria-hidden="true">{member.name.slice(0, 1)}</div>}
        <strong>{member.name}</strong>
        <span className="team-role">{member.role}</span>
        {member.bio ? <p>{member.bio}</p> : null}
        {member.email ? <a className="text-link" href={`mailto:${member.email}`}>{member.email}</a> : null}
      </article>;
    })}</div></div></section> : null}
    <ContactCta title="Your story starts with a conversation." />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "AboutPage", name: "About Najikko Sathi Media", url: absoluteUrl("/about"), about: { "@id": `${siteUrl}/#organization` } }} />
  </>;
}
