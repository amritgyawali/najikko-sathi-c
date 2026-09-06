"use client";

import { LANGUAGES, LANGUAGE_LABELS, type Language } from "@/lib/i18n/config";
import { useLanguage } from "./language-provider";

/**
 * The English / Nepali switch in the top right of the header. It is a pair of
 * radio-style buttons rather than a single toggle so the language a visitor is
 * about to choose is always named on screen.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label="Website language / वेबसाइटको भाषा" data-no-translate>
      {LANGUAGES.map((option: Language) => {
        const labels = LANGUAGE_LABELS[option];
        const active = language === option;
        return (
          <button
            key={option}
            type="button"
            className={`lang-option${active ? " is-active" : ""}`}
            lang={option}
            aria-pressed={active}
            aria-label={labels.aria}
            title={labels.full}
            onClick={() => setLanguage(option)}
          >
            <span className="lang-option-short" aria-hidden="true">{labels.short}</span>
            <span className="lang-option-full">{labels.full}</span>
          </button>
        );
      })}
    </div>
  );
}
