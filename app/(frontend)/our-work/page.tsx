import Link from "next/link";
import { ArrowRight, Clapperboard, GraduationCap, Megaphone, Newspaper, Search } from "lucide-react";
import { getCategoryViews, getFaqPairs, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

// The five areas the menu item stands for. Production, training and Right
// Sanchar keep their own pages; social media and research live as sections of
// the services page, so this is the one place that gathers them all.
const workAreas = [
  { icon: Clapperboard, title: "Photography & video production", href: "/production", description: "Biography films, documentaries, commercials, and organizational profiles, from research through to the final edit." },
  { icon: Newspaper, title: "Right Sanchar news portal", href: "/right-sanchar", description: "Our digital news platform for accurate, truthful, and unbiased reporting on issues that matter to the public." },
  { icon: GraduationCap, title: "Training & capacity building", href: "/training", description: "Practical programs in social media, content creation, journalism, and creative production for individuals and teams." },
  { icon: Megaphone, title: "Social media & campaigns", href: "/services#social-media", description: "Digital presence management, branding, audience engagement, and performance marketing across major platforms." },
  { icon: Search, title: "Research & development", href: "/services#research", description: "Field research, media monitoring, data collection, and development work with public and civil society partners." },
];

export const metadata = pageMetadata(
  "Our Work | Production, News, Training & Research",
  "See the work of Najikko Sathi Media in Kathmandu: documentary and video production, the Right Sanchar news portal, media training programs, social media campaigns, and research.",
  "/our-work",
);

export default async function OurWorkPage() {
  const [services, categories, questions] = await Promise.all([
    getServiceViews(),
    getCategoryViews(),
    getFaqPairs("services", [
      ["Can I see examples of previous work?", "Photographs and films are published on each area's page as they are cleared for release. Where a subject's material is private, we can discuss the approach and scope instead of sharing the finished piece."],
      ["Can one project combine several areas?", "Yes. A documentary can sit alongside a social media campaign and a training session for the team that will keep publishing afterwards. Describe the overall goal and the scopes can be planned together."],
      ["How does a project usually start?", "With a conversation about your audience, the message, and where the work will be published. That determines the format, the production plan, and what is needed from your side."],
    ]),
  ]);
  const production = services.filter((service) => service.category.id === "production");
  const category = categories.find((item) => item.id === "production");

  return <>
    <PageHero eyebrow="Our work" title="The stories, campaigns, and programs behind our name." description="Production, news, training, and research are parts of one media practice. This is where each part of our work leads." path="/our-work" label="Our Work" category={category}><Link className="hero-cta" href="/contact?service=Our%20Work">Discuss a project <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container">
      <SectionHeading kicker="What we work on" title="Five areas, one media house." description="Each area has its own page with the scope, process, and the questions worth settling before work begins." />
      <div className="service-detail-grid">{workAreas.map(({ icon: Icon, title, href, description }) => <Link className="service-detail-card" href={href} key={href}>
        <span className="service-card-icon"><Icon aria-hidden="true" /></span>
        <h3>{title}</h3><p>{description}</p><span className="service-card-action">See this work <ArrowRight aria-hidden="true" /></span>
      </Link>)}</div>
    </div></section>
    <section className="content-section related-section"><div className="site-container">
      <SectionHeading kicker="Production portfolio" title="The films and photography we make." />
      <ServiceCards services={production} />
    </div></section>
    <section className="content-section"><div className="site-container">
      <SectionHeading kicker="How a project runs" title="From the first conversation to what you publish." />
      <ProcessSteps steps={[["Understand", "Agree on the audience, the message, and where the finished work will be seen."], ["Plan", "Set the scope, the material to be gathered, and what is needed from your side."], ["Produce", "Film, photograph, write, or teach within the agreed plan."], ["Deliver", "Hand over the formats agreed for your channels, and review the result together."]]} />
    </div></section>
    <MediaShowcase mediaKey="our-work" title="Our work" />
    <section className="content-section"><div className="site-container faq-grid">
      <SectionHeading kicker="Before you brief us" title="Questions we are often asked." />
      <Questions items={questions} />
    </div></section>
    <ContactCta title="Tell us what you want to make." description="Share your audience, your idea, and the areas of our work it touches." service="Our Work" />
  </>;
}
