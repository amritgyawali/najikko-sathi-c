import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

// Verify real production HTML, metadata, links, and responsive interactions.
// Run `npm run build` first. An existing server can be supplied via CHECK_BASE_URL.
const require = createRequire(import.meta.url);
const origin = process.env.CHECK_BASE_URL || "http://127.0.0.1:3100";
let server;
let browser;
let serverOutput = "";

try {
  if (!process.env.CHECK_BASE_URL) {
    server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3100"], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    server.stdout.on("data", (chunk) => { serverOutput += chunk; });
    server.stderr.on("data", (chunk) => { serverOutput += chunk; });
  }
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server && server.exitCode !== null) throw new Error(`Preview server failed: ${serverOutput}`);
    try { const response = await fetch(origin, { signal: AbortSignal.timeout(2000) }); ready = response.ok; } catch {}
    if (ready) break;
    await delay(500);
  }
  assert(ready, `Preview server did not start: ${serverOutput}`);
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const publishedUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  // Content is managed in the CMS, so the sitemap grows as pages are published.
  // Assert that everything reachable is listed rather than fixing a total.
  const sitemapPaths = new Set(publishedUrls.map((url) => new URL(url).pathname));
  for (const required of ["/", "/about", "/services", "/our-work", "/production", "/training", "/right-sanchar", "/contact"]) {
    assert(sitemapPaths.has(required), `Navigation page missing from the sitemap: ${required}`);
  }
  const serviceCount = [...sitemapPaths].filter((path) => path.startsWith("/services/")).length;
  assert(serviceCount >= 16, `Expected at least 16 service pages in the sitemap, found ${serviceCount}`);
  assert(!sitemapPaths.has("/search"), "The search page is noindex and must not be in the sitemap");
  assert.equal(new Set(publishedUrls).size, publishedUrls.length, "Sitemap URLs must be unique");
  const paths = publishedUrls.map((url) => new URL(url).pathname);
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/najikkosathi\.com\/sitemap\.xml/);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const titles = new Set();
  const descriptions = new Set();
  const links = new Set();
  const previewImages = new Set();
  await mkdir("tmp/site-check", { recursive: true });

  for (const path of paths) {
    const response = await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, path);
    // These must be in server HTML for crawlers, without waiting for client JavaScript.
    const html = await response.text();
    assert.match(html, /<h1[\s>]/, `${path}: server-rendered heading`);
    assert.match(html, /name="description"/, `${path}: server-rendered description`);
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }));
    });
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogUrl: document.querySelector('meta[property="og:url"]')?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      twitter: document.querySelector('meta[name="twitter:card"]')?.content,
      structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent)),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      uploads: document.querySelectorAll('input[type="file"]').length,
      videos: document.querySelectorAll("video").length,
      activeNav: document.querySelectorAll(".primary-nav a.active").length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    assert.equal(info.h1, 1, `${path}: one main heading`);
    assert.equal(info.main, 1, `${path}: one main landmark`);
    assert(info.title && !titles.has(info.title), `${path}: unique title`);
    assert(info.description?.length >= 100 && !descriptions.has(info.description), `${path}: unique meaningful description`);
    titles.add(info.title); descriptions.add(info.description);
    assert.equal(info.canonical, `https://najikkosathi.com${path === "/" ? "/" : path}`, `${path}: canonical`);
    assert.equal(new URL(info.ogUrl).href, info.canonical, `${path}: matching social URL`);
    assert.equal(info.twitter, "summary_large_image");
    assert(info.ogImage, `${path}: social image`);
    previewImages.add(new URL(info.ogImage).pathname + new URL(info.ogImage).search);
    const schemaTypes = info.structuredData.flat().map((item) => item["@type"]);
    assert(schemaTypes.includes("Organization"), `${path}: organization schema`);
    if (path !== "/") assert(schemaTypes.includes("BreadcrumbList"), `${path}: breadcrumbs`);
    if (path.startsWith("/services/")) assert(schemaTypes.includes("Service"), `${path}: service schema`);
    assert.equal(schemaTypes.filter((type) => type === "VideoObject").length, info.videos, `${path}: video schema describes only actual players`);
    assert.equal(info.uploads, 0, `${path}: no public upload controls`);
    assert.equal(info.activeNav, 1, `${path}: correct active navigation`);
    assert.equal(info.overflow, false, `${path}: desktop overflow`);
    assert.deepEqual(info.brokenImages, [], `${path}: loaded images`);
    info.links.filter((href) => href.startsWith("/") || href.startsWith("#")).forEach((href) => links.add(new URL(href, `${origin}${path}`).href));
    if (["/", "/services", "/services/biography-videos", "/contact"].includes(path)) await page.screenshot({ path: `tmp/site-check/desktop-${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}.png`, fullPage: true });
    console.log(`PASS ${path}: content, metadata, schema, images, navigation`);
  }

  for (const href of links) {
    const target = new URL(href);
    assert(paths.includes(target.pathname), `Broken internal destination: ${href}`);
    if (target.hash) {
      await page.goto(`${origin}${target.pathname}`);
      assert.equal(await page.locator(`[id="${decodeURIComponent(target.hash.slice(1))}"]`).count(), 1, `Missing anchor: ${href}`);
    }
  }
  assert.equal(previewImages.size, 24, "Every page should have its own social image title");
  for (const preview of previewImages) {
    const response = await fetch(`${origin}${preview}`);
    assert.equal(response.status, 200, `Social image: ${preview}`);
    assert.match(response.headers.get("content-type"), /image\/png/);
    assert((await response.arrayBuffer()).byteLength > 1000);
  }
  assert.equal((await fetch(`${origin}/apple-icon`)).status, 200);
  assert.equal((await fetch(`${origin}/services/does-not-exist`)).status, 404);
  assert.equal((await fetch(`${origin}/does-not-exist`)).status, 404);
  assert.equal((await fetch(`${origin}/api/upload`, { method: "POST" })).status, 404);

  // Navigation should update URLs and active state, including browser history.
  await page.goto(origin);
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "About Us", exact: true }).click();
  await page.waitForURL("**/about");
  await page.goBack();
  await page.waitForURL(`${origin}/`);
  assert.equal(new URL(page.url()).pathname, "/");
  await page.goForward();
  await page.waitForURL(`${origin}/about`);
  assert.equal(new URL(page.url()).pathname, "/about");

  await page.goto(`${origin}/services/biography-videos`);
  await page.getByRole("link", { name: "Discuss this service" }).click();
  await page.waitForURL("**/contact?service=**");
  assert.equal(await page.getByLabel("What can we help with?").inputValue(), "Biography video production");
  assert.equal(await page.locator("form").evaluate((form) => form.checkValidity()), false, "Empty inquiry is rejected");
  await page.getByLabel("Your name", { exact: true }).fill("Preview test");
  await page.getByLabel("Your email", { exact: true }).fill("preview@example.com");
  await page.getByLabel("Tell us about your project").fill("A biography production inquiry for the preview test.");
  assert.equal(await page.locator("form").evaluate((form) => form.checkValidity()), true);
  // Do not open an external email application or send a test message.

  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of paths) {
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${path}: mobile overflow`);
    assert.equal(await page.getByRole("button", { name: "Open navigation" }).isVisible(), true);
    if (["/", "/services", "/contact"].includes(path)) {
      await page.screenshot({ path: `tmp/site-check/mobile-${path === "/" ? "home" : path.slice(1)}.png`, fullPage: true });
      await page.screenshot({ path: `tmp/site-check/mobile-${path === "/" ? "home" : path.slice(1)}-viewport.png` });
    }
  }
  await page.goto(origin);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Our Work", exact: true }).click();
  await page.waitForURL("**/our-work");
  assert.equal(await page.getByRole("button", { name: "Open navigation" }).getAttribute("aria-expanded"), "false");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true }).focus();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: "Open navigation" }).getAttribute("aria-expanded"), "false");
  const question = page.locator(".faq-list details").first();
  await question.locator("summary").click();
  assert.equal(await question.getAttribute("open"), "");
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/about", "/services", "/our-work", "/production", "/training", "/right-sanchar", "/contact"]) {
      await page.goto(`${origin}${path}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `${path}: overflow at ${width}px`);
    }
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS ${paths.length} desktop + ${paths.length} mobile pages, ${links.size} internal links, ${previewImages.size} social images, navigation history, FAQs, inquiry validation, and upload restrictions.`);
} finally {
  await browser?.close();
  server?.kill();
}
