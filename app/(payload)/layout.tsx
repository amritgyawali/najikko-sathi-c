import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
// The admin panel's own stylesheet. Without this the dashboard renders as
// unstyled HTML, so it must stay in the layout that wraps every admin route.
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { Inter } from "next/font/google";
import React from "react";

import { importMap } from "./admin/importMap";
import "./custom.css";

// Self-hosted at build time, so the dashboard makes no request to a font CDN.
const inter = Inter({ subsets: ["latin"], display: "swap" });

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {/* custom.css reads this, so the whole panel picks up the typeface. */}
      <style>{`:root{--font-admin:${inter.style.fontFamily};}`}</style>
      {children}
    </RootLayout>
  );
}
