import { translatePhrase, toNepaliDigits } from "./dictionary";
import type { Language } from "./config";

/**
 * Applies a language to the rendered document.
 *
 * The site is authored once, in English, and every page — including the copy
 * that comes from the dashboard — is rendered by the server. Rather than
 * duplicating the page tree per language, the chosen language is applied to the
 * document that is already on screen: each piece of text is looked up in the
 * phrase book, and the English it replaced is remembered so switching back is
 * exact.
 */

/** The English a node started with, so "back to English" is lossless. */
const originalText = new WeakMap<Text, string>();

/**
 * Text nodes whose Nepali is held by the first node of their run. Visiting one
 * of these on its own would translate its English fragment a second time and
 * print it twice, so the per-node pass leaves them to the run.
 */
const runManaged = new WeakSet<Text>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

/** Attributes a visitor can read or hear. */
const TRANSLATABLE_ATTRIBUTES = ["aria-label", "alt", "title", "placeholder", "aria-placeholder", "label"];

/** Elements whose text is markup, data, or code rather than copy. */
const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "PATH", "TEMPLATE"]);

/** Anything a visitor may want to copy verbatim keeps its Latin digits. */
const KEEPS_LATIN_DIGITS = 'a[href^="tel:"], a[href^="mailto:"], a[href^="http"], code, pre, input, [data-no-translate]';

function isSkipped(node: Node): boolean {
  const start = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  for (let element = start; element; element = element.parentElement) {
    if (SKIPPED_TAGS.has(element.tagName.toUpperCase())) return true;
    if (element.hasAttribute("data-no-translate")) return true;
    if (element.getAttribute("translate") === "no") return true;
  }
  return false;
}

function keepsLatinDigits(node: Node): boolean {
  const element = node.parentElement;
  return element ? Boolean(element.closest(KEEPS_LATIN_DIGITS)) : false;
}

/** Emails, URLs, and anything else that would break if its digits changed. */
const LOOKS_TECHNICAL = /[@]|:\/\/|^\+?[\d\s()-]+$/;

function toNepali(value: string, node: Node): string | null {
  const translated = translatePhrase(value);
  const base = translated ?? value;
  if (keepsLatinDigits(node) || LOOKS_TECHNICAL.test(value.trim())) {
    return translated ?? null;
  }
  const withDigits = toNepaliDigits(base);
  return withDigits === value ? null : withDigits;
}

function applyToTextNode(node: Text, language: Language): void {
  const remembered = originalText.get(node);
  const english = remembered ?? node.data;

  if (language === "en") {
    if (remembered !== undefined && node.data !== remembered) node.data = remembered;
    runManaged.delete(node);
    return;
  }

  if (runManaged.has(node)) return;

  // A node React has just re-rendered carries English again; retranslate it.
  const source = remembered !== undefined && node.data !== remembered ? english : node.data;
  if (!source.trim()) return;

  const nepali = toNepali(source, node);
  if (nepali === null) return;

  // Leading and trailing spaces separate inline elements, so keep them.
  const [, lead = "", , trail = ""] = source.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? [];
  originalText.set(node, source);
  node.data = `${lead}${nepali.trim()}${trail}`;
}

function applyToAttributes(element: Element, language: Language): void {
  const remembered = originalAttributes.get(element);

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    if (!element.hasAttribute(attribute)) continue;
    const current = element.getAttribute(attribute) ?? "";
    const english = remembered?.get(attribute) ?? current;

    if (language === "en") {
      if (remembered?.has(attribute) && current !== english) element.setAttribute(attribute, english);
      continue;
    }

    const source = remembered?.has(attribute) && current !== english ? english : current;
    if (!source.trim()) continue;

    const nepali = translatePhrase(source);
    if (!nepali) continue;

    const store = remembered ?? new Map<string, string>();
    store.set(attribute, source);
    originalAttributes.set(element, store);
    element.setAttribute(attribute, nepali);
  }
}

