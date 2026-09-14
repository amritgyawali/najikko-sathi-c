import type { Metadata } from "next";
import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { getBranding, iconsFor } from "@/lib/branding";

import { importMap } from "../importMap";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

/**
 * Payload writes the dashboard's own title and tab icon. The title is left
 * alone; the icon is replaced with the logo uploaded in Site Settings, so the
 * dashboard tab and the website tab show the same mark.
 */
export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const [meta, branding] = await Promise.all([
    generatePageMetadata({ config, params, searchParams }),
    getBranding(),
  ]);
  return { ...meta, icons: iconsFor(branding) };
};

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config, params, searchParams, importMap });
}
