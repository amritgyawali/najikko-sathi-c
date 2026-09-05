import Link from "next/link";
import { ArrowRight, Check, LayoutDashboard, Server, Smartphone } from "lucide-react";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, SectionHeading, TopicGrid } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/** The three things the IT team is usually asked for. */
const work = [
  {
    icon: LayoutDashboard,
    title: "Websites & news portals",
    body:
      "Websites built to be updated by the people who own them. Every site we hand over comes with a dashboard for the pages, the photographs, and the writing, so publishing something new never means calling us back.",
    points: [
      "Company websites, news portals, and campaign microsites",
      "A content dashboard for pages, media, and menus",
      "Search-engine basics, sitemaps, and social preview images built in",
      "Fast, readable pages on the phones most of your audience uses",
    ],
  },
  {
    icon: Smartphone,
    title: "Digital systems & applications",
    body:
      "The tools an organization needs behind the website: enquiry handling, subscriber and member lists, event registration, internal dashboards, and the small pieces of automation that remove repeated manual work.",
    points: [
      "Enquiry, registration, and record-keeping systems",
      "Reporting dashboards drawn from your own data",
      "Integrations with the platforms and payment services you already use",
      "Data kept where you can export it, in formats you can read",
    ],
  },
  {
    icon: Server,
    title: "Hosting, maintenance & support",
    body:
      "Keeping what we built running. Domains and certificates renewed on time, backups taken and tested, software updated, and someone reachable when something stops working during an event or a campaign.",
    points: [
      "Domain, hosting, and certificate management",
      "Automatic backups, with restores actually tested",
      "Security updates and monitoring",
      "A named contact for problems, not a ticket queue",
    ],
  },
];

/** How the IT work is approached, and the limits we are honest about. */
const principles = [
  { title: "Editable by you", text: "The point of a dashboard is that nobody has to wait for a developer. If a change to your own website needs a deploy, we have built it wrong." },
  { title: "Built for Nepali networks", text: "Pages are made to load on a mid-range phone over a mobile connection. Heavy pages that only look good in an office are not finished pages." },
  { title: "Your data stays yours", text: "Accounts, domains, and hosting are registered in your organization's name, and your content is exportable at any point. Nothing about the arrangement depends on you staying with us." },
  { title: "Plain estimates", text: "We say what a piece of work costs, what it does not include, and where we are uncertain, before it starts rather than after." },
];

export const metadata = pageMetadata(
  "IT, Websites & Digital Systems in Kathmandu, Nepal",
  "The IT team at Najikko Sathi Media builds websites and news portals, digital systems and applications, and provides hosting, maintenance, and support for organizations in Nepal.",
  "/it",
);

export default function ItPage() {
  return <>
    <PageHero eyebrow="Information technology" title="The systems that carry the media we make." description="Websites, news portals, and the digital tools behind them - built so the people who own them can keep them running." path="/it" label="IT"><Link className="hero-cta" prefetch={false} href="/contact?service=IT">Discuss a project <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container prose"><SectionHeading kicker="Why a media house has an IT team" title="Publishing is a technical problem too." /><p className="lead-copy">A news portal that goes down during an election, a campaign site that will not load on a phone, and a website whose owner cannot change a phone number without help are all the same problem: media built on systems its own team cannot operate.</p><p>Our IT work exists to solve that for us and for the organizations we work with. We run Right Sanchar and this website on it, so the tools we hand over are the ones we depend on ourselves - the dashboard, the media library, and the publishing workflow all come from the same practice.</p></div></section>
    <section className="content-section related-section"><div className="site-container">
      <SectionHeading kicker="What we build" title="Sites, systems, and the support behind them." />
      <div className="discipline-grid">{work.map(({ icon: Icon, title, body, points }) => <article className="discipline-card" key={title}>
        <span className="service-card-icon"><Icon aria-hidden="true" /></span>
        <h3>{title}</h3>
        <p>{body}</p>
        <ul>{points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
      </article>)}</div>
    </div></section>
    <section className="content-section"><div className="site-container">
      <SectionHeading kicker="How we work" title="Four things we hold to." />
      <TopicGrid items={principles} />
    </div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How a build runs" title="Scope, build, hand over, maintain." /><ProcessSteps steps={[["Scope", "Agree what the system has to do, who will use it, and what it must connect to."], ["Build", "Develop it in stages you can see and comment on, rather than a single reveal at the end."], ["Hand over", "Migrate the content, train your team on the dashboard, and transfer the accounts to your name."], ["Maintain", "Keep it backed up, updated, and monitored, with someone to call when it matters."]]} /></div></section>
    <MediaShowcase mediaKey="it" title="Our IT work" />
    <ContactCta title="Need a site or a system built?" description="Tell us what it has to do, who will be updating it, and when you need it live." service="IT" />
  </>;
}
