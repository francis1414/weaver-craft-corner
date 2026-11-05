import { useEffect, useState } from "react";

type Lang = "en" | "fr";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: object, id: string) => unknown } };
  }
}

function readLang(): Lang {
  return /googtrans=\/en\/fr/.test(document.cookie) ? "fr" : "en";
}

function setCookie(value: string | null) {
  const host = window.location.hostname;
  const domains = ["", host, host.split(".").slice(-2).join(".")];
  for (const d of domains) {
    const domainPart = d ? `;domain=.${d.replace(/^\./, "")}` : "";
    document.cookie = value
      ? `googtrans=${value};path=/${domainPart}`
      : `googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
  }
}

/** EN / FR switch powered by Google's page translator (translates products & CMS text too). */
export function LanguageToggle() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const current = readLang();
    setLang(current);
    document.documentElement.lang = current;
    if (current === "fr" && !document.getElementById("gt-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate) {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", includedLanguages: "en,fr", autoDisplay: false },
            "gt-element",
          );
        }
      };
      const s = document.createElement("script");
      s.id = "gt-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const choose = (next: Lang) => {
    if (next === lang) return;
    setCookie(next === "fr" ? "/en/fr" : null);
    window.location.reload();
  };

  return (
    <div className="notranslate mr-1 inline-flex h-11 items-center border border-border text-[11px] uppercase tracking-[0.16em]" translate="no">
      <div id="gt-element" className="hidden" />
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={lang === l}
          aria-label={l === "en" ? "English" : "Français"}
          className={`h-full px-3 transition-colors ${lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-gold"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
