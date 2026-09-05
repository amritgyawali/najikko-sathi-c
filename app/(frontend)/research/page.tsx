import Link from "next/link";
import { ArrowRight, Building2, Globe2, Landmark } from "lucide-react";
import { getCategoryViews, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, SectionHeading, ServiceCards, TopicGrid } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/** The kinds of organization we carry out research and development work with. */
const partners = [
  {
    icon: Landmark,
    title: "Government organizations",
    text: "Ministries, departments, provincial and local bodies commissioning field studies, public information campaigns, and documentation of programs already under way.",
  },
  {
    icon: Building2,
    title: "Non-governmental organizations",
    text: "National NGOs working on development, rights, and service delivery, who need evidence gathered in the field and communicated to the people it concerns.",
  },
  {
    icon: Globe2,
    title: "International organizations",
    text: "INGOs and development partners running programs across several districts, where research, monitoring, and reporting have to hold up to external review.",
  },
];

/** The subjects our research and development work keeps returning to. */
const subjects = [
  { title: "Rural Journalism", text: "Reporting from outside the capital, and building the capacity of local reporters to cover their own districts. Much of what matters in Nepal is never reported because nobody is there to report it." },
  { title: "Development", text: "Documenting what development programs actually change on the ground - infrastructure, services, livelihoods - and where the gap sits between what was planned and what people received." },
  { title: "Productivity", text: "Studies on agricultural and enterprise productivity: what households and small businesses produce, what limits them, and what support has measurably helped." },
  { title: "Education", text: "School access, attendance, teaching conditions, and the reasons children leave. Research that treats the classroom and the household as parts of the same picture." },
  { title: "Human Rights", text: "Field research and documentation on rights, access to justice, and the treatment of groups whose experience rarely reaches a public record." },
  { title: "Animal Rights", text: "The welfare of working, farmed, and stray animals, and the practices, laws, and local initiatives that affect them." },
];

export const metadata = pageMetadata(
  "Research & Development with GOs, NGOs and INGOs in Nepal",
  "Najikko Sathi Media carries out field research and development work with government, non-governmental, and international organizations on rural journalism, education, productivity, and rights in Nepal.",
  "/research",
);

export default async function ResearchPage() {
  const [services, categories] = await Promise.all([getServiceViews(), getCategoryViews()]);
  const category = categories.find((item) => item.id === "research");

  return <>
    <PageHero eyebrow="Research & development" title="Evidence gathered where the work actually happens." description="We work with government, non-governmental, and international organizations on research and development - in the field, in the districts, and with the people a program is meant to serve." path="/research" label="Research" category={category}><Link className="hero-cta" prefetch={false} href="/contact?service=Research">Discuss a study <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container prose"><SectionHeading kicker="Who we work with" title="We work with different GO, NGO, and INGO partners." /><p className="lead-copy">Research and development is a standing part of our practice. We work with government organizations, non-governmental organizations, and international organizations - designing the study, collecting the material in the field, and reporting what it shows.</p><p>Being a media house is what makes this useful rather than duplicative. The same team that collects the data can film the interviews, photograph the sites, and turn the findings into something a community, a donor, and a ministry can each understand. Research that stays in a PDF changes very little.</p></div></section>
    <section className="content-section related-section"><div className="site-container">
      <SectionHeading kicker="Our partners" title="Three kinds of organization, one way of working." />
      <div className="values-grid">{partners.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>
    <section className="content-section"><div className="site-container">
      <SectionHeading kicker="What we research" title="Rural journalism, development, and the rights behind them." description="These are the subjects our work returns to most often. A study outside them is worth discussing - the method is the same." />
      <TopicGrid items={subjects} />
    </div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Related services" title="How a study is scoped." /><ServiceCards services={services.filter((service) => service.category.id === "research")} /></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How a study runs" title="Question, field, findings, publication." /><ProcessSteps steps={[["Frame the question", "Agree what the study needs to establish, who it is for, and what a useful answer would look like."], ["Design the method", "Decide the sample, the districts, the instruments, and the consent and safeguarding the subject requires."], ["Collect in the field", "Interview, observe, photograph, and film, with local researchers who know the area."], ["Report and publish", "Deliver the written findings and, where it helps, the film and photography that carry them to a wider audience."]]} /></div></section>
    <MediaShowcase mediaKey="research" title="Research & development" />
    <ContactCta title="Have a study you need carried out?" description="Tell us the question, the districts involved, and the timeline you are working to." service="Research" />
  </>;
}
