import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import {
  loadActivity,
  loadCalendar,
  loadHealth,
  loadInbox,
  loadLibrary,
  loadMediaReport,
  loadSeoAudit,
  loadTraffic,
} from "../../dashboard/insights";
import { MediaStudio } from "./MediaStudio";
import { PageStudio } from "./PageStudio";
import { TrafficChart } from "./TrafficChart";
import { Workspace, type Section } from "./Workspace";
import { Activity, Calendar, Findings, SiteHealth, Toolbox, TrafficDetail, Waiting } from "./panels";
import { Icon, Panel, Stat, nf } from "./ui";

/**
 * The dashboard home.
 *
 * Everything an owner opens this dashboard for, on one screen: how the website
 * is doing, what is waiting on them, every page and how to change any part of
 * it, every place a picture goes, what search engines make of the site, whether
 * the backups are running, and the handful of jobs that are not editing
 * anything.
 *
 * It is one server component so that all of it is read in a single pass and
 * arrives together - a dashboard that fills in panel by panel feels slower than
 * one that takes the same time and appears at once. The tabs, the search box,
 * the chart's range switch and the four buttons that do something are the only
 * client components; every other panel is HTML by the time it reaches the
 * browser.
 */

type Props = {
  payload?: Payload;
  user?: { name?: string | null; email?: string | null; role?: string | null } | null;
};

/** "Good morning" is worth more than "Dashboard" at the top of a page. */
const greet = (): string => {
  // The people using this dashboard are in Nepal, so the hour is read there
  // rather than wherever the server happens to be.
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kathmandu" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const firstName = (user: Props["user"]): string => {
  const name = user?.name?.trim();
  if (name) return name.split(/\s+/)[0];
  const email = user?.email ?? "";
  return email ? email.split("@")[0] : "there";
};

