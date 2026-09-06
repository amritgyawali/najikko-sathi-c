"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { applyLanguage, applyLanguageToDocument } from "@/lib/i18n/apply";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  type Language,
} from "@/lib/i18n/config";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

function remember(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Private browsing can refuse storage; the cookie below still carries it.
  }
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
}

/** Runs a callback once the page has loaded and the browser has a moment. */
function whenIdle(callback: () => void): () => void {
  let idle = 0;
  let timer = 0;

  const schedule = () => {
    const request = window.requestIdleCallback;
    if (typeof request === "function") idle = request(callback, { timeout: 500 });
    else timer = window.setTimeout(callback, 0);
  };

  if (document.readyState === "complete") {
    schedule();
    return () => {
      if (idle) window.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
    };
  }

  window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback?.(idle);
    if (timer) window.clearTimeout(timer);
  };
}

/**
 * Holds the visitor's language for the session and keeps the rendered page in
 * that language.
 *
 * The server renders English and marks the document with the language from the
 * cookie. Here that choice is applied to the document itself, and an observer
 * carries it over to anything React renders afterwards — a page navigation, an
 * opened menu, a submitted form's reply — so nothing reverts to English mid
 * visit.
 */
export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  // The observer below outlives each render, so it reads the current language
  // from a ref rather than from a captured value.
  const languageRef = useRef(language);
  const appliedOnce = useRef(false);

  // A cookie the server could not read (a static response, a cleared cookie)
  // should not lose a choice the browser still remembers.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored) {
      const restored = normalizeLanguage(stored);
      if (restored !== languageRef.current) setLanguageState(restored);
      else remember(restored);
    }
  }, []);

  useEffect(() => {
    languageRef.current = language;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    remember(language);

    // Parts of a page hydrate after this effect runs — the contact form waits
    // on its search params, so React hydrates it in a later task — and
    // rewriting their text first makes React discard that section and render it
    // again. The pass that follows the first paint therefore yields until the
    // browser is idle; a language the visitor clicks is applied at once,
    // because by then hydration is long finished.
    if (appliedOnce.current) {
      applyLanguageToDocument(language);
      return;
    }

    appliedOnce.current = true;
    const apply = () => applyLanguageToDocument(languageRef.current);
    const cancel = whenIdle(apply);
    return cancel;
  }, [language]);

  // Everything React renders after the first pass — route changes, streamed
  // sections, client-rendered messages — arrives in English and is translated
  // as it lands.
  useEffect(() => {
    let frame = 0;
    const pending: Node[] = [];

    const flush = () => {
      frame = 0;
      const nodes = pending.splice(0, pending.length);
      if (languageRef.current === DEFAULT_LANGUAGE) return;
      observer.disconnect();
      for (const node of nodes) {
        if (node.isConnected) applyLanguage(node, languageRef.current);
      }
      observe();
    };

    const observer = new MutationObserver((records) => {
      if (languageRef.current === DEFAULT_LANGUAGE) return;
      for (const record of records) {
        if (record.type === "characterData") pending.push(record.target);
        else record.addedNodes.forEach((node) => pending.push(node));
      }
      if (pending.length > 0 && frame === 0) frame = window.requestAnimationFrame(flush);
    });

    const observe = () =>
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
      });

    observe();
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(normalizeLanguage(next));
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
