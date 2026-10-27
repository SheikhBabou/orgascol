"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

const NAV_LINKS = [
  { label: "Comment ça marche", href: "/#fonctionnalités" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGU", href: "/cgu" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-foreground text-background rounded-t-[3rem] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold">Orga&apos;Scol</span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs">
              L&apos;outil de planification de révisions qui aide les étudiants
              à s&apos;organiser et réussir.
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
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`block text-sm transition-colors ${
                    pathname === href
                      ? "text-primary font-medium"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Légal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
              Légal
            </h4>
            <div className="space-y-2">
              {LEGAL_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`block text-sm transition-colors ${
                    pathname === href
                      ? "text-primary font-medium"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
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
  );
}
