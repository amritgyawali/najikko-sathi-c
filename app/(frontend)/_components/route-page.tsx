import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPageAt } from "@/lib/page-content";
import { pageMetadata } from "../_lib/seo";
import { PageSections } from "./PageSections";

/**
 * How a built-in page draws itself.
 *
 * Each route under app/(frontend) is now a few lines: it names its address and
 * lets this find the page. What comes back is either the page as an editor has
 * saved it in the dashboard, or the copy it ships with (lib/page-defaults.ts).
 * A page an editor has taken off the website answers with the 404 page, exactly
 * as an address that never existed does.
 */

/** Title and description for a built-in page, with the dashboard's overrides. */
export async function routeMetadata(path: string): Promise<Metadata> {
  const page = await getPageAt(path);
  if (!page) return {};

  const meta = pageMetadata(page.seo.title, page.seo.description, path);
  return page.noindex ? { ...meta, robots: { index: false, follow: false } } : meta;
}

export async function RoutePage({ path, query }: { path: string; query?: string }) {
  const page = await getPageAt(path);
  if (!page || page.hidden) notFound();

  return <PageSections sections={page.sections} page={{ path, label: page.title, query }} />;
}