/** The page title and the description search engines and shares read. */
function applyToHead(language: Language): void {
  const metas = document.head.querySelectorAll<HTMLMetaElement>(
    'meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]',
  );

  for (const meta of metas) {
    const remembered = originalAttributes.get(meta)?.get("content");
    const english = remembered ?? meta.content;

    if (language === "en") {
      if (remembered !== undefined && meta.content !== remembered) meta.content = remembered;
      continue;
    }

    const nepali = translatePhrase(english);
    if (!nepali) continue;
    const store = originalAttributes.get(meta) ?? new Map<string, string>();
    store.set("content", english);
    originalAttributes.set(meta, store);
    meta.content = nepali;
  }
}

/**
 * A sentence written as `Explore {label}` reaches the browser as two text nodes
 * with a hydration comment between them. Looked at one node at a time it is a
 * bare verb and a bare noun; looked at together it is a phrase the phrase book
 * knows, and one Nepali word order can be chosen for the whole thing. So a run
 * of sibling text nodes is offered to the phrase book as a single string, and
 * the translation is written into the first node with the rest emptied.
 */
function applyToTextRun(run: Text[], language: Language, handled: Set<Text>): boolean {
  const english = run.map((node) => originalText.get(node) ?? node.data).join("");
  if (!english.trim()) return false;

  if (language === "en") {
    // Restoring is per node, so a run needs no special case beyond being
    // recognised as one; let the per-node pass put each piece back.
    return false;
  }

  const nepali = toNepali(english, run[0]);
  if (nepali === null) return false;

  const [, lead = "", , trail = ""] = english.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? [];
  run.forEach((node, index) => {
    if (!originalText.has(node)) originalText.set(node, node.data);
    node.data = index === 0 ? `${lead}${nepali.trim()}${trail}` : "";
    runManaged.add(node);
    handled.add(node);
  });
  return true;
}

/** Groups an element's children into runs of text separated only by comments. */
function applyToChildRuns(element: Element, language: Language, handled: Set<Text>): void {
  const children = Array.from(element.childNodes);
  let index = 0;

  while (index < children.length) {
    if (children[index].nodeType !== Node.TEXT_NODE) {
      index += 1;
      continue;
    }
    let end = index;
    for (let next = index + 1; next < children.length; next += 1) {
      const node = children[next];
      if (node.nodeType === Node.TEXT_NODE) end = next;
      else if (node.nodeType === Node.COMMENT_NODE) continue;
      else break;
    }
    const run = children.slice(index, end + 1).filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
    if (run.length > 1) applyToTextRun(run, language, handled);
    index = end + 1;
  }
}

/**
 * Walks a subtree and applies the language to every text node and translatable
 * attribute inside it. Safe to call repeatedly: nodes already in the target
 * language are left alone.
 */
export function applyLanguage(root: Node, language: Language): void {
  if (typeof document === "undefined") return;

  const handled = new Set<Text>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      if (isSkipped(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // The root itself is not visited by the walker.
  if (root.nodeType === Node.ELEMENT_NODE && !isSkipped(root)) {
    applyToAttributes(root as Element, language);
    applyToChildRuns(root as Element, language, handled);
  }
  if (root.nodeType === Node.TEXT_NODE && !isSkipped(root)) {
    const text = root as Text;
    if (runManaged.has(text) && text.parentElement) applyToChildRuns(text.parentElement, language, handled);
    else applyToTextNode(text, language);
  }

  const elements: Element[] = [];
  const texts: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) texts.push(node as Text);
    else elements.push(node as Element);
  }

  for (const element of elements) {
    applyToAttributes(element, language);
    applyToChildRuns(element, language, handled);
  }
  for (const text of texts) {
    if (!handled.has(text)) applyToTextNode(text, language);
  }
}

/** Applies the language to the whole document, head included. */
export function applyLanguageToDocument(language: Language): void {
  if (typeof document === "undefined") return;
  const title = document.querySelector("title");
  if (title) applyLanguage(title, language);
  applyToHead(language);
  applyLanguage(document.body, language);
}