export async function DashboardHome({ payload, user }: Props) {
  if (!payload) return null;

  const [traffic, library, inbox, activity, seo, media, health, calendar] = await Promise.all([
    loadTraffic(payload),
    loadLibrary(payload),
    loadInbox(payload),
    loadActivity(payload),
    loadSeoAudit(payload),
    loadMediaReport(payload),
    loadHealth(payload),
    loadCalendar(payload),
  ]);

  const last14 = traffic.series.slice(-14).map((point) => point.count);
  const last7 = traffic.series.slice(-7).map((point) => point.count);
  const backupCheck = health.checks.find((check) => check.label === "Daily backup");

  const overview = (
    <>
      <div className="ns-split">
        <Panel
          title="Visitors"
          icon="pulse"
          accent={5}
          meta={traffic.best ? `Best day: ${nf(traffic.best.count)}` : undefined}
        >
          <TrafficChart series={traffic.series} />
        </Panel>
        <Waiting inbox={inbox} />
      </div>

      <div className="ns-split ns-split--even">
        <Activity changes={activity} />
        <Panel
          title="What is on the website"
          icon="page"
          accent={6}
          actions={
            <Link className="ns-chip" href="/admin/collections/pages">
              Manage pages
            </Link>
          }
        >
          <div className="ns-grid ns-grid--mini">
            <Stat label="Live pages" value={nf(library.pages)} accent={5} href="/admin/collections/pages" />
            <Stat label="Posts" value={nf(library.posts)} accent={6} href="/admin/collections/posts" />
            <Stat label="Services" value={nf(library.services)} accent={1} href="/admin/collections/services" />
            <Stat label="Offers" value={nf(library.offers)} accent={2} href="/admin/collections/offers" />
            <Stat label="Reviews live" value={nf(library.reviews)} accent={3} href="/admin/collections/reviews" />
            <Stat label="Questions" value={nf(library.faqs)} accent={4} href="/admin/collections/faqs" />
            <Stat label="Team" value={nf(library.team)} accent={5} href="/admin/collections/team-members" />
            <Stat label="Files" value={nf(library.media)} accent={6} href="/admin/collections/media" />
          </div>
          {library.drafts > 0 ? (
            <p className="ns-note">
              {library.drafts} page{library.drafts === 1 ? " is" : "s are"} written but not on the website.{" "}
              <Link href="/admin/collections/pages?where[status][not_equals]=published">See them</Link>.
            </p>
          ) : null}
        </Panel>
      </div>
    </>
  );

  const sections: Section[] = [
    { key: "overview", label: "Overview", icon: <Icon name="pulse" />, badge: inbox.total, panel: overview },
    {
      key: "pages",
      label: "Pages",
      icon: <Icon name="page" />,
      panel: <PageStudio payload={payload} views={traffic.viewsByPath} />,
    },
    {
      key: "pictures",
      label: "Photos & films",
      icon: <Icon name="image" />,
      panel: <MediaStudio payload={payload} report={media} />,
    },
    {
      key: "traffic",
      label: "Traffic",
      icon: <Icon name="compass" />,
      panel: <TrafficDetail traffic={traffic} />,
    },
    {
      key: "found",
      label: "Being found",
      icon: <Icon name="search" />,
      badge: seo.findings.filter((finding) => finding.severity === "high").length,
      panel: (
        <>
          <Findings
            audit={seo}
            title="How this website looks in a search result"
            clean="Every page has a title, a description and a picture for when it is shared. There is nothing to fix."
            icon="search"
            accent={5}
            ringLabel="Ready to be found"
          />
          <Calendar entries={calendar} />
        </>
      ),
    },
    {
      key: "health",
      label: "Health",
      icon: <Icon name="shield" />,
      badge: health.checks.filter((check) => check.state !== "ok").length,
      panel: <SiteHealth health={health} />,
    },
    {
      key: "tools",
      label: "Tools",
      icon: <Icon name="tools" />,
      panel: <Toolbox backupHint={backupCheck?.detail ?? ""} />,
    },
  ];

  return (
    <div className="ns-home">
      <header className="ns-hero">
        <div className="ns-hero__text">
          <p className="ns-hero__kicker">
            {traffic.live > 0 ? (
              <span className="ns-pulse">
                <span className="ns-pulse__dot" aria-hidden="true" />
                {nf(traffic.live)} reading the site right now
              </span>
            ) : (
              <span className="ns-pulse ns-pulse--quiet">
                <span className="ns-pulse__dot" aria-hidden="true" />
                Nobody on the site this half hour
              </span>
            )}
          </p>
          <h2 className="ns-hero__title">
            {greet()}, {firstName(user)}.
          </h2>
          <p className="ns-hero__sub">
            {inbox.total > 0
              ? `${inbox.total} thing${inbox.total === 1 ? "" : "s"} waiting on you, and ${nf(traffic.today.now)} visit${traffic.today.now === 1 ? "" : "s"} to the website today.`
              : `Nothing is waiting on you. ${nf(traffic.today.now)} visit${traffic.today.now === 1 ? "" : "s"} to the website today.`}
          </p>
        </div>

        <div className="ns-hero__actions">
          <Link className="ns-btn ns-btn--primary" href="/admin/collections/posts/create">
            Write a post
          </Link>
          <Link className="ns-btn" href="/admin/collections/pages/create">
            Build a page
          </Link>
          <Link className="ns-btn" href="/admin/collections/media/create">
            Upload a file
          </Link>
          <a className="ns-btn" href="/" target="_blank" rel="noreferrer">
            View website
          </a>
        </div>
      </header>

      <div className="ns-grid ns-grid--tiles">
        <Stat
          label="Visits today"
          value={nf(traffic.today.now)}
          change={traffic.today.change}
          hint="against yesterday"
          spark={last7}
          accent={5}
        />
        <Stat
          label="This week"
          value={nf(traffic.week.now)}
          change={traffic.week.change}
          hint="against the week before"
          spark={last14}
          accent={6}
        />
        <Stat
          label="This month"
          value={nf(traffic.month.now)}
          change={traffic.month.change}
          hint={`about ${nf(traffic.perDay)} a day`}
          spark={traffic.series.slice(-30).map((point) => point.count)}
          accent={3}
        />
        <Stat
          label="New enquiries"
          value={nf(inbox.items.find((item) => item.key === "enquiries")?.count ?? 0)}
          hint={inbox.items.find((item) => item.key === "enquiries")?.note}
          tone={(inbox.items.find((item) => item.key === "enquiries")?.count ?? 0) > 0 ? "attention" : "calm"}
          href="/admin/collections/enquiries?where[state][equals]=new"
        />
        <Stat
          label="Reviews to approve"
          value={nf(inbox.items.find((item) => item.key === "reviews")?.count ?? 0)}
          hint={inbox.items.find((item) => item.key === "reviews")?.note}
          tone={(inbox.items.find((item) => item.key === "reviews")?.count ?? 0) > 0 ? "attention" : "calm"}
          href="/admin/collections/reviews?where[approved][equals]=false"
        />
        <Stat
          label="Being found"
          value={`${seo.score}%`}
          hint={
            seo.findings.length === 0
              ? "Nothing to fix"
              : `${seo.findings.length} thing${seo.findings.length === 1 ? "" : "s"} to fix`
          }
          // The stripe follows the score, so a healthy site is never edged in
          // the colour the dashboard uses for something being wrong.
          accent={seo.score >= 80 ? 6 : 2}
        />
      </div>

      <Workspace sections={sections} />
    </div>
  );
}

export default DashboardHome;
