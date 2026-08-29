import Image from "next/image";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Clapperboard,
  FileText,
  Film,
  GraduationCap,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareText,
  Mic2,
  Newspaper,
  Phone,
  Scissors,
  Search,
  Share2,
  Video,
} from "lucide-react";
import {
  brandPillars,
  business,
  footerGroups,
  navigation,
  rightSancharTopics,
  services,
} from "./_data/site";

const serviceIcons = [
  Newspaper,
  FileText,
  MessageSquareText,
  Search,
  Camera,
  Film,
  Megaphone,
  Video,
  Aperture,
  Clapperboard,
  Scissors,
  GraduationCap,
] as const;

function Header() {
  return (
    <>
      <div className="utility-bar">
        <div className="site-container utility-inner">
          <div className="utility-contact">
            <span className="utility-phone">
              <Phone aria-hidden="true" />
              {business.phones.map((phone, index) => (
                <span key={phone}>
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <a href={`tel:${phone}`}>{phone}</a>
                </span>
              ))}
            </span>
            <a href={`mailto:${business.email}`}>
              <Mail aria-hidden="true" /> {business.email}
            </a>
            <span><MapPin aria-hidden="true" /> {business.address}</span>
          </div>
          <a className="utility-share" href="#contact" aria-label={`Contact ${business.shortName}`}>
            <Share2 aria-hidden="true" />
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <a className="brand" href="#home" aria-label={`${business.shortName} home`}>
            <span className="brand-mark" aria-hidden="true">{business.initials}</span>
            <span className="brand-copy">
              <strong>{business.shortName}</strong>
              <small>Media Pvt. Ltd.</small>
            </span>
          </a>
          <nav className="primary-nav" aria-label="Primary navigation">
            {navigation.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={index === 0 ? "active" : undefined}
                aria-current={index === 0 ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="inquiry-button" href="#contact">Start a conversation</a>
          </div>
        </div>
      </header>
    </>
  );
}

function Hero() {
  return (
    <>
      <section className="hero" id="home">
        <Image
          className="hero-image"
          src="/images/hero.jpg"
          alt="Himalayan skyline above Kathmandu at twilight"
          fill
          sizes="100vw"
          priority
        />
        <div className="hero-overlay" />
        <div className="site-container hero-content">
          <span className="hero-kicker"><i /> Kathmandu-based media house</span>
          <h1>Media that stays close to what matters.</h1>
          <p>
            Honest information, meaningful entertainment, and socially responsible media -
            created in Nepal for people, organizations, and communities.
          </p>
          <div className="hero-actions">
            <a className="hero-cta" href="#services">Explore our services <ArrowRight aria-hidden="true" /></a>
            <a className="hero-secondary" href={business.rightSanchar} target="_blank" rel="noreferrer">
              Visit Right Sanchar <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section className="stats-wrap" aria-label={`${business.shortName} media commitments`}>
        <div className="stats-card">
          <div className="brand-overview">
            <div className="overview-center">
              <small>Our media system</small>
              <strong>{business.initials}</strong>
              <span>Six disciplines.<br />One close companion.</span>
            </div>
            {brandPillars.map((pillar) => <span className="overview-pillar" key={pillar}>{pillar}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}

function About() {
  return (
    <section className="chairman-section" id="about">
      <div className="chairman-shape" aria-hidden="true" />
      <div className="site-container chairman-grid">
        <div className="portrait-wrap">
          <div className="portrait-glow" aria-hidden="true" />
          <div className="media-visual" aria-hidden="true">
            <Camera className="media-visual-main" />
            <Mic2 className="media-visual-mic" />
            <Film className="media-visual-film" />
            <span>Information</span>
            <span>Entertainment</span>
            <span>Responsibility</span>
          </div>
          <div className="portrait-caption">
            <strong>Your Media Partner</strong>
            <span>{business.address}</span>
          </div>
        </div>
        <div className="chairman-copy">
          <div className="eyebrow"><i /> Who We Are</div>
          <h2>{business.legalName}</h2>
          <blockquote>
            Information, entertainment, and social responsibility - advanced together through
            honest communication and purposeful media.
          </blockquote>
          <p>
            We are a dynamic, multi-dimensional media house delivering truthful news through
            Right Sanchar, high-quality documentary and video production, impactful advertising,
            and training focused on media and skill development.
          </p>
          <p>
            Beyond our core media services, we support social initiatives that help transform
            communities. True to our name, we aim to walk beside people and organizations as a
            trusted, close companion in communication.
          </p>
          <div className="about-capabilities" aria-label="Core capabilities">
            <span>Truthful news</span>
            <span>Visual production</span>
            <span>Skill development</span>
          </div>
          <a className="text-link" href="#services">Explore Our Services <ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="verticals-section" id="services">
      <Image
        className="verticals-texture"
        src="/images/verticals-texture.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="site-container verticals-content">
        <div className="verticals-intro">
          <div>
            <span className="section-kicker">Our Services</span>
            <h2>One Media House.<br />Many Ways to Communicate.</h2>
            <p>From verified information to cinematic storytelling, every service is built around clarity, truth, and impact.</p>
          </div>
          <a className="outline-button" href="#production">Explore Production <ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div className="verticals-grid">
          {services.map((name, index) => {
            const Icon = serviceIcons[index];
            return (
              <a className="vertical-card" href={index < 4 ? "#right-sanchar" : "#production"} key={name}>
                <Icon aria-hidden="true" />
                <strong>{name}</strong>
                <ArrowRight className="card-arrow" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Production() {
  return (
    <section className="foundation-section" id="production">
      <div className="site-container foundation-grid">
        <div className="foundation-image-wrap">
          <div className="foundation-backplate" aria-hidden="true" />
          <div className="production-visual" aria-label="Production process: research, script, shoot, and edit">
            <Clapperboard className="production-camera" aria-hidden="true" />
            <div className="production-steps">
              <span><Search aria-hidden="true" /> Research</span>
              <span><FileText aria-hidden="true" /> Script</span>
              <span><Camera aria-hidden="true" /> Shoot</span>
              <span><Scissors aria-hidden="true" /> Edit</span>
            </div>
          </div>
          <div className="legacy-badge"><strong>4</strong><span>Complete Stages</span></div>
        </div>
        <div className="foundation-copy">
          <span className="foundation-chip">Production</span>
          <h2>Stories Brought to Life<br /><em>With Cinematic Craft</em></h2>
          <p>
            We turn ideas, lives, and real events into compelling visual experiences. Our team
            produces biography videos, documentaries, advertisements, and social or corporate
            films through research, scriptwriting, cinematography, and cinematic editing.
          </p>
          <a className="primary-button" href={`mailto:${business.email}?subject=Production%20Inquiry`}>
            Start a Production <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function RightSanchar() {
  return (
    <section className="value-section" id="right-sanchar">
      <div className="site-container value-content">
        <div className="value-heading">
          <h2>Right Information. Right Time. Right Perspective.</h2>
          <p>Right Sanchar delivers accurate, truthful, and unbiased information on issues that matter to the public.</p>
        </div>
        <a className="logo-cloud-card" href={business.rightSanchar} target="_blank" rel="noreferrer" aria-label="Visit Right Sanchar">
          <div className="right-sanchar-card">
            <div className="right-sanchar-identity">
              <span className="portal-icon"><Newspaper aria-hidden="true" /></span>
              <span className="portal-label">Our digital news portal</span>
              <strong>RIGHT<br />SANCHAR</strong>
              <small>{business.rightSancharLabel}</small>
              <span className="portal-action">Visit the portal <ArrowUpRight aria-hidden="true" /></span>
            </div>
            <div className="topic-cloud">
              {rightSancharTopics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </div>
        </a>
        <div className="partners-title"><i /><span>Connect With Us</span><i /></div>
        <div className="partners" aria-label={`${business.shortName} contact links`}>
          <a className="connection-item" href={business.website} target="_blank" rel="noreferrer">
            <strong>Najikko Sathi</strong><small>{business.websiteLabel}</small>
          </a>
          <a className="connection-item" href={business.rightSanchar} target="_blank" rel="noreferrer">
            <strong>Right Sanchar</strong><small>{business.rightSancharLabel}</small>
          </a>
          <a className="connection-item" href={`mailto:${business.email}`}>
            <strong>Email Us</strong><small>{business.email}</small>
          </a>
          <span className="connection-item">
            <strong>Call Us</strong>
            <small className="connection-phone-links">
              {business.phones.map((phone, index) => (
                <a href={`tel:${phone}`} key={phone}>{index > 0 ? " / " : ""}{phone}</a>
              ))}
            </small>
          </span>
          <span className="connection-item"><strong>VAT</strong><small>{business.vat}</small></span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact">
      <div className="site-container footer-grid">
        <div className="footer-about">
          <h3>Company Info</h3>
          <p>
            {business.legalName} is a media house focused on truthful information, meaningful
            storytelling, production, advertising, training, and social responsibility.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <ul>{group.links.map((link) => <li key={link.label}><a href={link.href}>{link.label}</a></li>)}</ul>
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
              <span key={phone}>{index > 0 ? " / " : ""}<a href={`tel:${phone}`}>{phone}</a></span>
            ))}
          </p>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>&copy; 2026 {business.legalName} All Rights Reserved.</span>
        <span>{business.address} &middot; VAT {business.vat}</span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Production />
        <RightSanchar />
      </main>
      <Footer />
    </>
  );
}
