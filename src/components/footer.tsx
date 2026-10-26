"use client";

import { useState, useEffect } from "react";
import { GraduationCap, X, ExternalLink } from "lucide-react";

type PageKey =
  | "mentions-legales"
  | "confidentialite"
  | "cgu"
  | "faq"
  | "contact";

const PAGES: { key: PageKey; title: string; shortTitle: string; href: string }[] = [
  { key: "mentions-legales", title: "Mentions légales", shortTitle: "Mentions", href: "/mentions-legales" },
  { key: "confidentialite", title: "Politique de confidentialité", shortTitle: "Confidentialité", href: "/confidentialite" },
  { key: "cgu", title: "Conditions Générales d'Utilisation", shortTitle: "CGU", href: "/cgu" },
  { key: "faq", title: "Questions fréquentes", shortTitle: "FAQ", href: "/faq" },
  { key: "contact", title: "Contact", shortTitle: "Contact", href: "/contact" },
];

export default function Footer() {
  const [activePage, setActivePage] = useState<PageKey | null>(null);

  useEffect(() => {
    if (activePage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActivePage(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeData = PAGES.find((p) => p.key === activePage);

  return (
    <>
      {/* ── Modal overlay ── */}
      {activePage && activeData && (
        <div className="fixed inset-0 z-[60] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActivePage(null)}
          />

          {/* Content panel */}
          <div className="relative z-10 flex-1 flex flex-col items-center pt-6 pb-4 px-4 min-h-0">
            <div className="w-full max-w-4xl flex-1 flex flex-col min-h-0">
              {/* Header bar */}
              <div className="flex items-center justify-between bg-card-bg/95 backdrop-blur-xl rounded-t-2xl px-6 py-4 border border-border border-b-0 shrink-0">
                <h2 className="font-bold text-foreground truncate mr-4">
                  {activeData.title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeData.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-background transition-colors"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setActivePage(null)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Iframe content */}
              <div className="flex-1 bg-background rounded-b-2xl border border-t-0 border-border overflow-hidden min-h-0 shadow-2xl">
                <iframe
                  key={activePage}
                  src={`${activeData.href}?embed=1`}
                  className="w-full h-full border-0"
                  title={activeData.title}
                />
              </div>
            </div>
          </div>

          {/* Compact footer bar for switching pages */}
          <div className="relative z-10 bg-foreground text-background shrink-0 px-4 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm hidden sm:inline">
                  Orga&apos;Scol
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {PAGES.map((page) => (
                  <button
                    key={page.key}
                    onClick={() => setActivePage(page.key)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activePage === page.key
                        ? "bg-primary text-white"
                        : "text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {page.shortTitle}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Normal footer ── */}
      <footer className="relative z-50 bg-foreground text-background rounded-t-[3rem] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Logo */}
            <div className="space-y-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold">Orga&apos;Scol</span>
              </a>
              <p className="text-sm text-white/40 max-w-xs">
                L&apos;outil de planification de révisions qui aide les
                étudiants à s&apos;organiser et réussir.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                <span className="text-xs font-mono text-white/40">
                  Système opérationnel
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
                Navigation
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Accueil", anchor: "#" },
                  { label: "Comment ça marche", anchor: "#fonctionnalités" },
                  { label: "Tarifs", anchor: "#tarifs" },
                ].map(({ label, anchor }) => (
                  <a
                    key={label}
                    href={anchor}
                    className="block text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                ))}
                {(["faq", "contact"] as PageKey[]).map((key) => {
                  const page = PAGES.find((p) => p.key === key)!;
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePage(key)}
                      className={`block text-sm transition-colors text-left ${
                        activePage === key
                          ? "text-primary font-medium"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {page.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Légal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
                Légal
              </h4>
              <div className="space-y-2">
                {(["mentions-legales", "confidentialite", "cgu"] as PageKey[]).map(
                  (key) => {
                    const page = PAGES.find((p) => p.key === key)!;
                    return (
                      <button
                        key={key}
                        onClick={() => setActivePage(key)}
                        className={`block text-sm transition-colors text-left ${
                          activePage === key
                            ? "text-primary font-medium"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {page.title}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} Orga&apos;Scol. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
